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
  theme/                Color tokens + light/dark theme (PRD §11.2) and shared spacing/radii
  types/                Shared domain types (UserProfile, etc.)
  storage/              Local on-device profile persistence (AsyncStorage), with validation (PRD §8.1, §12)
  profile/              App-level "current saved profile" state (ProfileContext) — decides Welcome vs. Results on launch
  onboarding/           Onboarding wizard state (draft context), unit conversion, and input validation — all pure/tested
  components/           Shared UI building blocks (PrimaryButton, OptionCard, UnitToggle, OnboardingScreenLayout)
  navigation/           React Navigation root stack + param types
  screens/              App screens (Welcome, Results)
  screens/onboarding/   The six onboarding step screens (sex, age, height, weight, activity, goal)
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
- [x] Color tokens WCAG AA-validated (PRD §11.2): see the audit at the top of `src/theme/colors.ts` and the self-checking tests in `src/theme/__tests__/contrast.test.ts`. The bright brand green and the original secondary-text gray both failed AA on light backgrounds and have been fixed (`greenDark` for icons/large text, `sage` for secondary text on light mode). Icon set and motion style still to come for the rest of milestone 2.
- [ ] **Core UI (in progress):** onboarding flow, results dashboard, nutrient detail / education screens, paywall screen.
  - [x] Local profile persistence (`src/storage/profileStorage.ts`) — save/load/clear against AsyncStorage, with a runtime type guard so corrupted or stale-schema data never crashes the app (falls back to "no profile" / re-onboard instead).
  - [x] Onboarding flow: Welcome → Sex → Age → Height → Weight → Activity → Goal (PRD §9), imperial-first with a metric toggle on height/weight. Draft answers live in `OnboardingDraftContext` until the final (Goal) screen, which builds the real `UserProfile`, saves it, and routes to Results. `ProfileContext` decides on launch whether to show Welcome (no profile) or Results (existing profile) — the "come back anytime" flow.
  - [x] v1 results screen (`src/screens/ResultsScreen.tsx`): full calorie/macro targets from the engine, plus every vitamin/mineral listed by name with a lock icon (everyone currently sees the locked view — there's no subscription/entitlement system yet, see milestone 5). A basic "Edit profile" link clears the profile and restarts onboarding (not yet pre-filled with existing answers — see below).
  - [ ] **Not yet done / known gaps to revisit:** pre-filled profile editing (currently a full reset), tapping a macro to see its plain-language explanation, the animated "reveal your numbers" treatment + illustrated icons (PRD §11.3), the 30-day "has anything changed?" nudge (PRD §8.1), and keyboard-avoiding behavior on the input screens.
- [ ] Education layer content (plain-language explanations per nutrient)
- [ ] Subscription/entitlement integration (App Store / Play Store billing, likely via RevenueCat per PRD §12)
- [ ] Accessibility + edge-case testing pass
- [ ] v1 release to a small test group

## Notable v1 decisions from the PRD

- **No accounts, no cloud sync.** Everything lives on-device (PRD §8.1, §13).
- **Freemium:** macros are free forever; the full micronutrient set is behind a subscription, shown as a locked (name-only, no values) teaser to free users (PRD §7, §8.4).
- **Non-judgmental, plain-language tone** — no red/green alarm language, no diet-culture scorecards (PRD §11.1).
