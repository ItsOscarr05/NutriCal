import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_APP_SETTINGS, isValidAppSettings } from '../settings/appSettings';

/**
 * Local, on-device persistence for app-level preferences (units,
 * appearance) — same shape as `profileStorage.ts`/`nudgeStorage.ts`. Kept
 * separate from `profileStorage.ts` since these aren't part of the
 * `UserProfile` that "Delete my data" clears (see `src/settings/appSettings.ts`).
 */
const APP_SETTINGS_STORAGE_KEY = '@nutrical/app_settings';

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Returns the stored settings, or `DEFAULT_APP_SETTINGS` if none exist yet,
 * or if what's stored is corrupted/invalid — callers never need to handle
 * a "no settings" case separately from a "some settings" case.
 */
export async function loadAppSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(APP_SETTINGS_STORAGE_KEY);
  if (raw === null) return DEFAULT_APP_SETTINGS;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }

  return isValidAppSettings(parsed) ? parsed : DEFAULT_APP_SETTINGS;
}

export async function clearAppSettings(): Promise<void> {
  await AsyncStorage.removeItem(APP_SETTINGS_STORAGE_KEY);
}
