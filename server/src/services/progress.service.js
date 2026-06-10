import mongoose from 'mongoose';
import progressRepository from '../repositories/progress.repository.js';
import userRepository from '../repositories/user.repository.js';
import AppError from '../utils/AppError.js';
import { calculateProgressXP } from '../utils/xp.calculator.js';
import { levelProgress } from '../utils/level.calculator.js';
import xpService from './xp.service.js';
import streakService from './streak.service.js';
import achievementService from './achievement.service.js';

const progressService = {
  async create(userId, data) {
    const xpEarned = calculateProgressXP(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const entry = await progressRepository.create(
        {
          ...data,
          userId,
          date: new Date(data.date),
          xpEarned,
        },
        session
      );

      await xpService.awardXP(userId, xpEarned, {
        source: 'progress',
        referenceId: entry._id,
        referenceModel: 'ProgressEntry',
        description: `Progress: ${data.title}`,
        session,
      });

      await session.commitTransaction();

      const streak = await streakService.updateStreak(userId, entry.date);
      const achievements = await achievementService.checkAfterProgress(userId, entry);

      const user = await userRepository.findById(userId);

      return { entry, xpEarned, streak, achievements, user };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getAll(userId, query) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);

    const [entries, total] = await progressRepository.findByUser(userId, {
      type: query.type,
      from: query.from,
      to: query.to,
      page,
      limit,
    });

    return { entries, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async getById(userId, entryId) {
    const entry = await progressRepository.findByIdAndUser(entryId, userId);
    if (!entry) throw new AppError('Progress entry not found', 404, 'NOT_FOUND');
    return entry;
  },

  async update(userId, entryId, data) {
    const entry = await progressRepository.findByIdAndUser(entryId, userId);
    if (!entry) throw new AppError('Progress entry not found', 404, 'NOT_FOUND');

    const previousXP = entry.xpEarned;

    Object.assign(entry, {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    });

    entry.xpEarned = calculateProgressXP(entry);
    await progressRepository.update(entry);

    const xpDiff = entry.xpEarned - previousXP;
    if (xpDiff !== 0) {
      await xpService.awardXP(userId, xpDiff, {
        source: 'progress',
        referenceId: entry._id,
        referenceModel: 'ProgressEntry',
        description: `Progress updated: ${entry.title}`,
      });
    }

    return entry;
  },

  async delete(userId, entryId) {
    const entry = await progressRepository.findByIdAndUser(entryId, userId);
    if (!entry) throw new AppError('Progress entry not found', 404, 'NOT_FOUND');

    if (entry.xpEarned > 0) {
      await xpService.deductXP(userId, entry.xpEarned, {
        source: 'progress',
        referenceId: entry._id,
        referenceModel: 'ProgressEntry',
        description: `Progress deleted: ${entry.title}`,
      });
    }

    await progressRepository.deleteById(entryId, userId);
    return { message: 'Progress entry deleted' };
  },

  async getSummary(userId, { from, to } = {}) {
    const user = await userRepository.findById(userId);
    const [byType, byDate, totalEntries] = await Promise.all([
      progressRepository.aggregateStats(userId),
      progressRepository.aggregateByDate(userId, from, to),
      progressRepository.countByUser(userId),
    ]);

    const typeStats = byType.reduce(
      (acc, item) => {
        acc[item._id] = {
          totalMinutes: item.totalMinutes,
          totalXP: item.totalXP,
          count: item.count,
        };
        return acc;
      },
      {}
    );

    const totalMinutes = byType.reduce((sum, item) => sum + item.totalMinutes, 0);

    return {
      totalEntries,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      byType: typeStats,
      activityByDate: byDate.map((d) => ({
        date: d._id,
        totalMinutes: d.totalMinutes,
        count: d.count,
      })),
      gamification: {
        totalXP: user?.totalXP ?? 0,
        level: user?.level ?? 1,
        currentStreak: user?.currentStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        ...levelProgress(user?.totalXP ?? 0),
      },
    };
  },
};

export default progressService;
