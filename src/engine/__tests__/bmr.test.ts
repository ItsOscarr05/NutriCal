import { calculateBMR, calculateCalorieTarget, calculateTDEE } from '../bmr';

describe('calculateBMR (Mifflin-St Jeor)', () => {
  it('matches the published formula for a male example', () => {
    // 30yo male, 80kg, 180cm -> 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    const bmr = calculateBMR({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 });
    expect(bmr).toBe(1780);
  });

  it('matches the published formula for a female example', () => {
    // 30yo female, 65kg, 165cm -> 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25
    const bmr = calculateBMR({ sex: 'female', weightKg: 65, heightCm: 165, age: 30 });
    expect(bmr).toBeCloseTo(1370.25, 2);
  });
});

describe('calculateTDEE', () => {
  it('applies the sedentary multiplier', () => {
    expect(calculateTDEE(1780, 'sedentary')).toBeCloseTo(2136, 2);
  });

  it('applies the extremely_active multiplier', () => {
    expect(calculateTDEE(1780, 'extremely_active')).toBeCloseTo(3382, 2);
  });
});

describe('calculateCalorieTarget', () => {
  const base = { sex: 'male' as const, weightKg: 80, heightCm: 180, age: 30, activityLevel: 'sedentary' as const };

  it('returns TDEE unchanged for a maintain goal', () => {
    const { tdee, calorieTarget } = calculateCalorieTarget({ ...base, goal: 'maintain' });
    expect(calorieTarget).toBe(tdee);
  });

  it('reduces calories for a lose_weight goal', () => {
    const { tdee, calorieTarget } = calculateCalorieTarget({ ...base, goal: 'lose_weight' });
    expect(calorieTarget).toBeLessThan(tdee);
  });

  it('increases calories for a gain_weight goal', () => {
    const { tdee, calorieTarget } = calculateCalorieTarget({ ...base, goal: 'gain_weight' });
    expect(calorieTarget).toBeGreaterThan(tdee);
  });
});
