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
  it('applies the inactive multiplier', () => {
    expect(calculateTDEE(1780, 'inactive')).toBeCloseTo(1958, 2);
  });

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

  it('adds a fixed +350 kcal lean-bulk surplus for build_muscle', () => {
    // TDEE = 1780 * 1.2 = 2136
    const { tdee, calorieTarget } = calculateCalorieTarget({ ...base, goal: 'build_muscle' });
    expect(tdee).toBe(2136);
    expect(calorieTarget).toBe(2486);
  });

  it('adds a fixed +500 kcal surplus for gain_weight', () => {
    const { calorieTarget } = calculateCalorieTarget({ ...base, goal: 'gain_weight' });
    expect(calorieTarget).toBe(2636);
  });

  it('subtracts the full 400 kcal deficit when no floor applies', () => {
    // TDEE = 1780 * 1.725 = 3070.5 -> 2670.5
    const { calorieTarget } = calculateCalorieTarget({ ...base, activityLevel: 'very_active', goal: 'lose_weight' });
    expect(calorieTarget).toBe(2671);
  });

  it('never cuts below BMR when BMR is the higher floor', () => {
    // 2136 - 400 = 1736 < BMR 1780
    const { bmr, calorieTarget } = calculateCalorieTarget({ ...base, goal: 'lose_weight' });
    expect(calorieTarget).toBe(bmr);
  });

  it('never cuts below the sex-specific minimum when it is the higher floor', () => {
    // female 45kg/150cm/60y: BMR 926.5, TDEE 926.5 * 1.55 = 1436.1 -> 1036 < 1200
    const { calorieTarget } = calculateCalorieTarget({
      sex: 'female',
      weightKg: 45,
      heightCm: 150,
      age: 60,
      activityLevel: 'moderately_active',
      goal: 'lose_weight',
    });
    expect(calorieTarget).toBe(1200);
  });

  it('caps the floor at TDEE so a cut never becomes a surplus', () => {
    // same person, inactive: TDEE 926.5 * 1.1 = 1019.2, below the 1200 floor
    const { tdee, calorieTarget } = calculateCalorieTarget({
      sex: 'female',
      weightKg: 45,
      heightCm: 150,
      age: 60,
      activityLevel: 'inactive',
      goal: 'lose_weight',
    });
    expect(calorieTarget).toBe(tdee);
  });
});
