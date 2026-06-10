const DSA_XP = { easy: 10, medium: 20, hard: 40 };

export const calculateProgressXP = (entry) => {
  const { type, durationMinutes, metadata } = entry;

  switch (type) {
    case 'coding':
    case 'learning':
    case 'project':
    case 'other':
      return Math.max(1, Math.floor(durationMinutes / 10));

    case 'dsa': {
      const difficulty = metadata?.difficulty || 'easy';
      const baseXP = DSA_XP[difficulty] ?? DSA_XP.easy;
      const timeBonus = Math.floor(durationMinutes / 30);
      return baseXP + timeBonus;
    }

    default:
      return 1;
  }
};

export const calculateStreakBonus = (streakDays) => Math.min(streakDays * 5, 50);
