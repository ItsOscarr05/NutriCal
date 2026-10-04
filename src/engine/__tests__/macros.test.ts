import { calculateNutrientTargets } from '../index';
import { calculateMacroTargets, calculateProteinPerMeal, LB_PER_KG, MacroInputs } from '../macros';

const lbToKg = (lb: number) => lb / LB_PER_KG;

const base = (overrides: Partial<MacroInputs>): MacroInputs => ({
  calorieTarget: 2600,
  weightKg: lbToKg(148),
  sex: 'male',
  activityLevel: 'moderately_active',
  goal: 'maintain',
  ...overrides,
});

describe('calculateMacroTargets — protein', () => {
  it('scales protein with total body weight per goal (148 lb, no body fat estimate)', () => {
    const protein = (goal: MacroInputs['goal']) => calculateMacroTargets(base({ goal })).protein.grams;
    expect(protein('build_muscle')).toBe(133); // 0.9 g/lb
    expect(protein('lose_weight')).toBe(148); // 1.0 g/lb
    expect(protein('maintain')).toBe(104); // 0.7 g/lb
    expect(protein('gain_weight')).toBe(104);
  });

  it('does not change protein when calories change', () => {
    const low = calculateMacroTargets(base({ calorieTarget: 2400, goal: 'build_muscle' }));
    const high = calculateMacroTargets(base({ calorieTarget: 3200, goal: 'build_muscle' }));
    expect(low.protein.grams).toBe(high.protein.grams);
  });

  it('keeps the total-weight number for a lean user who shares a body fat estimate', () => {
    // lean male 13%: 128.8 lb lean * 1.1 = 141.6 > 133.2 total-weight rule
    const macros = calculateMacroTargets(base({ goal: 'build_muscle', bodyFat: 'lean' }));
    expect(macros.protein.grams).toBe(133);
  });

  it('uses the lower lean-mass number for higher body fat', () => {
    // 240 lb male at 30%: 168 lb lean * 1.1 = 184.8 < 216 total-weight rule
    const macros = calculateMacroTargets(
      base({ calorieTarget: 3500, weightKg: lbToKg(240), goal: 'build_muscle', bodyFat: 'higher' }),
    );
    expect(macros.protein.grams).toBe(185);
  });

  it('caps protein at 35% of calories for a heavy profile', () => {
    // 300 lb * 1.0 g/lb = 300g, but 35% of 2000 kcal = 175g
    const macros = calculateMacroTargets(base({ calorieTarget: 2000, weightKg: lbToKg(300), goal: 'lose_weight' }));
    expect(macros.protein.grams).toBe(175);
  });

  it('never drops protein below the 0.8 g/kg RDA, even past the 35% cap', () => {
    // 300 lb (136.1 kg): cap at 1200 kcal = 105g, RDA = 108.9g
    const macros = calculateMacroTargets(base({ calorieTarget: 1200, weightKg: lbToKg(300), goal: 'lose_weight' }));
    expect(macros.protein.grams).toBe(109);
  });
});

describe('calculateMacroTargets — carbs and fat', () => {
  it('sets carbs from g/kg of activity level, with fat taking the rest', () => {
    // 148 lb lightly active: 4 g/kg * 67.13 kg = 268.5g; fat = 2000 - 416 - 1074 = 510 kcal (~26%)
    const macros = calculateMacroTargets(base({ calorieTarget: 2000, activityLevel: 'lightly_active' }));
    expect(macros.carbs.grams).toBe(269);
    expect(macros.fat.grams).toBe(57);
  });

  it('gives more carbs to more active users at the same calories', () => {
    const sedentary = calculateMacroTargets(base({ calorieTarget: 3000, activityLevel: 'sedentary' }));
    const veryActive = calculateMacroTargets(base({ calorieTarget: 3000, activityLevel: 'very_active' }));
    expect(veryActive.carbs.grams).toBeGreaterThan(sedentary.carbs.grams);
  });

  it('keeps carbs at or above 130g when calories allow', () => {
    // 90 lb sedentary: 3 g/kg = 122g, raised to the 130g minimum
    const macros = calculateMacroTargets(base({ calorieTarget: 1300, weightKg: lbToKg(90), activityLevel: 'sedentary' }));
    expect(macros.carbs.grams).toBeGreaterThanOrEqual(130);
  });

  it('protects the fat minimum and limits carbs to what is left', () => {
    // 300 lb sedentary cut at 2000 kcal: protein 175g (700), fat floor capped at 35% (700), carbs get 600 kcal
    const macros = calculateMacroTargets(
      base({ calorieTarget: 2000, weightKg: lbToKg(300), activityLevel: 'sedentary', goal: 'lose_weight' }),
    );
    expect(macros.carbs.grams).toBe(150);
    expect(macros.fat.grams).toBe(78);
  });

  it('caps fat at 35% of calories and sends the overflow back to carbs', () => {
    const macros = calculateMacroTargets(base({ calorieTarget: 3000, activityLevel: 'sedentary' }));
    expect(macros.fat.percentOfCalories).toBeLessThanOrEqual(35);
    expect(macros.carbs.grams).toBeGreaterThan(Math.round(3 * lbToKg(148)));
  });

  it('always sums to the calorie target and never goes negative', () => {
    for (const lb of [90, 148, 220, 400]) {
      for (const calorieTarget of [1200, 2000, 3500]) {
        for (const activityLevel of ['inactive', 'moderately_active', 'extremely_active'] as const) {
          const macros = calculateMacroTargets(base({ calorieTarget, weightKg: lbToKg(lb), activityLevel, goal: 'lose_weight' }));
          expect(macros.carbs.grams).toBeGreaterThanOrEqual(0);
          expect(macros.fat.grams).toBeGreaterThanOrEqual(0);
          const total = macros.protein.calories + macros.carbs.calories + macros.fat.calories;
          expect(Math.abs(total - calorieTarget)).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe('calculateProteinPerMeal', () => {
  it('suggests ~0.4 g/kg per meal', () => {
    expect(calculateProteinPerMeal(lbToKg(148))).toBe(27);
  });
});

describe('calculateNutrientTargets — 148 lb lean bulk worked example', () => {
  it('produces ~2976 kcal: 133g protein, 351g carbs, 116g fat', () => {
    // 25yo male, 6'0" (182.88cm), 148 lb, moderately active: TDEE 2626, +350 = 2976.
    // Carbs 5 g/kg = 335.7g; fat would be 37%, so it's capped at 35% and ~15g returns to carbs.
    const targets = calculateNutrientTargets({
      sex: 'male',
      age: 25,
      heightCm: 182.88,
      weightKg: lbToKg(148),
      activityLevel: 'moderately_active',
      goal: 'build_muscle',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(targets.calorieTarget).toBe(2976);
    expect(targets.macros.protein.grams).toBe(133);
    expect(targets.macros.carbs.grams).toBe(351);
    expect(targets.macros.fat.grams).toBe(116);
  });
});
