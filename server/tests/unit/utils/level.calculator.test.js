import {
  calculateLevel,
  xpForLevel,
  xpToNextLevel,
  levelProgress,
} from '../../../src/utils/level.calculator.js';

describe('Level Calculator', () => {
  it('should calculate level from total XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(50)).toBe(2);
    expect(calculateLevel(200)).toBe(3);
  });

  it('should return XP required for a level', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(50);
    expect(xpForLevel(3)).toBe(200);
  });

  it('should compute XP remaining to next level', () => {
    expect(xpToNextLevel(0)).toBe(50);
    expect(xpToNextLevel(50)).toBe(150);
  });

  it('should return level progress metadata', () => {
    const progress = levelProgress(75);

    expect(progress.level).toBe(2);
    expect(progress.currentLevelXp).toBe(50);
    expect(progress.nextLevelXp).toBe(200);
    expect(progress.xpToNextLevel).toBe(125);
    expect(progress.progressPercent).toBeGreaterThan(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
  });
});
