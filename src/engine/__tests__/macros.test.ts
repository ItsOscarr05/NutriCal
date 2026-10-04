import { calculateNutrientTargets } from '../index';
import { calculateMacroTargets, LB_PER_KG } from '../macros';

const lbToKg = (lb: number) => lb / LB_PER_KG;

describe('calculateMacroTargets', () => {
  it('scales protein with body weight per goal (148 lb example)', () => {
    const weightKg = lbToKg(148);
    const protein = (goal: 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle') =>
      calculateMacroTargets({ calorieTarget: 2600, weightKg, goal }).protein.grams;

    expect(protein('build_muscle')).toBe(133); // 0.9 g/lb
    expect(protein('lose_weight')).toBe(148); // 1.0 g/lb
    expect(protein('maintain')).toBe(104); // 0.7 g/lb
    expect(protein('gain_weight')).toBe(104);
  });

  it('does not change protein when calories change (body-weight based, not calorie based)', () => {
    const weightKg = lbToKg(148);
    const low = calculateMacroTargets({ calorieTarget: 2400, weightKg, goal: 'build_muscle' });
    const high = calculateMacroTargets({ calorieTarget: 3200, weightKg, goal: 'build_muscle' });
    expect(low.protein.grams).toBe(high.protein.grams);
  });

  it('caps protein at 35% of calories for a heavy profile', () => {
    // 300 lb * 1.0 g/lb = 300g, but 35% of 2000 kcal = 175g
    const macros = calculateMacroTargets({ calorieTarget: 2000, weightKg: lbToKg(300), goal: 'lose_weight' });
    expect(macros.protein.grams).toBe(175);
  });

  it('uses 0.35 g/lb fat when that falls inside the 20-35% band', () => {
    // 148 * 0.35 = 51.8g = 466 kcal, ~23% of 2000
    const macros = calculateMacroTargets({ calorieTarget: 2000, weightKg: lbToKg(148), goal: 'maintain' });
    expect(macros.fat.grams).toBe(52);
  });

  it('raises fat to 20% of calories when 0.35 g/lb would fall below it', () => {
    // 20% of 2976 kcal / 9 = 66.1g
    const macros = calculateMacroTargets({ calorieTarget: 2976, weightKg: lbToKg(148), goal: 'build_muscle' });
    expect(macros.fat.grams).toBe(66);
  });

  it('caps fat at 35% of calories', () => {
    // 300 * 0.35 = 105g, but 35% of 2000 kcal / 9 = 77.8g
    const macros = calculateMacroTargets({ calorieTarget: 2000, weightKg: lbToKg(300), goal: 'lose_weight' });
    expect(macros.fat.grams).toBe(78);
  });

  it('fills the remaining calories with carbs and never goes negative', () => {
    for (const lb of [100, 148, 220, 400]) {
      for (const calorieTarget of [1200, 2000, 3500]) {
        const macros = calculateMacroTargets({ calorieTarget, weightKg: lbToKg(lb), goal: 'lose_weight' });
        expect(macros.carbs.grams).toBeGreaterThanOrEqual(0);
        const total = macros.protein.calories + macros.carbs.calories + macros.fat.calories;
        expect(total).toBeCloseTo(calorieTarget, 0);
      }
    }
  });
});

describe('calculateNutrientTargets — 148 lb lean bulk worked example', () => {
  it('produces ~2976 kcal with 133g protein instead of 200g+', () => {
    // 25yo male, 6'0" (182.88cm), 148 lb, moderately active:
    // BMR 1694.3, TDEE 2626.2, +350 lean-bulk surplus = 2976
    const targets = calculateNutrientTargets({
      sex: 'male',
      age: 25,
      heightCm: 182.88,
      weightKg: lbToKg(148),
      activityLevel: 'moderately_active',
      goal: 'build_muscle',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(targets.tdee).toBe(2626);
    expect(targets.calorieTarget).toBe(2976);
    expect(targets.macros.protein.grams).toBe(133);
    expect(targets.macros.fat.grams).toBe(66);
    expect(targets.macros.carbs.grams).toBe(463); // (2976 - 532 - 594) / 4 = 462.5
  });
});
