import { calculateProgressXP, calculateStreakBonus } from '../../../src/utils/xp.calculator.js';

describe('XP Calculator', () => {
  it('should award 1 XP per 10 minutes for coding', () => {
    expect(calculateProgressXP({ type: 'coding', durationMinutes: 60 })).toBe(6);
    expect(calculateProgressXP({ type: 'coding', durationMinutes: 5 })).toBe(1);
  });

  it('should award DSA XP by difficulty', () => {
    expect(
      calculateProgressXP({
        type: 'dsa',
        durationMinutes: 30,
        metadata: { difficulty: 'easy' },
      })
    ).toBe(11);

    expect(
      calculateProgressXP({
        type: 'dsa',
        durationMinutes: 60,
        metadata: { difficulty: 'hard' },
      })
    ).toBe(42);
  });

  it('should cap streak bonus at 50', () => {
    expect(calculateStreakBonus(7)).toBe(35);
    expect(calculateStreakBonus(15)).toBe(50);
  });
});
