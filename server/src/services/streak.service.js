import userRepository from '../repositories/user.repository.js';
import {
  normalizeToUtcMidnight,
  isSameUtcDay,
  daysBetweenUtc,
} from '../utils/date.utils.js';
import { calculateStreakBonus } from '../utils/xp.calculator.js';
import xpService from './xp.service.js';

const streakService = {
  /**
   * Update streak when a progress entry is logged.
   * Uses the entry's activity date (UTC midnight normalized).
   */
  async updateStreak(userId, activityDate, session = null) {
    const user = await userRepository.findById(userId);
    if (!user) return { streakUpdated: false, streakBonus: 0, currentStreak: 0 };

    const activityDay = normalizeToUtcMidnight(activityDate);

    if (user.lastActivityDate) {
      const lastDay = normalizeToUtcMidnight(user.lastActivityDate);

      if (isSameUtcDay(lastDay, activityDay)) {
        return {
          streakUpdated: false,
          streakBonus: 0,
          currentStreak: user.currentStreak,
        };
      }

      // Ignore backdated entries for streak purposes
      if (activityDay < lastDay) {
        return {
          streakUpdated: false,
          streakBonus: 0,
          currentStreak: user.currentStreak,
        };
      }

      const gap = daysBetweenUtc(lastDay, activityDay);
      user.currentStreak = gap === 1 ? user.currentStreak + 1 : 1;
    } else {
      user.currentStreak = 1;
    }

    user.lastActivityDate = activityDay;

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    await userRepository.save(user);

    const streakBonus = calculateStreakBonus(user.currentStreak);
    if (streakBonus > 0) {
      await xpService.awardXP(userId, streakBonus, {
        source: 'streak_bonus',
        description: `${user.currentStreak}-day streak bonus`,
        session,
      });
    }

    return {
      streakUpdated: true,
      streakBonus,
      currentStreak: user.currentStreak,
    };
  },
};

export default streakService;
