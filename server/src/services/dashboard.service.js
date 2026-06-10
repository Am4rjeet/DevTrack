import analyticsRepository from '../repositories/analytics.repository.js';
import userRepository from '../repositories/user.repository.js';
import goalRepository from '../repositories/goal.repository.js';
import achievementRepository from '../repositories/achievement.repository.js';
import analyticsService from './analytics.service.js';
import leaderboardService from './leaderboard.service.js';
import { levelProgress } from '../utils/level.calculator.js';
import { getPeriodBounds } from '../utils/period.utils.js';
import { buildHeatmapGrid } from '../utils/heatmap.utils.js';
import githubService from './github.service.js';

const dashboardService = {
  async getDashboard(userId) {
    const { periodStart, periodEnd } = getPeriodBounds('weekly');
    const user = await userRepository.findById(userId);

    const [
      overview,
      recentActivity,
      activeGoals,
      recentAchievements,
      heatmapRaw,
      weeklyByDay,
      leaderboardRank,
      githubStatus,
    ] = await Promise.all([
      analyticsService.getOverview(userId, { days: 7 }),
      analyticsRepository.recentEntries(userId, 5),
      goalRepository.findByUser(userId, { status: 'active', limit: 5 }),
      achievementRepository.findByUser(userId).then((a) => a.slice(0, 3)),
      analyticsRepository.heatmapData(userId, 84),
      analyticsRepository.hoursByDay(userId, periodStart, periodEnd),
      leaderboardService.getUserRank(userId, 'weekly'),
      githubService.getStats(userId),
    ]);

    const heatmap = buildHeatmapGrid(heatmapRaw, 84);
    const weeklyMinutes = weeklyByDay.reduce((sum, d) => sum + d.totalMinutes, 0);
    const weeklyGoalHours = user?.preferences?.weeklyGoalHours ?? 10;
    const weeklyGoalMinutes = weeklyGoalHours * 60;

    return {
      user: {
        username: user?.username,
        displayName: user?.displayName,
        avatar: user?.avatar,
        totalXP: user?.totalXP ?? 0,
        level: user?.level ?? 1,
        currentStreak: user?.currentStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        ...levelProgress(user?.totalXP ?? 0),
      },
      weeklyProgress: {
        totalMinutes: weeklyMinutes,
        totalHours: Math.round((weeklyMinutes / 60) * 10) / 10,
        goalHours: weeklyGoalHours,
        goalMinutes: weeklyGoalMinutes,
        percentComplete: Math.min(
          100,
          Math.round((weeklyMinutes / weeklyGoalMinutes) * 100)
        ),
        byDay: weeklyByDay.map((d) => ({
          date: d._id,
          totalMinutes: d.totalMinutes,
        })),
      },
      overview,
      recentActivity,
      activeGoals: activeGoals[0],
      activeGoalsCount: activeGoals[1],
      recentAchievements,
      heatmap,
      leaderboardRank,
      github: githubStatus,
    };
  },
};

export default dashboardService;
