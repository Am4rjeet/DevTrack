import mongoose from 'mongoose';
import ProgressEntry from '../models/ProgressEntry.model.js';
import XPTransaction from '../models/XPTransaction.model.js';
import User from '../models/User.model.js';

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

const analyticsRepository = {
  hoursByDay(userId, from, to) {
    const match = { userId: toObjectId(userId) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    return ProgressEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalMinutes: { $sum: '$durationMinutes' },
          totalXP: { $sum: '$xpEarned' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  hoursByWeek(userId, from, to) {
    const match = { userId: toObjectId(userId) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    return ProgressEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-W%V', date: '$date' },
          },
          totalMinutes: { $sum: '$durationMinutes' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  hoursByType(userId, from, to) {
    const match = { userId: toObjectId(userId) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    return ProgressEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          totalMinutes: { $sum: '$durationMinutes' },
          count: { $sum: 1 },
        },
      },
    ]);
  },

  dsaByDifficulty(userId, from, to) {
    const match = { userId: toObjectId(userId), type: 'dsa' };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    return ProgressEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$metadata.difficulty', 'unknown'] },
          count: { $sum: 1 },
          totalMinutes: { $sum: '$durationMinutes' },
        },
      },
    ]);
  },

  xpOverTime(userId, from, to) {
    const match = { userId: toObjectId(userId), amount: { $gt: 0 } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    return XPTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalXP: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  xpBySource(userId, from, to) {
    const match = { userId: toObjectId(userId), amount: { $gt: 0 } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    return XPTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$source',
          totalXP: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  },

  heatmapData(userId, days = 365) {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - days);

    return ProgressEntry.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          date: { $gte: from },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalMinutes: { $sum: '$durationMinutes' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  recentEntries(userId, limit = 5) {
    return ProgressEntry.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);
  },

  rankUsersByPeriodXP(periodStart, periodEnd, limit = 100) {
    const match = { amount: { $gt: 0 } };
    if (periodStart && periodEnd) {
      match.createdAt = { $gte: periodStart, $lt: periodEnd };
    }

    return XPTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userId',
          periodXP: { $sum: '$amount' },
        },
      },
      { $sort: { periodXP: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          periodXP: 1,
          username: '$user.username',
          displayName: '$user.displayName',
          avatar: '$user.avatar',
          totalXP: '$user.totalXP',
          level: '$user.level',
        },
      },
    ]);
  },

  rankUsersAllTime(limit = 100) {
    return User.find({ isProfilePublic: { $ne: false } })
      .sort({ totalXP: -1 })
      .limit(limit)
      .select('username displayName avatar totalXP level');
  },
};

export default analyticsRepository;
