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

/**
 * Macro split as % of total calories, within AMDR (Acceptable Macronutrient
 * Distribution Range) bounds — protein 10-35%, carbs 45-65%, fat 20-35% —
 * and biased by the user's stated goal (PRD §10). These splits are a v1
 * starting point; the "build_muscle" split in particular is a simplification
 * of the more common g/kg-bodyweight protein recommendation and is a
 * reasonable candidate to refine once the engine is validated (PRD §14).
 */
const MACRO_SPLIT_BY_GOAL: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  maintain: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  lose_weight: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  gain_weight: { protein: 0.2, carbs: 0.55, fat: 0.25 },
  build_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

export function calculateMacroTargets(calorieTarget: number, goal: Goal): MacroTargets {
  const split = MACRO_SPLIT_BY_GOAL[goal];

  const toTarget = (percentOfCalories: number, key: keyof typeof CALORIES_PER_GRAM): MacroTarget => {
    const calories = calorieTarget * percentOfCalories;
    const grams = Math.round(calories / CALORIES_PER_GRAM[key]);
    return { grams, calories: Math.round(calories), percentOfCalories: Math.round(percentOfCalories * 100) };
  };

  return {
    protein: toTarget(split.protein, 'protein'),
    carbs: toTarget(split.carbs, 'carbs'),
    fat: toTarget(split.fat, 'fat'),
  };
}
