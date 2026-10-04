import { Goal } from '../types/profile';

export interface MacroTarget {
  grams: number;
  calories: number;
  percentOfCalories: number;
}

export interface MacroTargets {
  protein: MacroTarget;
  carbs: MacroTarget;
  fat: MacroTarget;
}

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export const LB_PER_KG = 2.20462262;

/**
 * Daily protein in grams per pound of total body weight, by goal (PRD §10).
 * Sports-nutrition consensus for building muscle is 0.8-1.0 g/lb
 * (1.6-2.2 g/kg): lean bulk sits mid-range, a cut takes the top of the
 * range to help preserve muscle in a deficit, and maintenance / healthy
 * weight gain use a moderate 0.7 g/lb.
 */
export const PROTEIN_G_PER_LB: Record<Goal, number> = {
  maintain: 0.7,
  lose_weight: 1.0,
  gain_weight: 0.7,
  build_muscle: 0.9,
};

/** Fat in grams per pound of body weight — the middle of the 0.3-0.4 g/lb range used for hormone health. */
export const FAT_G_PER_LB = 0.35;

/**
 * AMDR (Acceptable Macronutrient Distribution Range) guards, as shares of
 * total calories. Protein is capped at the AMDR top so very heavy users
 * don't get extreme targets from a total-body-weight multiplier (no lean
 * body mass input exists); fat is kept inside its AMDR band.
 */
export const PROTEIN_MAX_SHARE = 0.35;
export const FAT_MIN_SHARE = 0.2;
export const FAT_MAX_SHARE = 0.35;

/**
 * Order of operations: protein from body weight, then fat from body
 * weight, then carbohydrates fill whatever calories remain. With the
 * caps above, carbs always get at least ~30% of calories.
 */
export function calculateMacroTargets(params: { calorieTarget: number; weightKg: number; goal: Goal }): MacroTargets {
  const { calorieTarget, weightKg, goal } = params;
  const weightLb = weightKg * LB_PER_KG;

  const proteinGrams = Math.round(
    Math.min(weightLb * PROTEIN_G_PER_LB[goal], (calorieTarget * PROTEIN_MAX_SHARE) / CALORIES_PER_GRAM.protein),
  );
  const fatGrams = Math.round(
    Math.min(
      Math.max(weightLb * FAT_G_PER_LB, (calorieTarget * FAT_MIN_SHARE) / CALORIES_PER_GRAM.fat),
      (calorieTarget * FAT_MAX_SHARE) / CALORIES_PER_GRAM.fat,
    ),
  );

  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  const fatCalories = fatGrams * CALORIES_PER_GRAM.fat;
  const carbCalories = Math.max(0, calorieTarget - proteinCalories - fatCalories);

  const toTarget = (grams: number, calories: number): MacroTarget => ({
    grams,
    calories: Math.round(calories),
    percentOfCalories: calorieTarget > 0 ? Math.round((calories / calorieTarget) * 100) : 0,
  });

  return {
    protein: toTarget(proteinGrams, proteinCalories),
    carbs: toTarget(Math.round(carbCalories / CALORIES_PER_GRAM.carbs), carbCalories),
    fat: toTarget(fatGrams, fatCalories),
  };
}
