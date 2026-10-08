import { Recipe } from '../../data/recipes/recipes';
import { NutrientTargets } from '../../engine';
import { matchesFilter, matchesSearch, mealTarget, rankRecipes, targetFitScore } from '../recipeMatching';

const targets: NutrientTargets = {
  bmr: 1500,
  tdee: 2000,
  calorieTarget: 2000,
  macros: {
    protein: { grams: 160, calories: 640, percentOfCalories: 32 },
    carbs: { grams: 200, calories: 800, percentOfCalories: 40 },
    fat: { grams: 60, calories: 540, percentOfCalories: 27 },
  },
} as NutrientTargets;

const base: Recipe = {
  id: 'base',
  name: 'Base Bowl',
  description: 'A test bowl',
  emoji: '🥣',
  prepMinutes: 15,
  difficulty: 'Easy',
  plantForward: false,
  calories: 500,
  protein: 40,
  carbs: 50,
  fat: 15,
  ingredients: [{ item: 'Chicken breast', group: 'Protein' }],
  steps: ['Cook it.'],
};

describe('mealTarget', () => {
  it('splits the day into four meals', () => {
    expect(mealTarget(targets)).toEqual({ calories: 500, protein: 40, carbs: 50, fat: 15 });
  });
});

describe('targetFitScore', () => {
  it('is 100 for an exact one-meal match', () => {
    expect(targetFitScore(base, mealTarget(targets))).toBe(100);
  });

  it('drops as the recipe drifts from the meal target', () => {
    const meal = mealTarget(targets);
    const close = targetFitScore({ ...base, calories: 550 }, meal);
    const far = targetFitScore({ ...base, calories: 900, protein: 10 }, meal);
    expect(close).toBeLessThan(100);
    expect(far).toBeLessThan(close);
  });

  it('never goes below 0', () => {
    const score = targetFitScore({ ...base, calories: 5000, protein: 500, carbs: 500, fat: 500 }, mealTarget(targets));
    expect(score).toBe(0);
  });
});

describe('matchesFilter', () => {
  it('applies the high-protein, quick, and plant-forward thresholds', () => {
    expect(matchesFilter({ ...base, protein: 35 }, 'high_protein')).toBe(true);
    expect(matchesFilter({ ...base, protein: 34 }, 'high_protein')).toBe(false);
    expect(matchesFilter({ ...base, prepMinutes: 19 }, 'quick')).toBe(true);
    expect(matchesFilter({ ...base, prepMinutes: 20 }, 'quick')).toBe(false);
    expect(matchesFilter({ ...base, plantForward: true }, 'plant')).toBe(true);
    expect(matchesFilter(base, 'plant')).toBe(false);
    expect(matchesFilter(base, 'all')).toBe(true);
  });
});

describe('matchesSearch', () => {
  it('matches name, description, and ingredients case-insensitively', () => {
    expect(matchesSearch(base, 'bowl')).toBe(true);
    expect(matchesSearch(base, 'TEST')).toBe(true);
    expect(matchesSearch(base, 'chicken')).toBe(true);
    expect(matchesSearch(base, 'salmon')).toBe(false);
    expect(matchesSearch(base, '   ')).toBe(true);
  });
});

describe('rankRecipes', () => {
  it('sorts best fit first and applies filter + search', () => {
    const worse = { ...base, id: 'worse', name: 'Worse Bowl', calories: 800 };
    const plant = { ...base, id: 'plant', name: 'Plant Bowl', plantForward: true, calories: 700 };
    const ranked = rankRecipes([worse, base, plant], targets, 'all', '');
    expect(ranked.map((r) => r.recipe.id)).toEqual(['base', 'plant', 'worse']);
    expect(rankRecipes([worse, base, plant], targets, 'plant', '').map((r) => r.recipe.id)).toEqual(['plant']);
    expect(rankRecipes([worse, base, plant], targets, 'all', 'worse').map((r) => r.recipe.id)).toEqual(['worse']);
  });
});
