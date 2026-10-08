/**
 * Presentational-only estimate of how "active calories" (everything above
 * BMR: TDEE minus BMR) roughly splits across NEAT, structured exercise,
 * and the thermic effect of food. `src/engine` has no such split — it
 * only models a single activity multiplier (PRD §10) — so this lives
 * outside `src/engine` and isn't unit-tested as a calculation: it's a
 * fixed, clearly-labeled illustrative ratio applied to the user's real
 * `tdee - bmr`. Shared by the Targets and Science screens so they show
 * the same estimate; any UI using it must label the parts as estimates.
 */
export const ACTIVE_CALORIE_SPLIT = { neat: 0.45, exercise: 0.35, tef: 0.2 } as const;

export interface ActiveCalorieSplit {
  active: number;
  neat: number;
  exercise: number;
  tef: number;
}

export function splitActiveCalories(bmr: number, tdee: number): ActiveCalorieSplit {
  const active = Math.max(0, Math.round(tdee - bmr));
  const neat = Math.round(active * ACTIVE_CALORIE_SPLIT.neat);
  const exercise = Math.round(active * ACTIVE_CALORIE_SPLIT.exercise);
  const tef = Math.max(0, active - neat - exercise);
  return { active, neat, exercise, tef };
}
