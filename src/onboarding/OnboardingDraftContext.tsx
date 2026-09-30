import React, { createContext, useContext, useMemo, useState } from 'react';
import { ActivityLevel, Goal, Sex } from '../types/profile';
import { DEFAULT_ASSESSMENT } from './assessmentOptions';

/**
 * In-progress answers for the paged first-time onboarding flow. Scoped to
 * `OnboardingStack` (not `App.tsx`) so it lives only as long as the
 * onboarding pages are mounted — the `Assess` tab keeps its own local
 * state seeded from `ProfileContext` instead.
 *
 * `sex` starts unselected and `ageText` starts empty so the first two
 * pages ask rather than assume; the remaining fields start from sensible
 * defaults so later pages are never blank.
 */
export interface OnboardingDraft {
  sex: Sex | null;
  ageText: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

const INITIAL_DRAFT: OnboardingDraft = {
  sex: null,
  ageText: '',
  heightCm: DEFAULT_ASSESSMENT.heightCm,
  weightKg: DEFAULT_ASSESSMENT.weightKg,
  activityLevel: DEFAULT_ASSESSMENT.activityLevel,
  goal: DEFAULT_ASSESSMENT.goal,
};

interface OnboardingDraftContextValue {
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
}

const OnboardingDraftContext = createContext<OnboardingDraftContextValue | undefined>(undefined);

export function OnboardingDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_DRAFT);

  const value = useMemo<OnboardingDraftContextValue>(
    () => ({
      draft,
      updateDraft: (patch) => setDraft((prev) => ({ ...prev, ...patch })),
    }),
    [draft],
  );

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft(): OnboardingDraftContextValue {
  const ctx = useContext(OnboardingDraftContext);
  if (!ctx) {
    throw new Error('useOnboardingDraft must be used within an OnboardingDraftProvider');
  }
  return ctx;
}
