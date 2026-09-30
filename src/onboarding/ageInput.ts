import { isValidAge } from './validation';

export const AGE_INPUT_MAX_LENGTH = 3;

/** Keeps only digits (pasted text can contain anything) and caps the length. */
export function sanitizeAgeText(text: string): string {
  return text.replace(/\D/g, '').slice(0, AGE_INPUT_MAX_LENGTH);
}

/** Whole-year age from the text box, or `null` if it's empty or out of the supported range. */
export function parseAgeInput(text: string): number | null {
  if (!/^\d+$/.test(text)) return null;
  const age = Number(text);
  return isValidAge(age) ? age : null;
}
