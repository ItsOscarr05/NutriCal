import { useCallback, useEffect, useState } from 'react';
import { getDismissedNudgeTimestamp, setDismissedNudgeTimestamp } from '../storage/nudgeStorage';
import { UserProfile } from '../types/profile';
import { shouldShowChangeNudge } from './nudge';

interface ChangeNudgeState {
  /** True once storage has loaded and the nudge should currently be shown. */
  visible: boolean;
  /** Dismisses the nudge for this exact profile version (PRD §8.1 — "soft, dismissible"). */
  dismiss: () => void;
}

/**
 * Wires the pure `shouldShowChangeNudge` check to on-device storage for use
 * from `ResultsScreen`. Accepts a nullable profile (rather than requiring
 * callers to guard first) so it can be called unconditionally alongside a
 * component's other hooks, before any early-return for "no profile yet."
 *
 * Not unit-tested directly (it's a thin React/storage composition, same as
 * `ProfileContext`) — the logic it depends on is
 * tested in `src/profile/__tests__/nudge.test.ts` and
 * `src/storage/__tests__/nudgeStorage.test.ts`.
 */
export function useChangeNudge(profile: UserProfile | null): ChangeNudgeState {
  // `undefined` = not loaded from storage yet (so we don't flash the nudge
  // before we know whether it's already been dismissed).
  const [dismissedForUpdatedAt, setDismissedForUpdatedAt] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    getDismissedNudgeTimestamp().then((value) => {
      if (!cancelled) setDismissedForUpdatedAt(value);
    });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const visible = !!profile && dismissedForUpdatedAt !== undefined && shouldShowChangeNudge(profile, dismissedForUpdatedAt);

  const dismiss = useCallback(() => {
    if (!profile) return;
    setDismissedForUpdatedAt(profile.updatedAt);
    void setDismissedNudgeTimestamp(profile.updatedAt);
  }, [profile]);

  return { visible, dismiss };
}
