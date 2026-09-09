/**
 * Root stack param list, kept in its own module (rather than inline in
 * RootNavigator.tsx) so screens can import the type without creating a
 * circular import with the navigator that renders them.
 *
 * Mirrors the v1 user flow (PRD §9):
 * Welcome -> Sex -> Age -> Height -> Weight -> Activity -> Goal -> Results.
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
};
