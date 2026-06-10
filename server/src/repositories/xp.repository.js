import XPTransaction from '../models/XPTransaction.model.js';

const xpRepository = {
  create(data, session = null) {
    return XPTransaction.create([data], session ? { session } : undefined).then(
      (docs) => docs[0]
    );
  },

  findByUser(userId, { page = 1, limit = 20, source } = {}) {
    const filter = { userId };
    if (source) filter.source = source;

    const skip = (page - 1) * limit;

    return Promise.all([
      XPTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      XPTransaction.countDocuments(filter),
    ]);
  },
};

export default xpRepository;
