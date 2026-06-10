import analyticsRepository from '../repositories/analytics.repository.js';
import leaderboardRepository from '../repositories/leaderboard.repository.js';
import userRepository from '../repositories/user.repository.js';
import { getPeriodBounds, PERIODS } from '../utils/period.utils.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const MAX_RANKINGS = 100;

const buildRankings = (users, xpField = 'totalXP') =>
  users.map((user, index) => ({
    userId: user.userId || user._id,
    username: user.username,
    displayName: user.displayName || user.username,
    avatar: user.avatar || '',
    totalXP: user[xpField] ?? user.periodXP ?? user.totalXP ?? 0,
    level: user.level ?? 1,
    rank: index + 1,
  }));

const leaderboardService = {
  async compute(period, referenceDate = new Date()) {
    const { periodStart, periodEnd } = getPeriodBounds(period, referenceDate);

    let rankings;

    if (period === 'alltime') {
      const users = await analyticsRepository.rankUsersAllTime(MAX_RANKINGS);
      rankings = buildRankings(users, 'totalXP');
    } else {
      const users = await analyticsRepository.rankUsersByPeriodXP(
        periodStart,
        periodEnd,
        MAX_RANKINGS
      );
      rankings = buildRankings(
        users.map((u) => ({
          ...u,
          totalXP: u.periodXP,
        })),
        'totalXP'
      );
    }

    const doc = await leaderboardRepository.upsert(period, periodStart, {
      period,
      periodStart,
      periodEnd: period === 'alltime' ? undefined : periodEnd,
      rankings,
    });

    logger.info(`Leaderboard computed: ${period} (${rankings.length} entries)`);
    return doc;
  },

  async computeAll() {
    const results = await Promise.all(PERIODS.map((period) => this.compute(period)));
    return results;
  },

  async get(period = 'weekly') {
    if (!PERIODS.includes(period)) {
      throw new AppError('Invalid leaderboard period', 400, 'VALIDATION_ERROR');
    }

    const { periodStart } = getPeriodBounds(period);
    let leaderboard = await leaderboardRepository.findByPeriodAndStart(period, periodStart);

    if (!leaderboard) {
      leaderboard = await this.compute(period);
    }

    return {
      period: leaderboard.period,
      periodStart: leaderboard.periodStart,
      periodEnd: leaderboard.periodEnd,
      computedAt: leaderboard.computedAt,
      rankings: leaderboard.rankings,
    };
  },

  async getUserRank(userId, period = 'weekly') {
    const leaderboard = await this.get(period);
    const userIdStr = userId.toString();

    const entry = leaderboard.rankings.find((r) => r.userId.toString() === userIdStr);

    if (entry) {
      return {
        rank: entry.rank,
        totalXP: entry.totalXP,
        level: entry.level,
        period,
        inTop100: true,
      };
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      rank: null,
      totalXP: user.totalXP,
      level: user.level,
      period,
      inTop100: false,
    };
  },
};

export default leaderboardService;
