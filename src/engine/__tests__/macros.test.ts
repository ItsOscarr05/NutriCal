import { calculateMacroTargets } from '../macros';

describe('calculateMacroTargets', () => {
  it('splits 2000 calories per the maintain goal ratios', () => {
    const macros = calculateMacroTargets(2000, 'maintain');
    expect(macros.protein.percentOfCalories).toBe(20);
    expect(macros.carbs.percentOfCalories).toBe(50);
    expect(macros.fat.percentOfCalories).toBe(30);

    expect(macros.protein.grams).toBe(100); // 400 kcal / 4
    expect(macros.carbs.grams).toBe(250); // 1000 kcal / 4
    expect(macros.fat.grams).toBe(67); // 600 kcal / 9, rounded
  });

  it('shifts protein higher for a lose_weight goal', () => {
    const maintain = calculateMacroTargets(2000, 'maintain');
    const losing = calculateMacroTargets(2000, 'lose_weight');
    expect(losing.protein.grams).toBeGreaterThan(maintain.protein.grams);
  });

  it('keeps macro calories within a gram of the total calorie target', () => {
    const macros = calculateMacroTargets(2000, 'build_muscle');
    const total = macros.protein.calories + macros.carbs.calories + macros.fat.calories;
    expect(total).toBeCloseTo(2000, 0);
  });
});
