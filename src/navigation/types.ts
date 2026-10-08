import { NavigatorScreenParams } from '@react-navigation/native';
import { MacroKey } from '../data/education/macroExplanations';
import { LegalKind } from '../data/legal/legalDocuments';
import { Goal } from '../types/profile';

/**
 * Bottom tab shell (v1.1 Stitch redesign), reached once a profile exists.
 * Home (daily overview), Targets (macros + locked micros), Recipes
 * (placeholder), Science, and a local Profile tab (saved stats +
 * recalibrate form; no account). `Targets`'s
 * `justCompleted` param is set only by `MetabolicForecastScreen` right
 * after first-time onboarding, so that tab can show a one-time celebratory
 * reveal (PRD §11.3) instead of on every routine app open.
 */
export type MainTabParamList = {
  Home: undefined;
  /** `view` opens a specific toggle (e.g. Home's "Explore all micros" link). */
  Targets: { justCompleted?: boolean; view?: 'macros' | 'micros' } | undefined;
  Recipes: undefined;
  Science: undefined;
  Profile: { edit?: boolean } | undefined;
};

/**
 * Paged first-time onboarding, one page per question, rendered by
 * `OnboardingStack` as the root `Onboarding` route.
 */
export type OnboardingStackParamList = {
  Sex: undefined;
  Age: undefined;
  BodyComposition: undefined;
  BodyFat: undefined;
  DailyMotion: undefined;
  TargetOutcome: undefined;
  MetabolicForecast: undefined;
};

/**
 * Root stack param list, kept in its own module (rather than inline in
 * RootNavigator.tsx) so screens can import the type without creating a
 * circular import with the navigator that renders them.
 *
 * Mirrors the user flow: Welcome -> Onboarding (paged) -> Main.
 *
 * `MacroDetail`, `Settings`, and `LegalDocument` are modals reached from
 * the `Main` tab shell (PRD §8.4 for `MacroDetail`; the gear icon for
 * `Settings`; About rows for Privacy Policy / Terms of Service), not tabs
 * themselves.
 */
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  MacroDetail: { macro: MacroKey; grams: number; percent: number; goal: Goal };
  Settings: undefined;
  LegalDocument: { kind: LegalKind };
};
