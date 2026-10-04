import { ActivityLevel, BodyFatCategory, Goal, Sex } from '../types/profile';
import { estimateLeanMassKg } from './bodyComposition';

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

/**
 * Protein in grams per pound of estimated lean body mass, by goal (the
 * 1.0-1.2 g/lb lean-mass rule). Only used when the user shared a body fat
 * estimate, and only when it's lower than the total-weight rule — so it
 * trims protein for higher body fat without raising it for lean users.
 */
export const PROTEIN_G_PER_LB_LEAN: Record<Goal, number> = {
  maintain: 1.0,
  lose_weight: 1.2,
  gain_weight: 1.0,
  build_muscle: 1.1,
};

/** Protein RDA (Institute of Medicine) — the minimum, regardless of other caps. */
export const PROTEIN_RDA_G_PER_KG = 0.8;

/** Protein per meal for muscle protein synthesis, spread across ~4 meals. */
export const PROTEIN_G_PER_KG_PER_MEAL = 0.4;

/**
 * Daily carbohydrate in grams per kg of body weight, by activity tier.
 * Sports-nutrition bands by training load are light 3-5, moderate (~1 h/day)
 * 5-7, high (1-3 h/day) 6-10, and very high (4+ h/day) 8-12 g/kg. The
 * activity tiers describe days per week rather than hours per day, so each
 * tier uses the low end of its band to avoid over-estimating carbs.
 */
export const CARB_G_PER_KG: Record<ActivityLevel, number> = {
  inactive: 3,
  sedentary: 3,
  lightly_active: 4,
  moderately_active: 5,
  very_active: 6,
  extremely_active: 8,
};

/** Carbohydrate RDA (Institute of Medicine), applied when calories allow. */
export const CARB_MIN_GRAMS = 130;

/** Minimum fat for hormone health: the low end of the 0.3-0.4 g/lb range. */
export const FAT_MIN_G_PER_LB = 0.3;

/**
 * AMDR (Acceptable Macronutrient Distribution Range) guards, as shares of
 * total calories. Protein is capped at the AMDR top so very heavy users
 * don't get extreme targets; fat is kept inside its AMDR band.
 */
export const PROTEIN_MAX_SHARE = 0.35;
export const FAT_MIN_SHARE = 0.2;
export const FAT_MAX_SHARE = 0.35;

export interface MacroInputs {
  calorieTarget: number;
  weightKg: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  /** Omitted when the user picked "Not sure". */
  bodyFat?: BodyFatCategory;
}

export function calculateProteinGrams({ calorieTarget, weightKg, sex, goal, bodyFat }: MacroInputs): number {
  const weightLb = weightKg * LB_PER_KG;
  let grams = weightLb * PROTEIN_G_PER_LB[goal];
  if (bodyFat) {
    const leanLb = estimateLeanMassKg(weightKg, sex, bodyFat) * LB_PER_KG;
    grams = Math.min(grams, leanLb * PROTEIN_G_PER_LB_LEAN[goal]);
  }
  grams = Math.min(grams, (calorieTarget * PROTEIN_MAX_SHARE) / CALORIES_PER_GRAM.protein);
  return Math.round(Math.max(grams, weightKg * PROTEIN_RDA_G_PER_KG));
}

/**
 * Order of operations: protein from body weight (or lean mass), a fat
 * minimum is reserved, carbs are set by activity level (g/kg), and fat
 * takes whatever calories are left. Fat above the AMDR ceiling flows back
 * into carbs.
 */
export function calculateMacroTargets(inputs: MacroInputs): MacroTargets {
  const { calorieTarget, weightKg, activityLevel } = inputs;
  const weightLb = weightKg * LB_PER_KG;

  const proteinGrams = calculateProteinGrams(inputs);
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;

  const fatCeiling = calorieTarget * FAT_MAX_SHARE;
  const fatFloor = Math.min(
    fatCeiling,
    Math.max(calorieTarget * FAT_MIN_SHARE, weightLb * FAT_MIN_G_PER_LB * CALORIES_PER_GRAM.fat),
  );

  const availableForCarbs = Math.max(0, calorieTarget - proteinCalories - fatFloor);
  const carbGoalGrams = Math.max(weightKg * CARB_G_PER_KG[activityLevel], CARB_MIN_GRAMS);
  let carbCalories = Math.min(carbGoalGrams * CALORIES_PER_GRAM.carbs, availableForCarbs);

  let fatCalories = Math.max(0, calorieTarget - proteinCalories - carbCalories);
  if (fatCalories > fatCeiling) {
    carbCalories += fatCalories - fatCeiling;
    fatCalories = fatCeiling;
  }

  const toTarget = (grams: number, calories: number): MacroTarget => ({
    grams,
    calories: Math.round(calories),
    percentOfCalories: calorieTarget > 0 ? Math.round((calories / calorieTarget) * 100) : 0,
  });

  return {
    protein: toTarget(proteinGrams, proteinCalories),
    carbs: toTarget(Math.round(carbCalories / CALORIES_PER_GRAM.carbs), carbCalories),
    fat: toTarget(Math.round(fatCalories / CALORIES_PER_GRAM.fat), fatCalories),
  };
}

/** Suggested protein per meal (~0.4 g/kg), for spreading the daily target across ~4 meals. */
export function calculateProteinPerMeal(weightKg: number): number {
  return Math.round(weightKg * PROTEIN_G_PER_KG_PER_MEAL);
}
