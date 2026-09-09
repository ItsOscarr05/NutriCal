import { MacroKey } from '../data/education/macroExplanations';
import { Goal } from '../types/profile';

/**
 * Root stack param list, kept in its own module (rather than inline in
 * RootNavigator.tsx) so screens can import the type without creating a
 * circular import with the navigator that renders them.
 *
 * Mirrors the v1 user flow (PRD §9):
 * Welcome -> Sex -> Age -> Height -> Weight -> Activity -> Goal -> Results.
 * `MacroDetail` is a modal reached from Results (PRD §8.4 — tapping an
 * unlocked macro opens its plain-language explanation), not a wizard step.
 * `Results`'s `justCompleted` param is set only by `GoalScreen` right after
 * finishing (or re-finishing, via edit) the wizard, so `ResultsScreen` can
 * show a one-time celebratory reveal (PRD §11.3) instead of on every
 * routine app open.
 */
export type RootStackParamList = {
  Welcome: undefined;
  Sex: undefined;
  Age: undefined;
  Height: undefined;
  Weight: undefined;
  Activity: undefined;
  Goal: undefined;
  Results: { justCompleted?: boolean } | undefined;
  MacroDetail: { macro: MacroKey; grams: number; percent: number; goal: Goal };
};
