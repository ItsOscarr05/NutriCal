import { UserProfile } from '../../types/profile';
import { ADOLESCENT_DRI_BRACKETS } from './adolescentBrackets';
import { SEED_DRI_BRACKETS } from './adultBrackets';
import { DRIBracketEntry, DRIValue, NutrientKey } from './types';

export * from './types';
export { NUTRIENT_INFO, NUTRIENT_KEYS } from './nutrients';
export { ADOLESCENT_DRI_BRACKETS } from './adolescentBrackets';
export { SEED_DRI_BRACKETS } from './adultBrackets';

const ALL_BRACKETS: DRIBracketEntry[] = [...ADOLESCENT_DRI_BRACKETS, ...SEED_DRI_BRACKETS];

/**
 * Youngest age NutriCal's DRI data currently supports. Below this, no
 * bracket is seeded (see `adolescentBrackets.ts` for why) and lookups
 * return `null`/empty. Onboarding's age input should enforce this as a hard
 * floor once it exists — tracked here rather than in the UI layer so the
 * constraint lives next to the data it's protecting.
 */
export const MIN_SUPPORTED_AGE = 9;

/**
 * Finds the correct age/sex bracket for a profile and returns its full set
 * of nutrient values (PRD §10 — "correctly bucket users into the right
 * bracket rather than interpolating or averaging").
 *
 * Returns `null` if no bracket has been defined yet for this profile
 * (expected for ages below `MIN_SUPPORTED_AGE`, and for life stages other
 * than 'standard' — see `adultBrackets.ts` / `adolescentBrackets.ts` for
 * what's seeded so far). Callers in the UI should treat `null` as "data not
 * yet available" rather than a calculation error.
 */
export function findBracketForProfile(profile: UserProfile): DRIBracketEntry | null {
  return (
    ALL_BRACKETS.find(
      (entry) =>
        entry.bracket.sex === profile.sex &&
        entry.bracket.lifeStage === 'standard' &&
        profile.age >= entry.bracket.minAge &&
        (entry.bracket.maxAge === null || profile.age <= entry.bracket.maxAge)
    ) ?? null
  );
}

export function getMicronutrientTarget(profile: UserProfile, nutrient: NutrientKey): DRIValue | null {
  const bracket = findBracketForProfile(profile);
  return bracket?.values[nutrient] ?? null;
}

export function getAllMicronutrientTargets(profile: UserProfile): Partial<Record<NutrientKey, DRIValue>> {
  return findBracketForProfile(profile)?.values ?? {};
}
