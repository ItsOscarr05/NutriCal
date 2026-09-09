import { UserProfile } from '../types/profile';

/**
 * "Has anything changed?" nudge (PRD §8.1): "Since there's no account or
 * push-notification-driven engagement loop planned for v1, the recommended
 * nudge is a lightweight in-app one: a soft, dismissible prompt on the
 * results dashboard ... that appears once a profile is about 30 days old."
 *
 * Kept as pure functions (no AsyncStorage, no React) so the "is it time to
 * show this?" logic can be unit-tested against fixed dates without mocking
 * storage or rendering — see `src/storage/nudgeStorage.ts` for the
 * persistence half and `useChangeNudge` for how the two are wired together.
 */
export const NUDGE_THRESHOLD_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const then = new Date(isoDate).getTime();
  return (now.getTime() - then) / MS_PER_DAY;
}

/**
 * True when the profile is old enough to nudge about *and* hasn't already
 * been dismissed for this exact version of the profile. `dismissedForUpdatedAt`
 * is the `updatedAt` value the user last dismissed the nudge for (or `null`
 * if never dismissed) — editing the profile changes `updatedAt`, which
 * naturally "un-dismisses" the nudge and restarts its 30-day clock, without
 * needing any extra bookkeeping.
 */
export function shouldShowChangeNudge(
  profile: UserProfile,
  dismissedForUpdatedAt: string | null,
  now: Date = new Date()
): boolean {
  if (dismissedForUpdatedAt === profile.updatedAt) return false;
  return daysSince(profile.updatedAt, now) >= NUDGE_THRESHOLD_DAYS;
}
