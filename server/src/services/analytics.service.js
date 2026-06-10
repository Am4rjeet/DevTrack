import analyticsRepository from '../repositories/analytics.repository.js';
import userRepository from '../repositories/user.repository.js';
import goalRepository from '../repositories/goal.repository.js';
import { getDefaultDateRange } from '../utils/period.utils.js';
import { buildHeatmapGrid } from '../utils/heatmap.utils.js';
import { levelProgress } from '../utils/level.calculator.js';

const parseDateRange = (query) => {
  const days = Number(query.days) || 30;
  if (query.from && query.to) {
    return { from: new Date(query.from), to: new Date(query.to) };
  }
  return getDefaultDateRange(days);
};

const analyticsService = {
  async getOverview(userId, query = {}) {
    const { from, to } = parseDateRange(query);

    const [byType, xpBySource, user, activeGoals] = await Promise.all([
      analyticsRepository.hoursByType(userId, from, to),
      analyticsRepository.xpBySource(userId, from, to),
      userRepository.findById(userId),
      goalRepository.findByUser(userId, { status: 'active', limit: 1 }),
    ]);

    const totalMinutes = byType.reduce((sum, t) => sum + t.totalMinutes, 0);
    const totalXPInPeriod = xpBySource.reduce((sum, s) => sum + s.totalXP, 0);
    const totalEntries = byType.reduce((sum, t) => sum + t.count, 0);

    return {
      period: { from, to },
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalEntries,
      totalXPInPeriod,
      byType: byType.map((t) => ({
        type: t._id,
        totalMinutes: t.totalMinutes,
        totalHours: Math.round((t.totalMinutes / 60) * 10) / 10,
        count: t.count,
      })),
      xpBySource: xpBySource.map((s) => ({
        source: s._id,
        totalXP: s.totalXP,
        count: s.count,
      })),
      gamification: {
        totalXP: user?.totalXP ?? 0,
        level: user?.level ?? 1,
        currentStreak: user?.currentStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        ...levelProgress(user?.totalXP ?? 0),
      },
      activeGoalsCount: activeGoals[1],
    };
  },

  async getHoursChart(userId, query = {}) {
    const { from, to } = parseDateRange(query);
    const granularity = query.granularity === 'week' ? 'week' : 'day';

    const data =
      granularity === 'week'
        ? await analyticsRepository.hoursByWeek(userId, from, to)
        : await analyticsRepository.hoursByDay(userId, from, to);

    return {
      granularity,
      period: { from, to },
      data: data.map((d) => ({
        label: d._id,
        totalMinutes: d.totalMinutes,
        totalHours: Math.round((d.totalMinutes / 60) * 10) / 10,
        count: d.count ?? 0,
      })),
    };
  },

  async getXPChart(userId, query = {}) {
    const { from, to } = parseDateRange(query);
    const data = await analyticsRepository.xpOverTime(userId, from, to);

    return {
      period: { from, to },
      data: data.map((d) => ({
        date: d._id,
        totalXP: d.totalXP,
        count: d.count,
      })),
    };
  },

  async getDSABreakdown(userId, query = {}) {
    const { from, to } = parseDateRange(query);
    const data = await analyticsRepository.dsaByDifficulty(userId, from, to);

    return {
      period: { from, to },
      data: data.map((d) => ({
        difficulty: d._id,
        count: d.count,
        totalMinutes: d.totalMinutes,
      })),
      total: data.reduce((sum, d) => sum + d.count, 0),
    };
  },

  async getHeatmap(userId, query = {}) {
    const days = Math.min(Number(query.days) || 365, 365);
    const raw = await analyticsRepository.heatmapData(userId, days);
    const grid = buildHeatmapGrid(raw, days);

    const totalMinutes = grid.reduce((sum, d) => sum + d.totalMinutes, 0);
    const activeDays = grid.filter((d) => d.count > 0).length;

    return {
      days,
      grid,
      summary: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        activeDays,
        averageMinutesPerActiveDay:
          activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0,
      },
    };
  },
};

export default analyticsService;
