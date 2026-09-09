/**
 * Pure unit-conversion helpers for the onboarding height/weight screens.
 * Internal storage (`UserProfile.heightCm`/`weightKg`) is always metric —
 * these functions exist purely to convert at the UI edge for the
 * imperial-first-with-metric-toggle input decision (see AGENTS.md).
 */

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * CM_PER_INCH * 10) / 10;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function lbToKg(lb: number): number {
  return Math.round(lb * KG_PER_LB * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round((kg / KG_PER_LB) * 10) / 10;
}
