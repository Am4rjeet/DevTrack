export const ACHIEVEMENTS = {
  first_entry: {
    id: 'first_entry',
    title: 'First Steps',
    description: 'Logged your first progress entry',
    icon: '🚀',
    xpBonus: 25,
  },
  streak_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    xpBonus: 50,
  },
  streak_30: {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintained a 30-day streak',
    icon: '⚡',
    xpBonus: 200,
  },
  hours_100: {
    id: 'hours_100',
    title: 'Century Coder',
    description: 'Logged 100 hours of coding',
    icon: '💻',
    xpBonus: 150,
  },
  dsa_50: {
    id: 'dsa_50',
    title: 'DSA Grinder',
    description: 'Solved 50 DSA problems',
    icon: '🧠',
    xpBonus: 100,
  },
  goal_complete: {
    id: 'goal_complete',
    title: 'Goal Getter',
    description: 'Completed your first goal',
    icon: '🎯',
    xpBonus: 75,
  },
};

export const getAchievement = (id) => ACHIEVEMENTS[id] || null;
