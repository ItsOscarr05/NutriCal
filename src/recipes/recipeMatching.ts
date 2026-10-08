import { Recipe } from '../data/recipes/recipes';
import { NutrientTargets } from '../engine';

/**
 * Recipe ranking for the Recipes tab. This is a UI heuristic for ordering
 * meal ideas, not a nutrition formula — it lives outside `src/engine` on
 * purpose and makes no claim about what someone should eat.
 *
 * Each recipe is compared with one meal's share of the day: the daily
 * targets divided by `MEALS_PER_DAY`, the same ~4-meal assumption behind
 * the protein-per-meal tip.
 */
export const MEALS_PER_DAY = 4;

export const HIGH_PROTEIN_GRAMS = 35;
export const QUICK_MINUTES = 20;

const WEIGHTS = { calories: 0.4, protein: 0.3, carbs: 0.15, fat: 0.15 } as const;

export type RecipeFilter = 'all' | 'high_protein' | 'quick' | 'plant';

export interface MealTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function mealTarget(targets: NutrientTargets): MealTarget {
  return {
    calories: Math.round(targets.calorieTarget / MEALS_PER_DAY),
    protein: Math.round(targets.macros.protein.grams / MEALS_PER_DAY),
    carbs: Math.round(targets.macros.carbs.grams / MEALS_PER_DAY),
    fat: Math.round(targets.macros.fat.grams / MEALS_PER_DAY),
  };
}

function relativeError(actual: number, target: number): number {
  if (target <= 0) return actual > 0 ? 1 : 0;
  return Math.min(1, Math.abs(actual - target) / target);
}

/** 0–100: how closely one serving lines up with one meal's share of the targets. */
export function targetFitScore(recipe: Recipe, meal: MealTarget): number {
  const error =
    WEIGHTS.calories * relativeError(recipe.calories, meal.calories) +
    WEIGHTS.protein * relativeError(recipe.protein, meal.protein) +
    WEIGHTS.carbs * relativeError(recipe.carbs, meal.carbs) +
    WEIGHTS.fat * relativeError(recipe.fat, meal.fat);
  return Math.round(100 * (1 - error));
}

export function matchesFilter(recipe: Recipe, filter: RecipeFilter): boolean {
  switch (filter) {
    case 'high_protein':
      return recipe.protein >= HIGH_PROTEIN_GRAMS;
    case 'quick':
      return recipe.prepMinutes < QUICK_MINUTES;
    case 'plant':
      return recipe.plantForward;
    default:
      return true;
  }
}

export function matchesSearch(recipe: Recipe, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    recipe.name.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q) ||
    recipe.ingredients.some((i) => i.item.toLowerCase().includes(q))
  );
}

export interface RankedRecipe {
  recipe: Recipe;
  fit: number;
}

/** Filters, searches, and sorts best fit first (ties broken by shorter prep, then name). */
export function rankRecipes(recipes: Recipe[], targets: NutrientTargets, filter: RecipeFilter, query: string): RankedRecipe[] {
  const meal = mealTarget(targets);
  return recipes
    .filter((r) => matchesFilter(r, filter) && matchesSearch(r, query))
    .map((recipe) => ({ recipe, fit: targetFitScore(recipe, meal) }))
    .sort((a, b) => b.fit - a.fit || a.recipe.prepMinutes - b.recipe.prepMinutes || a.recipe.name.localeCompare(b.recipe.name));
}
