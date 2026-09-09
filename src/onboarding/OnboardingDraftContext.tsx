import React, { createContext, useContext, useMemo, useState } from 'react';
import { ActivityLevel, Goal, Sex } from '../types/profile';

/**
 * In-memory draft of the profile being built across the onboarding wizard
 * (sex -> age -> height -> weight -> activity -> goal, PRD §9). Each screen
 * commits its own field here when the user taps "Continue," so the final
 * (Goal) screen can read everything collected so far without prop-drilling
 * through six navigation params. Nothing here touches disk — persistence
 * happens once, at the end, via `ProfileContext`/`profileStorage`.
 */
export interface OnboardingDraft {
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
}

interface OnboardingDraftContextValue {
  draft: OnboardingDraft;
  setSex: (sex: Sex) => void;
  setAge: (age: number) => void;
  setHeightCm: (heightCm: number) => void;
  setWeightKg: (weightKg: number) => void;
  setActivityLevel: (activityLevel: ActivityLevel) => void;
  reset: () => void;
}

const EMPTY_DRAFT: OnboardingDraft = {};

const OnboardingDraftContext = createContext<OnboardingDraftContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);

  const value = useMemo<OnboardingDraftContextValue>(
    () => ({
      draft,
      setSex: (sex) => setDraft((d) => ({ ...d, sex })),
      setAge: (age) => setDraft((d) => ({ ...d, age })),
      setHeightCm: (heightCm) => setDraft((d) => ({ ...d, heightCm })),
      setWeightKg: (weightKg) => setDraft((d) => ({ ...d, weightKg })),
      setActivityLevel: (activityLevel) => setDraft((d) => ({ ...d, activityLevel })),
      reset: () => setDraft(EMPTY_DRAFT),
    }),
    [draft]
  );

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft(): OnboardingDraftContextValue {
  const ctx = useContext(OnboardingDraftContext);
  if (!ctx) {
    throw new Error('useOnboardingDraft must be used within an OnboardingProvider');
  }
  return ctx;
}
