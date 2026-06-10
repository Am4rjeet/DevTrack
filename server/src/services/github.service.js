import env from '../config/env.js';
import userRepository from '../repositories/user.repository.js';
import githubStatsRepository from '../repositories/githubStats.repository.js';
import {
  githubFetch,
  fetchUserProfile,
  fetchUserRepos,
  fetchUserEvents,
  exchangeOAuthCode,
  parseRecentCommits,
  mapRepos,
  mapProfile,
  GitHubApiError,
} from '../lib/githubApi.js';
import { encrypt, decrypt, isEncryptionConfigured } from '../utils/encryption.utils.js';
import {
  signOAuthState,
  verifyOAuthState,
  getOAuthAuthorizeUrl,
  isOAuthConfigured,
} from '../utils/githubOAuth.utils.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const CACHE_TTL_MS = 3_600_000; // 1 hour

const formatStatsResponse = (stats) => ({
  githubUsername: stats.githubUsername,
  profile: stats.profile,
  followers: stats.followers,
  following: stats.following,
  publicRepos: stats.publicRepos,
  repositories: stats.repositories,
  recentCommits: stats.recentCommits,
  lastSyncedAt: stats.lastSyncedAt,
  syncStatus: stats.syncStatus,
});

const resolveToken = (stats) => {
  if (!stats?.accessToken) return null;
  try {
    return decrypt(stats.accessToken);
  } catch {
    return null;
  }
};

const githubService = {
  isOAuthConfigured,

  async connect(userId, { githubUsername, accessToken }) {
    const username = githubUsername.toLowerCase().trim();

    const existing = await githubStatsRepository.findByGithubUsername(username);
    if (existing && existing.userId.toString() !== userId.toString()) {
      throw new AppError('This GitHub account is linked to another user', 409, 'GITHUB_ALREADY_LINKED');
    }

    let encryptedToken;
    if (accessToken) {
      if (!isEncryptionConfigured()) {
        throw new AppError(
          'Server encryption is not configured. Set ENCRYPTION_KEY in .env',
          500,
          'ENCRYPTION_NOT_CONFIGURED'
        );
      }
      encryptedToken = encrypt(accessToken);
    }

    await githubStatsRepository.upsert(userId, {
      githubUsername: username,
      ...(encryptedToken && { accessToken: encryptedToken }),
      syncStatus: 'syncing',
    });

    const user = await userRepository.findById(userId);
    if (user) {
      user.githubUsername = username;
      if (!user.avatar && !accessToken) {
        // Avatar set after first sync
      }
      await userRepository.save(user);
    }

    return this.sync(userId, { force: true });
  },

  async sync(userId, { force = false } = {}) {
    let stats = await githubStatsRepository.findByUserIdWithToken(userId);

    if (!stats) {
      throw new AppError('GitHub account not connected', 404, 'GITHUB_NOT_CONNECTED');
    }

    if (!force && !stats.isStale(CACHE_TTL_MS)) {
      return { stats: formatStatsResponse(stats), cached: true };
    }

    const token = resolveToken(stats);

    if (!token && !env.GITHUB_TOKEN) {
      throw new AppError(
        'Add GITHUB_TOKEN to server .env or connect with a personal access token',
        503,
        'GITHUB_TOKEN_MISSING'
      );
    }

    stats.syncStatus = 'syncing';
    stats.syncError = undefined;
    await stats.save();

    try {
      const apiToken = token || env.GITHUB_TOKEN;
      const username = stats.githubUsername;

      const [profile, repos, events] = await Promise.all([
        fetchUserProfile(username, apiToken),
        fetchUserRepos(username, apiToken),
        fetchUserEvents(username, apiToken),
      ]);

      const recentCommits = parseRecentCommits(events);

      stats.profile = mapProfile(profile);
      stats.followers = profile.followers ?? 0;
      stats.following = profile.following ?? 0;
      stats.publicRepos = profile.public_repos ?? 0;
      stats.repositories = mapRepos(repos);
      stats.recentCommits = recentCommits;
      stats.lastSyncedAt = new Date();
      stats.syncStatus = 'idle';
      await stats.save();

      const user = await userRepository.findById(userId);
      if (user) {
        user.githubUsername = username;
        if (profile.avatar_url && !user.avatar) {
          user.avatar = profile.avatar_url;
        }
        await userRepository.save(user);
      }

      return { stats: formatStatsResponse(stats), cached: false };
    } catch (error) {
      stats.syncStatus = 'error';
      stats.syncError = error.message;
      await stats.save();

      if (error instanceof GitHubApiError) {
        throw new AppError(error.message, error.statusCode === 404 ? 404 : 502, 'GITHUB_API_ERROR', {
          rateLimit: error.rateLimit,
        });
      }
      throw error;
    }
  },

  async getStats(userId, { refresh = false } = {}) {
    const stats = await githubStatsRepository.findByUserId(userId);

    if (!stats) {
      return { connected: false, stats: null };
    }

    if (refresh || stats.isStale(CACHE_TTL_MS)) {
      const result = await this.sync(userId, { force: refresh });
      return { connected: true, ...result };
    }

    return { connected: true, stats: formatStatsResponse(stats), cached: true };
  },

  async disconnect(userId) {
    await githubStatsRepository.deleteByUserId(userId);

    const user = await userRepository.findById(userId);
    if (user) {
      user.githubUsername = undefined;
      await userRepository.save(user);
    }

    return { message: 'GitHub account disconnected' };
  },

  async getStatus(userId) {
    const stats = await githubStatsRepository.findByUserId(userId);

    if (!stats) {
      return { connected: false };
    }

    return {
      connected: true,
      githubUsername: stats.githubUsername,
      lastSyncedAt: stats.lastSyncedAt,
      syncStatus: stats.syncStatus,
      syncError: stats.syncError,
      isStale: stats.isStale(CACHE_TTL_MS),
    };
  },

  getOAuthUrl(userId) {
    if (!isOAuthConfigured()) {
      throw new AppError('GitHub OAuth is not configured on the server', 503, 'OAUTH_NOT_CONFIGURED');
    }

    const state = signOAuthState(userId);
    return getOAuthAuthorizeUrl(state);
  },

  async handleOAuthCallback(code, state) {
    const userId = verifyOAuthState(state);
    const accessToken = await exchangeOAuthCode(code);

    const { data: profile } = await githubFetch('/user', accessToken);
    const githubUsername = profile.login?.toLowerCase();
    if (!githubUsername) {
      throw new AppError('Could not retrieve GitHub username', 502, 'GITHUB_API_ERROR');
    }

    if (!isEncryptionConfigured()) {
      throw new AppError('ENCRYPTION_KEY is required for OAuth', 500, 'ENCRYPTION_NOT_CONFIGURED');
    }

    await this.connect(userId, { githubUsername, accessToken });

    logger.info(`GitHub OAuth connected for user ${userId} → @${githubUsername}`);

    return { userId, githubUsername };
  },

  async getPublicStats(username) {
    const user = await userRepository.findByUsername(username);
    if (!user?.githubUsername) return null;

    const stats = await githubStatsRepository.findByUserId(user._id);
    if (!stats) return null;

    if (stats.isStale(CACHE_TTL_MS)) {
      try {
        await this.sync(user._id);
        const refreshed = await githubStatsRepository.findByUserId(user._id);
        return formatStatsResponse(refreshed);
      } catch (error) {
        logger.warn(`Public GitHub sync failed for @${username}:`, error.message);
        return formatStatsResponse(stats);
      }
    }

    return formatStatsResponse(stats);
  },
};

export default githubService;
