import { MIN_SUPPORTED_AGE } from '../data/dri';

/**
 * Onboarding input bounds. `MIN_SUPPORTED_AGE` is imported rather than
 * redefined here because the DRI data layer — not the UI — is the real
 * source of that constraint (see the comment on `MIN_SUPPORTED_AGE` in
 * `src/data/dri/index.ts`).
 */
export { MIN_SUPPORTED_AGE };
export const MAX_SUPPORTED_AGE = 120;

export const MIN_HEIGHT_CM = 91; // ~3'0"
export const MAX_HEIGHT_CM = 244; // ~8'0"

export const MIN_WEIGHT_KG = 20; // ~44lb
export const MAX_WEIGHT_KG = 300; // ~660lb

export function isValidAge(age: number): boolean {
  return Number.isFinite(age) && age >= MIN_SUPPORTED_AGE && age <= MAX_SUPPORTED_AGE;
}

export function isValidHeightCm(heightCm: number): boolean {
  return Number.isFinite(heightCm) && heightCm >= MIN_HEIGHT_CM && heightCm <= MAX_HEIGHT_CM;
}

export function isValidWeightKg(weightKg: number): boolean {
  return Number.isFinite(weightKg) && weightKg >= MIN_WEIGHT_KG && weightKg <= MAX_WEIGHT_KG;
}
