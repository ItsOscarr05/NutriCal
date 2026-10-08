import { RECIPES } from '../recipes';

describe('RECIPES', () => {
  it('has unique ids', () => {
    const ids = RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(RECIPES.map((r) => [r.name, r] as const))('%s has ingredients, steps, and positive macros', (_name, recipe) => {
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.steps.length).toBeGreaterThan(0);
    expect(recipe.prepMinutes).toBeGreaterThan(0);
    for (const value of [recipe.calories, recipe.protein, recipe.carbs, recipe.fat]) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it.each(RECIPES.map((r) => [r.name, r] as const))('%s calories match its macros within 5%%', (_name, recipe) => {
    const fromMacros = recipe.protein * 4 + recipe.carbs * 4 + recipe.fat * 9;
    expect(Math.abs(recipe.calories - fromMacros) / fromMacros).toBeLessThanOrEqual(0.05);
  });
});
