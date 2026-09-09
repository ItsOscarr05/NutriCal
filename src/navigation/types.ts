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
 */
export type RootStackParamList = {
  Welcome: undefined;
  Sex: undefined;
  Age: undefined;
  Height: undefined;
  Weight: undefined;
  Activity: undefined;
  Goal: undefined;
  Results: undefined;
  MacroDetail: { macro: MacroKey; grams: number; percent: number; goal: Goal };
};
