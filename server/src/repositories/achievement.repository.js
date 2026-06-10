import Achievement from '../models/Achievement.model.js';

const achievementRepository = {
  findByUser(userId) {
    return Achievement.find({ userId }).sort({ unlockedAt: -1 });
  },

  findByUserAndAchievementId(userId, achievementId) {
    return Achievement.findOne({ userId, achievementId });
  },

  create(data, session = null) {
    return Achievement.create([data], session ? { session } : undefined).then(
      (docs) => docs[0]
    );
  },

  countByUser(userId) {
    return Achievement.countDocuments({ userId });
  },
};

export default achievementRepository;
