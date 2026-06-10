import achievementService from '../services/achievement.service.js';
import xpService from '../services/xp.service.js';
import userRepository from '../repositories/user.repository.js';
import asyncHandler from '../utils/asyncHandler.js';
import { levelProgress } from '../utils/level.calculator.js';
import AppError from '../utils/AppError.js';

const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.getUserAchievements(req.user.id);
  const definitions = achievementService.getAllDefinitions();

  res.status(200).json({
    success: true,
    data: {
      unlocked: achievements,
      all: definitions,
    },
  });
});

const getXpHistory = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { transactions, total } = await xpService.getHistory(req.user.id, {
    page,
    limit,
    source: req.query.source,
  });

  res.status(200).json({
    success: true,
    data: transactions,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const getStats = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  res.status(200).json({
    success: true,
    data: {
      totalXP: user.totalXP,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
      ...levelProgress(user.totalXP),
    },
  });
});

export { getAchievements, getXpHistory, getStats };
