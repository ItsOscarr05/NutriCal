import { ActivityLevel, Goal, Sex } from '../types/profile';

/**
 * BMR/TDEE calculation (PRD §10).
 *
 * Uses the Mifflin-St Jeor equation, which current dietetics guidance
 * treats as the most accurate general-population estimate (more accurate
 * than the older Harris-Benedict formula for most adults).
 *
 * Mifflin-St Jeor (metric units — kg, cm, years):
 *   male:   BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
 *   female: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
 */
export function calculateBMR(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Standard activity multipliers, PRD §10 range of 1.2–1.9.
 * Source: commonly cited TDEE multiplier bands used alongside
 * Mifflin-St Jeor in dietetics practice.
 *
 * `inactive` (1.1) sits below that standard band for people who are
 * mostly seated or lying down all day with minimal walking — a
 * conservative extension, not one of the published bands.
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  inactive: 1.1, // mostly seated/resting, minimal daily walking
  sedentary: 1.2, // little or no exercise
  lightly_active: 1.375, // light exercise/sports 1-3 days/week
  moderately_active: 1.55, // moderate exercise/sports 3-5 days/week
  very_active: 1.725, // hard exercise/sports 6-7 days a week
  extremely_active: 1.9, // very hard exercise/physical job
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Goal adjustment applied to the TDEE (maintenance) baseline.
 *
 * These are deliberately conservative, evidence-informed defaults (a
 * ~15-20% deficit/surplus rather than a fixed large number) and should be
 * revisited alongside the macro engine as the product matures — see
 * PRD §10 "adjust up/down based on the user's stated goal."
 */
const GOAL_ADJUSTMENT_FACTOR: Record<Goal, number> = {
  maintain: 1.0,
  lose_weight: 0.8, // ~20% deficit
  gain_weight: 1.15, // ~15% surplus
  build_muscle: 1.1, // ~10% surplus, paired with a higher-protein split
};

export function calculateCalorieTarget(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): { bmr: number; tdee: number; calorieTarget: number } {
  const bmr = calculateBMR(params);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  const calorieTarget = Math.round(tdee * GOAL_ADJUSTMENT_FACTOR[params.goal]);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calorieTarget };
}
