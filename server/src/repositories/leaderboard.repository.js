import Leaderboard from '../models/Leaderboard.model.js';

const leaderboardRepository = {
  findLatest(period) {
    return Leaderboard.findOne({ period }).sort({ periodStart: -1 });
  },

  findByPeriodAndStart(period, periodStart) {
    return Leaderboard.findOne({ period, periodStart });
  },

  upsert(period, periodStart, data) {
    return Leaderboard.findOneAndUpdate(
      { period, periodStart },
      {
        $set: {
          ...data,
          computedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },
};

export default leaderboardRepository;
