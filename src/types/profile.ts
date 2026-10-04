/**
 * Core profile types for NutriCal.
 *
 * The profile is the single source of truth for a user's body metrics and
 * stated goal. It is stored locally on-device (see PRD §8.1 / §12 — no
 * account, no cloud sync) and is the sole input to the calculation engine
 * in `src/engine`.
 */

export type Sex = 'male' | 'female';

/**
 * 6-tier activity picker (PRD §8.1). Each tier maps to a TDEE multiplier
 * in `src/engine/bmr.ts`.
 */
export type ActivityLevel =
  | 'inactive'
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

/**
 * Stated goal (PRD §8.1). Used to adjust the calorie target away from the
 * maintenance (TDEE) baseline, and to set the protein-per-body-weight
 * multiplier (PRD §10).
 */
export type Goal = 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle';

export interface UserProfile {
  sex: Sex;
  /** Age in whole years. */
  age: number;
  /** Height in centimeters. Store metric internally; convert at the UI edge. */
  heightCm: number;
  /** Weight in kilograms. Store metric internally; convert at the UI edge. */
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  /**
   * When this profile was created or last edited. Used to power the
   * "has anything changed?" 30-day nudge on the results dashboard (PRD §8.1).
   */
  updatedAt: string;
}
