import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistence for the "has anything changed?" nudge (PRD §8.1). Stores only
 * the `UserProfile.updatedAt` value the user last dismissed the nudge for —
 * not a boolean flag — so that editing the profile (which changes
 * `updatedAt`) automatically makes the nudge eligible to show again on its
 * own 30-day clock, without this module needing to know anything about
 * profiles or dates. See `src/profile/nudge.ts` for that comparison logic.
 */
const NUDGE_DISMISSED_FOR_KEY = '@nutrical/nudge_dismissed_for_updated_at';

export async function getDismissedNudgeTimestamp(): Promise<string | null> {
  return AsyncStorage.getItem(NUDGE_DISMISSED_FOR_KEY);
}

export async function setDismissedNudgeTimestamp(updatedAt: string): Promise<void> {
  await AsyncStorage.setItem(NUDGE_DISMISSED_FOR_KEY, updatedAt);
}

export async function clearDismissedNudgeTimestamp(): Promise<void> {
  await AsyncStorage.removeItem(NUDGE_DISMISSED_FOR_KEY);
}
