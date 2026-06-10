export const calculateLevel = (totalXP) => Math.floor(Math.sqrt(totalXP / 50)) + 1;

export const xpForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 50;
};

export const xpToNextLevel = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelXp - totalXP);
};

export const levelProgress = (totalXP) => {
  const level = calculateLevel(totalXP);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const range = nextLevelXp - currentLevelXp;
  const progress = range > 0 ? ((totalXP - currentLevelXp) / range) * 100 : 100;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpToNextLevel: xpToNextLevel(totalXP),
    progressPercent: Math.min(100, Math.round(progress)),
  };
};
