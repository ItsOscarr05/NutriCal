import { UserProfile } from '../types/profile';
import { calculateCalorieTarget } from './bmr';
import { calculateMacroTargets, MacroTargets } from './macros';

export * from './bmr';
export * from './bodyComposition';
export * from './macros';

export interface NutrientTargets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macros: MacroTargets;
}

/**
 * Single entry point for the free-tier (macro) portion of the calculation
 * engine (PRD §8.2). Micronutrient targets (PRD §8.3) are computed
 * separately via a DRI table lookup — see `src/data/dri`.
 */
export function calculateNutrientTargets(profile: UserProfile): NutrientTargets {
  const { bmr, tdee, calorieTarget } = calculateCalorieTarget(profile);
  const macros = calculateMacroTargets({
    calorieTarget,
    weightKg: profile.weightKg,
    sex: profile.sex,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    bodyFat: profile.bodyFat,
  });
  return { bmr, tdee, calorieTarget, macros };
}
