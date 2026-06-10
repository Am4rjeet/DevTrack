import { ACHIEVEMENTS, getAchievement } from '../constants/achievements.js';
import achievementRepository from '../repositories/achievement.repository.js';
import progressRepository from '../repositories/progress.repository.js';
import goalRepository from '../repositories/goal.repository.js';
import userRepository from '../repositories/user.repository.js';
import xpService from './xp.service.js';

const achievementService = {
  async getUserAchievements(userId) {
    return achievementRepository.findByUser(userId);
  },

  async unlock(userId, achievementId, metadata = {}) {
    const definition = getAchievement(achievementId);
    if (!definition) return null;

    const existing = await achievementRepository.findByUserAndAchievementId(
      userId,
      achievementId
    );
    if (existing) return null;

    const achievement = await achievementRepository.create({
      userId,
      achievementId: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      xpBonus: definition.xpBonus,
      metadata,
    });

    if (definition.xpBonus > 0) {
      await xpService.awardXP(userId, definition.xpBonus, {
        source: 'achievement',
        referenceId: achievement._id,
        referenceModel: 'Achievement',
        description: `Achievement unlocked: ${definition.title}`,
      });
    }

    return achievement;
  },

  async checkAfterProgress(userId, entry) {
    const unlocked = [];

    const totalEntries = await progressRepository.countByUser(userId);
    if (totalEntries === 1) {
      const a = await this.unlock(userId, 'first_entry');
      if (a) unlocked.push(a);
    }

    const user = await userRepository.findById(userId);
    if (user?.currentStreak >= 7) {
      const a = await this.unlock(userId, 'streak_7');
      if (a) unlocked.push(a);
    }
    if (user?.currentStreak >= 30) {
      const a = await this.unlock(userId, 'streak_30');
      if (a) unlocked.push(a);
    }

    const codingMinutes = await progressRepository.sumDurationByType(userId, 'coding');
    const totalCodingMinutes = codingMinutes[0]?.total || 0;
    if (totalCodingMinutes >= 6000) {
      const a = await this.unlock(userId, 'hours_100');
      if (a) unlocked.push(a);
    }

    const dsaCount = await progressRepository.countByUser(userId, { type: 'dsa' });
    if (dsaCount >= 50) {
      const a = await this.unlock(userId, 'dsa_50');
      if (a) unlocked.push(a);
    }

    return unlocked;
  },

  async checkAfterGoalComplete(userId) {
    const unlocked = [];
    const completedCount = await goalRepository.countCompleted(userId);

    if (completedCount === 1) {
      const a = await this.unlock(userId, 'goal_complete');
      if (a) unlocked.push(a);
    }

    return unlocked;
  },

  getAllDefinitions() {
    return Object.values(ACHIEVEMENTS);
  },
};

export default achievementService;
