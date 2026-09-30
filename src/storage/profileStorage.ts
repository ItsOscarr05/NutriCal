import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityLevel, Goal, Sex, UserProfile } from '../types/profile';

/**
 * Local, on-device profile persistence (PRD §8.1, §12 — no account, no
 * cloud sync; profile data lives entirely on the device). This is the only
 * place in the app that should read/write the stored profile directly —
 * screens should go through these functions rather than touching
 * AsyncStorage themselves, so the storage format can change in one place.
 */
const PROFILE_STORAGE_KEY = '@nutrical/profile';

const VALID_SEXES: Sex[] = ['male', 'female'];
const VALID_ACTIVITY_LEVELS: ActivityLevel[] = [
  'inactive',
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
];
const VALID_GOALS: Goal[] = ['maintain', 'lose_weight', 'gain_weight', 'build_muscle'];

/**
 * Runtime type guard for data read back from storage. Local storage isn't
 * type-checked at rest — a future schema change, or corrupted/stale data
 * left over from an older app version, could produce something that no
 * longer matches `UserProfile`. Treat anything that fails this check as
 * "no valid profile" (send the user back through onboarding) rather than
 * crashing on launch.
 */
export function isValidUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    VALID_SEXES.includes(p.sex as Sex) &&
    typeof p.age === 'number' &&
    Number.isFinite(p.age) &&
    p.age > 0 &&
    typeof p.heightCm === 'number' &&
    Number.isFinite(p.heightCm) &&
    p.heightCm > 0 &&
    typeof p.weightKg === 'number' &&
    Number.isFinite(p.weightKg) &&
    p.weightKg > 0 &&
    VALID_ACTIVITY_LEVELS.includes(p.activityLevel as ActivityLevel) &&
    VALID_GOALS.includes(p.goal as Goal) &&
    typeof p.updatedAt === 'string'
  );
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

/**
 * Returns the stored profile, or `null` if none exists yet, or if what's
 * stored is corrupted/invalid. Callers (e.g. the app's root navigator)
 * should treat `null` as "show onboarding."
 */
export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return isValidUserProfile(parsed) ? parsed : null;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
}
