import { NavigatorScreenParams } from '@react-navigation/native';
import { MacroKey } from '../data/education/macroExplanations';
import { Goal } from '../types/profile';

/**
 * Bottom tab shell (v1.1 Stitch redesign), reached once a profile exists.
 * Targets/Assess/Micros/Science mirror the Stitch mockups' persistent
 * nav bar. `Targets`'s `justCompleted` param is set only by `GoalScreen`
 * right after finishing (or re-finishing, via edit) onboarding, so that
 * tab can show a one-time celebratory reveal (PRD §11.3) instead of on
 * every routine app open — same semantics the old root-level `Results`
 * route param had before this screen moved under the tab shell.
 */
export type MainTabParamList = {
  Targets: { justCompleted?: boolean } | undefined;
  Assess: undefined;
  Micros: undefined;
  Science: undefined;
};

/**
 * Root stack param list, kept in its own module (rather than inline in
 * RootNavigator.tsx) so screens can import the type without creating a
 * circular import with the navigator that renders them.
 *
 * Mirrors the v1.1 user flow: Welcome -> QuickAssessment -> Main. The old
 * 6-step wizard (Sex -> Age -> Height -> Weight -> Activity -> Goal) is
 * gone, replaced by one screen (`QuickAssessmentScreen`) mounted here for
 * first-time onboarding and reused as the `Assess` tab inside `Main` for
 * editing an existing profile.
 *
 * `MacroDetail` and `Settings` are both modals reached from the `Main`
 * tab shell (PRD §8.4 for `MacroDetail`; the gear icon for `Settings`),
 * not tabs themselves.
 */
export type RootStackParamList = {
  Welcome: undefined;
  QuickAssessment: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  MacroDetail: { macro: MacroKey; grams: number; percent: number; goal: Goal };
  Settings: undefined;
};
