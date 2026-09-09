import { UserProfile } from '../../types/profile';
import { SEED_DRI_BRACKETS } from './adultBrackets';
import { DRIBracketEntry, DRIValue, NutrientKey } from './types';

export * from './types';
export { NUTRIENT_INFO, NUTRIENT_KEYS } from './nutrients';

const ALL_BRACKETS: DRIBracketEntry[] = [...SEED_DRI_BRACKETS];

/**
 * Finds the correct age/sex bracket for a profile and returns its full set
 * of nutrient values (PRD §10 — "correctly bucket users into the right
 * bracket rather than interpolating or averaging").
 *
 * Returns `null` if no bracket has been defined yet for this profile
 * (expected during v1 build-out — see `adultBrackets.ts` for what's seeded
 * so far). Callers in the UI should treat `null` as "data not yet
 * available" rather than a calculation error.
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
