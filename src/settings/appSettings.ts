/**
 * App-level user preferences — distinct from `UserProfile` (body metrics
 * used for calculations, see `src/types/profile.ts`). These are app
 * configuration/UX choices, not "your data" in the sensitive sense (PRD
 * §13), which is why the Settings screen's "Delete my data" action clears
 * the profile but leaves these preferences alone.
 *
 * Pure types + defaults only — no AsyncStorage, no React — mirroring the
 * split already used for the "has anything changed?" nudge
 * (`src/profile/nudge.ts` + `src/storage/nudgeStorage.ts`).
 */

/** Matches the existing onboarding imperial/metric toggle (`src/onboarding/unitConversion.ts`). */
export type Units = 'imperial' | 'metric';

/** `'system'` follows the OS color scheme via `useColorScheme()` — see `src/theme/index.ts`. */
export type Appearance = 'light' | 'dark' | 'system';

export interface AppSettings {
  units: Units;
  appearance: Appearance;
}

/**
 * Matches today's de-facto behavior exactly (imperial-first onboarding per
 * AGENTS.md, and `useTheme()` always following the OS scheme) — so nobody's
 * experience changes until they actually open Settings and pick something.
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  units: 'imperial',
  appearance: 'system',
};

const VALID_UNITS: Units[] = ['imperial', 'metric'];
const VALID_APPEARANCES: Appearance[] = ['light', 'dark', 'system'];

/**
 * Runtime type guard for data read back from storage — same rationale as
 * `isValidUserProfile` in `profileStorage.ts`: local storage isn't
 * type-checked at rest, so a future schema change or corrupted data should
 * fall back to defaults rather than crash the app.
 */
export function isValidAppSettings(value: unknown): value is AppSettings {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return VALID_UNITS.includes(v.units as Units) && VALID_APPEARANCES.includes(v.appearance as Appearance);
}
