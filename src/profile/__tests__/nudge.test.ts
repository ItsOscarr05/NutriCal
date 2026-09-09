import { UserProfile } from '../../types/profile';
import { daysSince, NUDGE_THRESHOLD_DAYS, shouldShowChangeNudge } from '../nudge';

function makeProfile(updatedAt: string): UserProfile {
  return {
    sex: 'female',
    age: 30,
    heightCm: 165,
    weightKg: 60,
    activityLevel: 'moderately_active',
    goal: 'maintain',
    updatedAt,
  };
}

describe('daysSince', () => {
  it('returns 0 for the same instant', () => {
    const now = new Date('2026-01-31T00:00:00.000Z');
    expect(daysSince('2026-01-31T00:00:00.000Z', now)).toBe(0);
  });

  it('returns the correct fractional day count', () => {
    const now = new Date('2026-02-15T12:00:00.000Z');
    expect(daysSince('2026-02-14T00:00:00.000Z', now)).toBeCloseTo(1.5, 5);
  });

  it('is negative for a date in the future relative to now', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    expect(daysSince('2026-01-05T00:00:00.000Z', now)).toBeLessThan(0);
  });
});

describe('shouldShowChangeNudge (PRD §8.1)', () => {
  const setUpAt = '2026-01-01T00:00:00.000Z';

  it('does not show before the profile is 30 days old', () => {
    const profile = makeProfile(setUpAt);
    const now = new Date('2026-01-20T00:00:00.000Z'); // 19 days later
    expect(shouldShowChangeNudge(profile, null, now)).toBe(false);
  });

  it('shows once the profile is exactly at the 30-day threshold', () => {
    const profile = makeProfile(setUpAt);
    const now = new Date(new Date(setUpAt).getTime() + NUDGE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    expect(shouldShowChangeNudge(profile, null, now)).toBe(true);
  });

  it('shows well after the profile is 30+ days old, if never dismissed', () => {
    const profile = makeProfile(setUpAt);
    const now = new Date('2026-03-01T00:00:00.000Z'); // ~59 days later
    expect(shouldShowChangeNudge(profile, null, now)).toBe(true);
  });

  it('stays hidden once dismissed for this exact profile version', () => {
    const profile = makeProfile(setUpAt);
    const now = new Date('2026-03-01T00:00:00.000Z');
    expect(shouldShowChangeNudge(profile, setUpAt, now)).toBe(false);
  });

  it('shows again after the profile is edited (new updatedAt), even if the old version was dismissed', () => {
    const editedAt = '2026-02-01T00:00:00.000Z';
    const profile = makeProfile(editedAt);
    // Dismissed for the *previous* version of the profile, not this one.
    const now = new Date('2026-04-01T00:00:00.000Z'); // 30+ days after the edit
    expect(shouldShowChangeNudge(profile, setUpAt, now)).toBe(true);
  });

  it('does not show for a freshly edited profile even if an older version was past due', () => {
    const editedAt = '2026-03-25T00:00:00.000Z';
    const profile = makeProfile(editedAt);
    const now = new Date('2026-03-26T00:00:00.000Z'); // 1 day after the edit
    expect(shouldShowChangeNudge(profile, null, now)).toBe(false);
  });
});
