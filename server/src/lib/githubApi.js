import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'DEVTRACK-App';

class GitHubApiError extends Error {
  constructor(message, statusCode, rateLimit = null) {
    super(message);
    this.name = 'GitHubApiError';
    this.statusCode = statusCode;
    this.rateLimit = rateLimit;
  }
}

const buildHeaders = (token) => {
  const authToken = token || env.GITHUB_TOKEN || null;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

const parseRateLimit = (response) => ({
  limit: Number(response.headers.get('x-ratelimit-limit') || 0),
  remaining: Number(response.headers.get('x-ratelimit-remaining') || 0),
  reset: Number(response.headers.get('x-ratelimit-reset') || 0),
});

const githubFetch = async (path, token = null) => {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: buildHeaders(token),
  });

  const rateLimit = parseRateLimit(response);

  if (response.status === 404) {
    throw new GitHubApiError('GitHub user not found', 404, rateLimit);
  }

  if (response.status === 403 && rateLimit.remaining === 0) {
    throw new GitHubApiError(
      'GitHub rate limit hit. Try again in a few minutes.',
      429,
      rateLimit
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new GitHubApiError(
      body.message || `GitHub API error: ${response.status}`,
      response.status,
      rateLimit
    );
  }

  return { data: await response.json(), rateLimit };
};

const fetchUserProfile = async (username, token = null) => {
  const { data } = await githubFetch(`/users/${encodeURIComponent(username)}`, token);
  return data;
};

const fetchUserRepos = async (username, token = null, perPage = 10) => {
  const { data } = await githubFetch(
    `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}`,
    token
  );
  return data;
};

const fetchUserEvents = async (username, token = null, perPage = 30) => {
  const { data } = await githubFetch(
    `/users/${encodeURIComponent(username)}/events/public?per_page=${perPage}`,
    token
  );
  return data;
};

const exchangeOAuthCode = async (code) => {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    throw new AppError('GitHub OAuth is not configured', 503, 'OAUTH_NOT_CONFIGURED');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_OAUTH_CALLBACK_URL,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new AppError(data.error_description || data.error, 400, 'OAUTH_ERROR');
  }

  return data.access_token;
};

const parseRecentCommits = (events, maxCommits = 20) => {
  const commits = [];

  for (const event of events) {
    if (event.type !== 'PushEvent' || !event.payload?.commits) continue;

    const repo = event.repo?.name || 'unknown';

    for (const commit of event.payload.commits) {
      commits.push({
        repo,
        message: commit.message,
        date: new Date(event.created_at),
        sha: commit.sha,
        url: `https://github.com/${repo}/commit/${commit.sha}`,
      });

      if (commits.length >= maxCommits) return commits;
    }
  }

  return commits;
};

const mapRepos = (repos) =>
  repos.slice(0, 10).map((repo) => ({
    name: repo.name,
    stars: repo.stargazers_count ?? 0,
    language: repo.language,
    url: repo.html_url,
    description: repo.description,
    updatedAt: repo.updated_at ? new Date(repo.updated_at) : undefined,
  }));

const mapProfile = (user) => ({
  name: user.name,
  avatar: user.avatar_url,
  bio: user.bio,
  location: user.location,
  company: user.company,
  blog: user.blog,
  htmlUrl: user.html_url,
});

export {
  GitHubApiError,
  githubFetch,
  fetchUserProfile,
  fetchUserRepos,
  fetchUserEvents,
  exchangeOAuthCode,
  parseRecentCommits,
  mapRepos,
  mapProfile,
};
