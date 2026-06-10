export const ACHIEVEMENTS = {
  first_entry: {
    id: 'first_entry',
    title: 'First session',
    description: 'Logged your first entry',
    icon: '1',
    xpBonus: 25,
  },
  streak_7: {
    id: 'streak_7',
    title: '7-day streak',
    description: 'Logged something 7 days in a row',
    icon: '7',
    xpBonus: 50,
  },
  streak_30: {
    id: 'streak_30',
    title: '30-day streak',
    description: 'Logged something 30 days in a row',
    icon: '30',
    xpBonus: 200,
  },
  hours_100: {
    id: 'hours_100',
    title: '100 hours',
    description: '100 hours logged total',
    icon: '100',
    xpBonus: 150,
  },
  dsa_50: {
    id: 'dsa_50',
    title: '50 DSA problems',
    description: 'Logged 50 DSA problems',
    icon: '50',
    xpBonus: 100,
  },
  goal_complete: {
    id: 'goal_complete',
    title: 'Goal done',
    description: 'Finished your first goal',
    icon: '✓',
    xpBonus: 75,
  },
};

export const getAchievement = (id) => ACHIEVEMENTS[id] || null;
