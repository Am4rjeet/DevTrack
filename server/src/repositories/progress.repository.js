import mongoose from 'mongoose';
import ProgressEntry from '../models/ProgressEntry.model.js';

const toObjectId = (userId) =>
  userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);

const progressRepository = {
  create(data, session = null) {
    return ProgressEntry.create([data], session ? { session } : undefined).then(
      (docs) => docs[0]
    );
  },

  findById(id) {
    return ProgressEntry.findById(id);
  },

  findByIdAndUser(id, userId) {
    return ProgressEntry.findOne({ _id: id, userId });
  },

  findByUser(userId, { type, from, to, page = 1, limit = 20 } = {}) {
    const filter = { userId };

    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    return Promise.all([
      ProgressEntry.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      ProgressEntry.countDocuments(filter),
    ]);
  },

  update(entry, session = null) {
    return entry.save(session ? { session } : undefined);
  },

  deleteById(id, userId) {
    return ProgressEntry.findOneAndDelete({ _id: id, userId });
  },

  countByUser(userId, filter = {}) {
    return ProgressEntry.countDocuments({ userId, ...filter });
  },

  aggregateStats(userId) {
    return ProgressEntry.aggregate([
      { $match: { userId: toObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          totalMinutes: { $sum: '$durationMinutes' },
          totalXP: { $sum: '$xpEarned' },
          count: { $sum: 1 },
        },
      },
    ]);
  },

  aggregateByDate(userId, from, to) {
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
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          totalMinutes: { $sum: '$durationMinutes' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  sumDurationByType(userId, type) {
    return ProgressEntry.aggregate([
      { $match: { userId: toObjectId(userId), type } },
      { $group: { _id: null, total: { $sum: '$durationMinutes' } } },
    ]);
  },
};

export default progressRepository;
