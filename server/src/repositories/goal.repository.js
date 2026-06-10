import Goal from '../models/Goal.model.js';

const goalRepository = {
  create(data) {
    return Goal.create(data);
  },

  findById(id) {
    return Goal.findById(id);
  },

  findByIdAndUser(id, userId) {
    return Goal.findOne({ _id: id, userId });
  },

  findByUser(userId, { status, category, page = 1, limit = 20 } = {}) {
    const filter = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    return Promise.all([
      Goal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Goal.countDocuments(filter),
    ]);
  },

  save(goal) {
    return goal.save();
  },

  deleteById(id, userId) {
    return Goal.findOneAndDelete({ _id: id, userId });
  },

  countCompleted(userId) {
    return Goal.countDocuments({ userId, status: 'completed' });
  },
};

export default goalRepository;
