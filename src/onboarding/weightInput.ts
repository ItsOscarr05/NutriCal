import { Units } from '../settings/appSettings';
import { kgToLb, lbToKg } from './unitConversion';
import { isValidWeightKg } from './validation';

export const WEIGHT_INPUT_MAX_LENGTH = 3;

/** Keeps only digits (pasted text can contain anything) and caps the length. */
export function sanitizeWeightText(text: string): string {
  return text.replace(/\D/g, '').slice(0, WEIGHT_INPUT_MAX_LENGTH);
}

/**
 * Weight in kilograms from the onboarding text box, or `null` if empty or
 * outside `MIN_WEIGHT_KG`/`MAX_WEIGHT_KG`. The typed value is in `unit`
 * (lb or kg); conversion happens here, not in storage.
 */
export function parseWeightInput(text: string, unit: Units): number | null {
  if (!/^\d+$/.test(text)) return null;
  const entered = Number(text);
  const weightKg = unit === 'imperial' ? lbToKg(entered) : entered;
  return isValidWeightKg(weightKg) ? weightKg : null;
}

/** Rewrites a valid entry into the other unit; leaves incomplete text as-is. */
export function convertWeightText(text: string, fromUnit: Units, toUnit: Units): string {
  if (fromUnit === toUnit) return text;
  const weightKg = parseWeightInput(text, fromUnit);
  if (weightKg === null) return text;
  return toUnit === 'metric' ? String(Math.round(weightKg)) : String(Math.round(kgToLb(weightKg)));
}
