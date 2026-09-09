# NutriCal

NutriCal is a mobile app (iOS + Android) that turns your height, weight, sex, age, activity level, and goal into personalized, science-based daily targets for calories, protein, carbs, fat, and (premium) the full range of vitamins and minerals — no food logging, no account, no clinical jargon.

Inspired by [Yuka](https://yuka.io/)'s philosophy: take confusing nutrition science and turn it into one trustworthy, plain-language number. Where Yuka scores the food you're about to eat, NutriCal tells you what you should be aiming for in the first place.

Full product spec: [`project-docs/PRD.md`](./project-docs/PRD.md).

## Stack

- **Expo (React Native) + TypeScript** — cross-platform mobile from one codebase.
- **React Navigation** (native-stack) — screen flow.
- **AsyncStorage** — local, on-device profile storage (v1 is no-account / local-only by design — see PRD §8.1, §12).
- **Jest** (`jest-expo` preset) — unit testing, especially for the calculation engine.

No backend. All reference data (DRI/RDA/AI/UL tables) is bundled with the app rather than fetched live (PRD §12).

## Project structure

```
src/
  engine/               BMR/TDEE + macro calculation engine (PRD §10) — pure, unit-tested functions
  data/dri/             DRI/RDA/AI/UL micronutrient reference tables, keyed by age/sex bracket (PRD §8.3, §10)
  data/education/       Plain-language macro explanation copy (PRD §8.4, §8.5) — pure content, unit-tested for completeness
  theme/                Color tokens + light/dark theme (PRD §11.2) and shared spacing/radii
  types/                Shared domain types (UserProfile, etc.)
  storage/              Local on-device profile persistence (AsyncStorage), with validation (PRD §8.1, §12)
  profile/              App-level "current saved profile" state (ProfileContext) — decides Welcome vs. Results on launch
  onboarding/           Onboarding wizard state (draft context), unit conversion, and input validation — all pure/tested
  components/           Shared UI building blocks (PrimaryButton, OptionCard, UnitToggle, OnboardingScreenLayout,
                        AnimatedNumber, AnimatedFillBar, FadeInView, CelebrationBanner)
  navigation/           React Navigation root stack + param types
  screens/              App screens (Welcome, Results, MacroDetail modal)
  screens/onboarding/   The six onboarding step screens (sex, age, height, weight, activity, goal)
assets/illustrations/   Generated illustration assets (PRD §11.3) — welcome hero + macro icons
project-docs/
  PRD.md                The full product requirements document
```

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

Early scaffold. Following the milestones in PRD §17:

- [x] Project scaffold (Expo + TypeScript, navigation, theming, testing)
- [x] Calculation engine v1: BMR/TDEE (Mifflin-St Jeor) + goal-adjusted macro splits, with unit tests
- [x] **Data foundation:** DRI/RDA/AI/UL reference tables. All four standard **adult** brackets (19-30, 31-50, 51-70, 71+) plus the **adolescent** brackets (9-13, 14-18) × both sexes are seeded (`src/data/dri/adultBrackets.ts`, `adolescentBrackets.ts`), with tests covering the boundary shifts (vitamin D, B6, calcium, iron, magnesium, phosphorus UL, sodium AI, and the 9-13 → 14-18 iron jump for females). `MIN_SUPPORTED_AGE` (9) is exported from `src/data/dri/index.ts` for onboarding to enforce once an age input step exists — ages below it intentionally return no data (infant/toddler DRI is caregiver-administered, a different UX problem). Pregnancy/lactation life stages are a deliberate **v1 non-goal** (revisit post-v1 — the schema already supports it via `lifeStage`). Still outstanding: cross-checking every value against the [NIH Office of Dietary Supplements DRI tables](https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx) — the adolescent sodium AI/CDRR figures are flagged as the least confident.
- [x] Color tokens WCAG AA-validated (PRD §11.2): see the audit at the top of `src/theme/colors.ts` and the self-checking tests in `src/theme/__tests__/contrast.test.ts`. The bright brand green and the original secondary-text gray both failed AA on light backgrounds and have been fixed (`greenDark` for icons/large text, `sage` for secondary text on light mode). Macro icon set and core motion style are done (see the animations/illustrations bullet under Core UI below); the full micronutrient icon set is deferred to when that section has real UI (milestone 5).
- [ ] **Core UI (in progress):** onboarding flow, results dashboard, nutrient detail / education screens, paywall screen.
  - [x] Local profile persistence (`src/storage/profileStorage.ts`) — save/load/clear against AsyncStorage, with a runtime type guard so corrupted or stale-schema data never crashes the app (falls back to "no profile" / re-onboard instead).
  - [x] Onboarding flow: Welcome → Sex → Age → Height → Weight → Activity → Goal (PRD §9), imperial-first with a metric toggle on height/weight. Draft answers live in `OnboardingDraftContext` until the final (Goal) screen, which builds the real `UserProfile`, saves it, and routes to Results. `ProfileContext` decides on launch whether to show Welcome (no profile) or Results (existing profile) — the "come back anytime" flow.
  - [x] v1 results screen (`src/screens/ResultsScreen.tsx`): full calorie/macro targets from the engine, plus every vitamin/mineral listed by name with a lock icon (everyone currently sees the locked view — there's no subscription/entitlement system yet, see milestone 5). "Edit profile" re-enters the same onboarding wizard prefilled with the current answers (via `hydrateFromProfile` on `OnboardingDraftContext`) instead of clearing the profile and starting over; the saved profile isn't touched until the wizard is completed again, so backing out mid-edit leaves it intact. The Goal screen's button reads "Save changes" instead of "See my numbers" when editing.
  - [x] Macro explanations (PRD §8.4): tapping a macro card opens `MacroDetailScreen` as a modal — what it does, why *this* user's number is what it is (personalized per goal), and what happens with too little/too much. Content lives in `src/data/education/macroExplanations.ts`, kept as reviewable copy separate from the calculation engine, with tests only checking completeness (every macro × every goal has non-empty text), not wording.
  - [x] Animations & illustrations (PRD §11.3): illustrated, rounded macro icons (protein/carbs/fat, `assets/illustrations/`) and a welcome-screen hero illustration, all generated in a consistent friendly-cartoon style. Calorie/macro numbers count up on mount (`AnimatedNumber`), each macro card has a fill-in progress bar tinted to match its icon (`AnimatedFillBar`), macro cards and the welcome hero fade/slide in on mount (`FadeInView`), and finishing (or re-finishing, via edit) the onboarding wizard shows a one-time celebratory banner on Results (`CelebrationBanner`, driven by a `justCompleted` nav param — never replayed on a routine app open). All built on React Native's built-in `Animated` API (no new dependency) and respect the OS "reduce motion" accessibility setting. Micronutrient icons are deferred until that section has real (unlocked) UI beyond a name + lock (milestone 5).
  - [ ] **Not yet done / known gaps to revisit:** the 30-day "has anything changed?" nudge (PRD §8.1), and keyboard-avoiding behavior on the input screens.
- [x] Education layer content — macros done (see above); micronutrient explanations are blocked on the premium/entitlement system (milestone 5) since that content is gated
- [ ] Subscription/entitlement integration (App Store / Play Store billing, likely via RevenueCat per PRD §12)
- [ ] Accessibility + edge-case testing pass
- [ ] v1 release to a small test group

## Notable v1 decisions from the PRD

- **No accounts, no cloud sync.** Everything lives on-device (PRD §8.1, §13).
- **Freemium:** macros are free forever; the full micronutrient set is behind a subscription, shown as a locked (name-only, no values) teaser to free users (PRD §7, §8.4).
- **Non-judgmental, plain-language tone** — no red/green alarm language, no diet-culture scorecards (PRD §11.1).
