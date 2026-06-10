import userRepository from '../repositories/user.repository.js';
import achievementRepository from '../repositories/achievement.repository.js';
import analyticsRepository from '../repositories/analytics.repository.js';
import leaderboardService from './leaderboard.service.js';
import githubService from './github.service.js';
import AppError from '../utils/AppError.js';
import { levelProgress } from '../utils/level.calculator.js';

const userService = {
  async getPublicProfile(username) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isProfilePublic) {
      throw new AppError('This profile is private', 403, 'PROFILE_PRIVATE');
    }

    const [achievements, recentActivity, rank, github] = await Promise.all([
      achievementRepository.findByUser(user._id),
      analyticsRepository.recentEntries(user._id, 5),
      leaderboardService.getUserRank(user._id, 'alltime'),
      githubService.getPublicStats(username),
    ]);

    return {
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar,
      bio: user.bio,
      githubUsername: user.githubUsername,
      totalXP: user.totalXP,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      ...levelProgress(user.totalXP),
      achievements: achievements.map((a) => ({
        achievementId: a.achievementId,
        title: a.title,
        icon: a.icon,
        unlockedAt: a.unlockedAt,
      })),
      recentActivity: recentActivity.map((e) => ({
        type: e.type,
        title: e.title,
        durationMinutes: e.durationMinutes,
        date: e.date,
        xpEarned: e.xpEarned,
      })),
      leaderboardRank: rank,
      github: github || null,
      memberSince: user.createdAt,
    };
  },
};

export default userService;
