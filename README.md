# NutriCal

NutriCal is a mobile app (iOS + Android) that turns your height, weight, sex, age, activity level, and goal into personalized, science-based daily targets for calories, protein, carbs, fat, and (premium) the full range of vitamins and minerals — no food logging, no account, no clinical jargon.

Inspired by [Yuka](https://yuka.io/)'s philosophy: take confusing nutrition science and turn it into one trustworthy, plain-language number. Where Yuka scores the food you're about to eat, NutriCal tells you what you should be aiming for in the first place.

Full product spec: [`project-docs/PRD.md`](./project-docs/PRD.md).

## Stack

- **Expo (React Native) + TypeScript** — cross-platform mobile from one codebase.
- **React Navigation** — a native-stack root (`Welcome` → paged `Onboarding` stack → `Main`, plus `MacroDetail`/`Settings` modals) wrapping a persistent bottom-tab shell (`@react-navigation/bottom-tabs`: Targets / Micros / Recipes / Science / Profile).
- **`react-native-svg`** — the `CircularProgress` progress ring and the `Mascot` illustration.
- **`@react-native-community/slider`** — height/weight/age sliders on the Profile tab's recalibrate form. First-time onboarding uses a height wheel and a weight number pad instead.
- **`@expo-google-fonts/plus-jakarta-sans` + `expo-font`** — the app's display typeface, matching the Stitch design system.
- **AsyncStorage** — local, on-device profile storage (v1 is no-account / local-only by design — see PRD §8.1, §12).
- **Jest** (`jest-expo` preset) — unit testing, especially for the calculation engine.

No backend. All reference data (DRI/RDA/AI/UL tables) is bundled with the app rather than fetched live (PRD §12).

## Project structure

```
src/
  engine/               BMR/TDEE + macro calculation engine (PRD §10) — pure, unit-tested functions
  data/dri/             DRI/RDA/AI/UL micronutrient reference tables, keyed by age/sex bracket (PRD §8.3, §10)
  data/education/       Plain-language macro explanation copy (PRD §8.4, §8.5) — pure content, unit-tested for completeness
  data/legal/           In-app Privacy Policy and Terms of Service copy — completeness-tested, not legal advice
  theme/                Color tokens (rebuilt from the Stitch design system, PRD §11.2) + light/dark theme and shared
                        spacing/radii; contrast-validated in `__tests__/contrast.test.ts`
  types/                Shared domain types (UserProfile, etc.)
  storage/              Local on-device persistence (AsyncStorage): profile (`profileStorage`), nudge dismissal
                        (`nudgeStorage`), app-level units/appearance preferences (`appSettingsStorage`)
  profile/              App-level "current saved profile" state (ProfileContext) — decides Welcome vs. the tab
                        shell on launch; also the "has anything changed?" nudge logic (`nudge.ts`, pure + tested)
                        and its hook (`useChangeNudge`)
  settings/             App-level preferences (units, appearance) — pure types/defaults (`appSettings.ts`) + a thin
                        React context (`AppSettingsContext`), the second top-level context alongside ProfileContext
  onboarding/           Unit conversion, input validation, and age/weight-text parsing (pure/tested); the onboarding
                        draft context; assessment controls shared by onboarding and the Profile tab (`ui/`)
  components/           Shared UI building blocks (PrimaryButton, UnitToggle, Logo, AnimatedNumber, AnimatedFillBar,
                        FadeInView, CelebrationBanner, ChangeNudgeCard, GearButton, CircularProgress, Mascot)
  navigation/           Root native-stack (`RootNavigator`), the paged `OnboardingStack`, the bottom-tab shell
                        (`MainTabs`) + shared param types
  screens/              App screens: Welcome, `onboarding/` (the six first-time pages), ProfileScreen (stats +
                        recalibrate), RecipesScreen (placeholder), ResultsScreen (Targets), ScienceBreakdownScreen,
                        MicronutrientExplorerScreen (Micros), MacroDetail modal, Settings modal,
                        LegalDocument modal (Privacy Policy / Terms of Service)
assets/                 Brand mark master (`nutrical_logo_transparent.png`) and the variants generated from it:
                        `logo.png`, Expo app icon / Android adaptive-icon / splash / favicon
assets/illustrations/   Generated bitmap illustrations (PRD §11.3) — currently none (macro icons are `MaterialIcons`
                        glyphs, and the mascot is a hand-ported `react-native-svg` illustration)
project-docs/
  PRD.md                The full product requirements document
```

## Navigation shape (v1.1)

The app used to be one straight-line flow: a 6-step onboarding wizard ending on a single Results screen. It's now a persistent bottom-tab shell (max five tabs):

- **Targets** (`ResultsScreen`) — the calorie/macro dashboard, reached after onboarding or on any return visit.
- **Micros** (`MicronutrientExplorerScreen`) — every vitamin/mineral by name, locked (no values/percentages) for free users — the freemium boundary (PRD §7, §8.4) is unchanged even though this screen's visual design comes from a mockup that showed real values to everyone.
- **Recipes** (`RecipesScreen`) — placeholder for future meal ideas / recommendations. No recipes or food APIs yet (PRD §6 lists meal planning as a v1 non-goal).
- **Science** (`ScienceBreakdownScreen`) — plain-language explanation of the BMR/TDEE math behind the calorie number, a personalized-vs-crash-diet comparison, and a self-check checklist.
- **Profile** (`ProfileScreen`) — local saved-stats summary plus the recalibration form (sliders + pills, live preview). Not an account — no login.

First-time onboarding (before a profile exists) is a separate paged flow, one question per page with a native slide between them: Sex → Age (number pad) → Body Composition (height wheel, weight number pad) → Daily Motion → Target Outcome → Metabolic Forecast, ending on the Targets tab.

`MacroDetail` (tap a macro card), `Settings` (gear icon on Targets), and `LegalDocument` (Privacy Policy / Terms from Settings → About) remain modals reached from inside the tab shell rather than tabs themselves.

## Getting started

```bash
npm install
npm start        # opens Expo dev tools — scan the QR with Expo Go, or press i/a for simulator/emulator
npm run ios       # requires macOS
npm run android
npm run web
```

## Testing

```bash
npm test          # run the engine's unit tests once
npm run test:watch
```

`src/engine/__tests__` validates the Mifflin-St Jeor BMR formula, TDEE activity multipliers, goal-based calorie adjustments, and macro-split math against known values (PRD §14 — "calculation engine must be validated against published DRI tables and standard BMR/TDEE formulas").

## Status

Following the milestones in PRD §17:

- [x] Project scaffold (Expo + TypeScript, navigation, theming, testing)
- [x] Calculation engine v1: BMR/TDEE (Mifflin-St Jeor) + goal-adjusted macro splits, with unit tests
- [x] **Data foundation:** DRI/RDA/AI/UL reference tables. All four standard **adult** brackets (19-30, 31-50, 51-70, 71+) plus the **adolescent** brackets (9-13, 14-18) × both sexes are seeded (`src/data/dri/adultBrackets.ts`, `adolescentBrackets.ts`), with tests covering the boundary shifts (vitamin D, B6, calcium, iron, magnesium, phosphorus UL, sodium AI, and the 9-13 → 14-18 iron jump for females). `MIN_SUPPORTED_AGE` (9) is exported from `src/data/dri/index.ts`. Pregnancy/lactation life stages are a deliberate **v1 non-goal** (revisit post-v1 — the schema already supports it via `lifeStage`). Still outstanding: cross-checking every value against the [NIH Office of Dietary Supplements DRI tables](https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx) — the adolescent sodium AI/CDRR figures are flagged as the least confident.
- [x] Color tokens WCAG AA-validated (PRD §11.2): see the audit at the top of `src/theme/colors.ts` and the self-checking tests in `src/theme/__tests__/contrast.test.ts`.
- [x] **v1.1 redesign — Stitch mockup-driven visual/IA overhaul.** Found and adopted a set of 4 Google Stitch mockups (Daily Targets Dashboard, Science Breakdown, Quick Assessment, Micronutrient Explorer) as the new design direction:
  - [x] **New theme.** `src/theme/colors.ts` rebuilt from the Stitch design system's Material Design 3-style token set (`primary`/`primaryContainer`/`primaryFixed`, `secondary`/`tertiary` families, `surfaceContainer*` tiers, etc.), every pairing re-validated against WCAG AA.
  - [x] **New navigation shell.** A persistent bottom tab bar (Targets/Micros/Recipes/Science/Profile, `src/navigation/MainTabs.tsx`) replaces the old single-flow stack — see "Navigation shape" above.
  - [x] **Quick Assessment / Profile editing.** First-time onboarding is a paged stack. Recalibrating an existing profile is the `Profile` tab (`AssessmentEditor` sliders/pills + live preview from the real calculation engine), not a separate Assess tab.
  - [x] **Targets dashboard.** `ResultsScreen` redesigned around a mascot hero, a big animated `CircularProgress` calorie dial, per-macro cards with mini progress rings, a plain-language "why this works" banner, and a "Recalibrate My Targets" CTA. The old locked micronutrient list moved off this screen entirely.
  - [x] **Science Breakdown.** New `Science` tab: an honest, presentational BMR/NEAT/Exercise/TEF energy-budget breakdown (BMR/TDEE/calorie-target numbers are real, from the engine; the NEAT/Exercise/TEF sub-split is a clearly-labeled illustrative estimate, not a new validated formula), a personalized-vs-crash-diets comparison, and a self-check checklist.
  - [x] **Micronutrient Explorer.** New `Micros` tab: every vitamin/mineral by name with a lock affordance — deliberately *not* adopting the mockup's "show real values/percentages/food-sources to everyone," to preserve the existing freemium paywall rule (PRD §7, §8.4) since no entitlement system exists yet.
  - [x] New primitives: `CircularProgress` (an SVG progress ring, `react-native-svg`) and `Mascot` (a ported Stitch character illustration), both reduce-motion-aware like the app's existing animation primitives.
- [ ] Subscription/entitlement integration (App Store / Play Store billing, likely via RevenueCat per PRD §12) — this remains the blocker for turning `Micros`' locked teaser into real personalized values, and for writing micronutrient education copy (the macro equivalent of `src/data/education/macroExplanations.ts`)
- [ ] Accessibility + edge-case testing pass
- [ ] v1 release to a small test group

## Notable v1 decisions from the PRD

- **No accounts, no cloud sync.** Everything lives on-device (PRD §8.1, §13).
- **Freemium:** macros are free forever; the full micronutrient set is behind a subscription, shown as a locked (name-only, no values) teaser to free users (PRD §7, §8.4).
- **Non-judgmental, plain-language tone** — no red/green alarm language, no diet-culture scorecards (PRD §11.1).
