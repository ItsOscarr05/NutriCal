# Product Requirements Document: NutriCal

| | |
|---|---|
| **Author** | Oscar Berrigan |
| **Status** | Draft v1.2 |
| **Date** | September 9, 2026 |
| **Platform** | Mobile (iOS + Android) |

---

## 1. Overview

NutriCal is a mobile app that tells people exactly how much of every macronutrient and micronutrient they personally need each day. A user enters basic physical information — height, weight, sex, age, and activity level — and NutriCal returns a personalized, science-based daily target for calories, protein, carbs, fat, and the full range of vitamins and minerals (vitamin D, iron, calcium, potassium, B12, and so on).

The product is inspired by Yuka's core philosophy: take something confusing and jargon-heavy (nutrition science) and turn it into a simple, trustworthy, plain-language number people can actually use. Where Yuka scores the food you're about to eat, NutriCal starts one step earlier — it tells you what you should be aiming for in the first place.

## 2. Problem Statement

Most people have no idea how many calories, grams of protein, or milligrams of iron they actually need in a day. The information exists — the USDA and NIH publish detailed Dietary Reference Intakes (DRI) — but it's buried in dense government tables organized by 15 different age/sex brackets, not something a person can look up in ten seconds on their phone. Generic advice ("2,000 calories a day," "eat your vegetables") isn't personalized, and most calorie-counting apps focus on logging food rather than establishing what your targets should be in the first place. NutriCal closes that gap: input your body, get your numbers.

## 3. Goals & Success Metrics

**Goals**

- Give any user an accurate, personalized set of daily macro and micronutrient targets in under two minutes.
- Make nutrient science legible — plain-language explanations, not clinical tables.
- Build a foundation (data model, calculation engine, design system) that a v2 (logging, scanning) can be built on top of without a rewrite.

**Success metrics for v1**

- Time from app open to seeing personalized results: under 2 minutes for a first-time user.
- Onboarding completion rate: >70% of users who start the profile flow finish it.
- 7-day return rate: users come back to check or adjust their profile/targets at least once.
- Free-to-paid conversion rate on the micronutrient paywall (see Section 7).
- Qualitative: users report the results feel personalized and understandable, not like a spreadsheet.

## 4. Non-Goals (Out of Scope for v1)

To keep v1 shippable, NutriCal v1 explicitly does **not** include:

- Food logging or diary tracking.
- Barcode or label scanning of packaged products.
- Meal planning or recipe suggestions.
- Social features, sharing, or community.
- Integration with wearables (Apple Health, Fitbit, etc.).
- User accounts or cloud sync (see Section 8.1 — v1 is local-only, onboard-and-go).
- Medical-grade guidance for diagnosed conditions (e.g., diabetes management, renal diets) — NutriCal is a wellness tool, not a clinical one.

These are strong candidates for future phases (see Section 15) but are deliberately cut from v1 so the core value — "know your numbers" — ships well and fast.

## 5. Target Users

**Primary persona (v1): the general health-conscious consumer.** Someone who cares about eating well but doesn't have a nutrition science background — they know they should "get enough protein" or "watch their sodium" but have never seen an actual number tied to their own body. They're the same audience Yuka has already proven wants simple, trustworthy nutrition information: people who feel a little lost in the wellness/supplement aisle and want a straight answer instead of marketing claims.

This is intentionally broad for v1. As the product matures, it can sharpen toward sub-personas like fitness-focused users (macro precision for training goals) or condition-aware users (pregnancy, specific deficiencies) — but v1 should work well for a generalist first.

## 6. Competitive Landscape

**Yuka** is the direct product inspiration and closest comparable. It has grown to roughly 73 million users globally (about 23 million in the U.S.) purely through word of mouth, with zero paid advertising spend. Its model: scan a barcode on a packaged food or personal care product, get an instant 0–100 score based on nutritional quality, additives, and organic status. It monetizes through a freemium subscription (~$10/month) that unlocks in-app product search without needing a physical scan, plus dietary-preference filtering (gluten-free, vegetarian, etc.). Its credibility comes from editorial independence — Yuka refuses financing or partnerships from the brands it rates.

NutriCal's differentiation: Yuka tells you if a *product* is good or bad in the abstract. NutriCal tells you what *you personally* need, independent of any specific product — the foundation a Yuka-style scoring feature could eventually be built on top of ("this product gets you 40% of your daily iron target," for example, is a natural v2/v3 feature once both target-setting and product data exist).

Other adjacent competitors (Cronometer, MyFitnessPal, MacroFactor) are food-logging-first tools where nutrient targets are a secondary, often buried feature rather than the core product. NutriCal's bet is that "know your numbers" is valuable as a standalone product, not just a preamble to logging.

## 7. Monetization Strategy

NutriCal launches with a **freemium model**, directly modeled on Yuka's proven approach of making the core experience free and gating a clearly valuable extension behind a subscription:

- **Free tier:** Full onboarding and the complete macronutrient engine — calories, protein, carbs, and fat targets, with the plain-language explanation layer for each.
- **Premium tier (subscription):** Unlocks the full micronutrient engine — all vitamin and mineral targets (see Section 8.3) — plus their corresponding explanation layer.
- **Upsell moment:** The results dashboard shows the micronutrient section to free users as a locked teaser — nutrient names visible, each with a generic lock icon, no values shown — rather than omitting it entirely. This mirrors how Yuka surfaces its locked search feature to free users, making the value of upgrading concrete rather than abstract, without needing the added complexity of blurred numeric previews.
- **Billing:** Native mobile subscription billing (Apple App Store / Google Play), not a custom payment system — simplest to implement and what users expect from a mobile app.
- **Pricing:** $4.99/month, or $49.99/year on an annual plan — the annual plan is priced as a discount against paying monthly year-round ($59.88/year), which also gives the upgrade screen a natural "save X%" pitch. Notably below Yuka's ~$10/month reference point, keeping NutriCal's single-feature unlock priced accessibly.

This interacts with the no-account decision in Section 8.1: since there's no NutriCal login, entitlement (whether a given install has an active subscription) is tracked via the platform's own purchase/receipt system rather than a server-side user account. See Section 11 and Section 16 for the technical and risk implications.

## 8. MVP Scope (v1 Feature Set)

### 8.1 Onboarding & Profile (No-Account, Local-Only)

v1 is a **no-account, "onboard and go" experience** — no sign-up, login, or cloud sync. A user opens the app, completes onboarding, and immediately sees their results. All profile data is stored locally on the device (see Section 11).

Users create a profile with:

- Sex (used in DRI calculations; the DRI tables themselves are sex-specific)
- Age
- Height
- Weight
- Activity level — a simple 5-tier picker (sedentary / lightly active / moderately active / very active / extremely active)
- Goal (maintain / lose weight / gain weight / build muscle) — included in v1 onboarding and used to adjust the calorie target from the maintenance (TDEE) baseline

The profile should be editable at any time — as a person's weight, activity, or goals change, their targets should recalculate automatically. Since there's no account or push-notification-driven engagement loop planned for v1, the recommended nudge is a lightweight in-app one: a soft, dismissible prompt on the results dashboard ("Has anything changed since you set this up?") that appears once a profile is about 30 days old, rather than a push notification — this keeps the no-account model clean while still encouraging users to keep their numbers current.

### 8.2 Macronutrient Recommendation Engine (Free)

Calculates and displays daily targets for:

- Calories (via BMR × activity multiplier, adjusted for stated goal)
- Protein (grams and % of calories)
- Carbohydrates (grams and % of calories)
- Fat (grams and % of calories)

See Section 10 for the specific formulas. Available to all users at no cost.

### 8.3 Micronutrient Recommendation Engine (Premium)

Calculates and displays daily targets for the full DRI nutrient set appropriate to the user's age/sex bracket:

- Vitamins: A, C, D, E, K, B6, B12, thiamin, riboflavin, niacin, folate
- Minerals: calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, selenium, iodine

Each nutrient should show the RDA/AI value pulled from the correct age/sex bracket, not a generic average. Gated behind the premium subscription (Section 7); shown as a locked preview to free users.

### 8.4 Results Dashboard

A single, clean screen (Yuka-style simplicity) showing macro targets in full, plus a micronutrient section listing every vitamin/mineral by name with a generic lock icon for free users (no values shown until unlocked). Tapping an unlocked macro nutrient opens a plain-language explanation of what it does and why the user's specific number is what it is; tapping a locked micronutrient opens the premium upgrade screen.

### 8.5 Education Layer

For every macro and micronutrient, a short, non-clinical explanation: what it does in the body, why this user's target is what it is, and what happens with too little or too much (drawing on UL data where relevant). This is the "translation" layer that mirrors what makes Yuka's scoring feel trustworthy rather than arbitrary.

## 9. User Flow (v1)

1. User opens app → welcome/value-prop screen (no login).
2. Guided onboarding: sex → age → height → weight → activity level → goal.
3. App calculates targets and shows an animated "your numbers" results screen — macro targets in full, micronutrients as a locked teaser.
4. User can tap any unlocked nutrient to see its explanation and personalized value, or tap the locked micronutrient section to view the premium upgrade screen.
5. User can return anytime to view their dashboard or edit their profile, which recalculates targets locally.

## 10. Nutrient Calculation Methodology & Data Sources

This is the credibility core of the product — it needs to be scientifically defensible, and it should be transparent to users (a "how we calculate this" page builds the same trust Yuka gets from disclosing its scoring methodology).

**Calories (BMR/TDEE):** Use the Mifflin-St Jeor equation to calculate Basal Metabolic Rate from sex, age, height, and weight — it's the equation most current dietetics guidance treats as most accurate for the general population (more accurate than the older Harris-Benedict formula). Multiply BMR by a standard activity factor (1.2–1.9 depending on activity tier) to get Total Daily Energy Expenditure, then adjust up/down based on the user's stated goal.

**Macronutrients:** Derive protein/carb/fat gram targets from acceptable macronutrient distribution ranges (AMDR) as a percentage of total calories, informed by the user's goal (e.g., higher protein % for a muscle-building goal).

**Micronutrients:** Pull RDA/AI values from the National Academies' Dietary Reference Intakes (DRI) tables, as published and organized by the NIH Office of Dietary Supplements. These tables are broken into specific age/sex/life-stage brackets — NutriCal's data layer needs to store and correctly bucket users into the right bracket rather than interpolating or averaging. There's no live API for DRI values (they're published as static reference tables from the National Academies), so this will need to be structured into NutriCal's own database at build time — one clear technical task for the engineering phase, not something to solve at request-time.

**Tolerable Upper Intake Levels (UL):** Store alongside RDA/AI values so the education layer can show "too much" context, not just minimums.

**Food composition data (future use):** USDA FoodData Central has a public, free API and is the natural source once food logging or product scanning is added in a later phase — noting it now so the nutrient data model is built compatibly from day one.

## 11. Visual Identity & Design System

### 11.1 Design Principles

- **Plain language over clinical language.** "You need more iron than most people your age because of X" beats "Fe: 18mg/day (RDA)."
- **One number, not a spreadsheet.** Every nutrient should have one clear, confident target — the complexity of DRI brackets is the app's job to resolve, not the user's.
- **Trust through transparency.** Show the "why" and the methodology on request, the way Yuka discloses its scoring logic — this is what turns a number into something people believe.
- **Non-judgmental tone.** No red/green alarm language, no shame framing — this is a tool for understanding your body, not a diet-culture scorecard.
- **Fast to first value.** A user should see their personalized numbers within their first two minutes in the app, before being asked for anything else.

### 11.2 Color System

NutriCal heavily imitates Yuka's visual language: clean, bright, and confident rather than clinical.

- **Light mode:** White backgrounds with green as the primary accent color — used for CTAs, progress indicators, nutrient icons, and the "everything's on track" state. A secondary, slightly deeper green can be used for depth (shadows, pressed states) without introducing a whole new hue.
- **Dark mode:** Dark navy blue as the background color (not pure black), with the same green accent carrying through for consistency and brand recognition across modes. Text and iconography shift to white/light-gray for contrast against navy.
- **Accessibility check:** Both pairings (green-on-white, green-on-navy) need to be validated against WCAG AA contrast ratios before finalizing exact hex values — a bright Yuka-style green can fail contrast on white at small text sizes, so it should be reserved for large text, icons, and fills, with a darker green or near-black text color used for body copy.

### 11.3 Illustration & Motion Style

To match Yuka's approachable, non-clinical feel, NutriCal should lean into an **animated, cartoonish visual style** rather than a flat clinical/medical one:

- **Illustrated nutrient icons:** Each vitamin/mineral and macro gets a friendly, rounded, illustrated icon (not a literal medical/molecular icon) — think approachable character-style icons rather than textbook diagrams.
- **Rounded, soft UI shapes:** Rounded corners, soft shadows, and generous whitespace throughout, consistent with Yuka's friendly (not sterile) product feel.
- **Micro-animations as feedback:** The results screen should feel alive — e.g., calorie/macro numbers animating up as they calculate, progress rings or bars filling in on load, a small celebratory animation when onboarding completes. These moments are what make the "reveal your numbers" experience feel rewarding rather than transactional.
- **Playful, rounded typography:** A friendly sans-serif typeface with rounded terminals reinforces the cartoonish tone without sacrificing legibility for numeric data.
- **Consistency across modes:** Animations and illustration style should stay identical between light and dark mode — only the background/text/surface colors swap.

## 12. Technical Considerations

- **Platform:** Cross-platform mobile (iOS + Android) — a framework like React Native or Flutter is a reasonable default to hit both platforms from one codebase, worth deciding early since it shapes the rest of the stack.
- **No-account architecture:** Since v1 has no login or cloud sync, profile data lives entirely in local on-device storage. This substantially simplifies the backend — v1 may not need a traditional server/database at all, aside from bundled static reference data (DRI/RDA tables) shipped with the app.
- **Subscription/entitlement handling:** Because there's no NutriCal account, premium entitlement must be checked against the platform's own purchase state (StoreKit on iOS, Play Billing on Android) — a library like RevenueCat is worth evaluating to avoid building receipt validation and restore-purchase logic from scratch.
- **Nutrient reference database:** DRI/RDA/AI/UL tables need to be structured into the app's own bundled dataset (e.g., a table keyed by nutrient × age bracket × sex × life stage) since no live government API exists for this data — this is a one-time data-modeling effort during build.
- **Calculation engine:** Should be a clean, testable module separate from UI — BMR/TDEE and macro math are formula-driven and unit-testable; DRI lookups are a keyed table lookup. Get this right once and it's reusable across all future features.
- **Data model built for extension:** Even though v1 has no logging, design the schema so a future "logged food" entity — and, if Phase 2+ introduces accounts for cross-device sync — can reference the same nutrient definitions used for targets, avoiding a v2 rebuild.
- **Offline-first:** Since v1 has no live external data dependency after install (all reference data is static/bundled) and no account system, the app should work fully offline after the app store download completes.
- **Anonymous device identifier:** Use a single, randomly generated on-device ID (not derived from any personal or profile data) for two narrow purposes: aggregate crash/usage analytics and caching subscription entitlement locally so the app doesn't need to re-check the store on every launch. This ID is never linked to height/weight/age/sex data and isn't a user account — it should be disclosed plainly in onboarding copy so it doesn't undercut the "nothing personal leaves your device" privacy story.

## 13. Data Privacy Considerations

NutriCal collects body metrics (height, weight, age, sex) — data users reasonably consider sensitive even though it isn't a diagnosed medical condition. The no-account, local-only design in Section 8.1 substantially simplifies this story:

- Profile data stays on-device by default — it is not transmitted to or stored on a NutriCal server in v1, since there is no account system to store it against.
- The only data that leaves the device in v1 is what's inherently required for subscription billing (handled by Apple/Google's platform purchase systems, not a custom NutriCal backend).
- Be explicit in onboarding about what's collected, that it stays on-device, and why it's needed — this is also a trust/differentiation lever, mirroring the independence that's core to Yuka's brand credibility.
- Avoid framing or copy that could read as medical/diagnostic advice, to stay clearly in wellness-tool territory rather than requiring clinical-grade compliance.

## 14. Non-Functional Requirements

- **Accuracy:** Calculation engine must be validated against published DRI tables and standard BMR/TDEE formulas — mismatches here undermine the entire premise of the product.
- **Performance:** Results screen should render immediately after onboarding (no perceptible calculation lag) since all math is local, static-table lookups.
- **Accessibility:** Standard mobile accessibility support (dynamic text sizing, screen reader labels, sufficient color contrast — see Section 11.2) since this is a health-adjacent, general-audience app.
- **Scalability of data model:** Nutrient reference data should be structured so that adding new nutrients or updating DRI values (the National Academies revises these periodically) doesn't require a schema change.

## 15. Future Phases (Post-MVP Roadmap)

Not committed, but worth capturing now since several were raised as natural next steps during scoping:

- **Phase 2 — Food logging & tracking:** Let users log what they eat and see running progress against their daily targets.
- **Phase 3 — Product/label scanning (the Yuka-style signature feature):** Barcode scanning against a product database (USDA FoodData Central is the natural free data source) to show how a specific product fits a user's personal targets — the most direct product-level nod to Yuka, and a strong differentiator once the target-setting foundation is proven.
- **Phase 4 — Personalized food suggestions:** "You're low on iron this week — here are foods that would help," using the same nutrient data model built in v1.
- **Later considerations:** wearable integration, meal planning, condition-aware modes (pregnancy, specific deficiencies), social/sharing features, and — if cross-device sync or logging history becomes valuable enough — revisiting the no-account decision with an optional (not required) account layer.

The v1 architecture decisions in Section 12 are chosen specifically so these phases extend the product rather than requiring a rebuild.

## 16. Risks & Assumptions

- **Assumption:** Users are willing to input personal body metrics (height, weight, age, sex) in exchange for personalized value — this is a reasonable bet given Yuka's own success with sensitive-adjacent data (what people eat/use on their body), but should be validated with early users.
- **Risk:** Without a logging or scanning feature, v1 has no reason for daily/repeat use beyond checking or updating targets — return-usage patterns should be watched closely and may justify accelerating Phase 2 or 3.
- **Risk:** DRI/RDA science is nuanced (life-stage brackets, pregnancy/lactation adjustments, edge cases at bracket boundaries) — getting the data model wrong undermines the product's core credibility claim.
- **Risk:** Gating all micronutrient data behind the paywall could make the free tier feel too thin (only macros) to demonstrate the product's full value — conversion and free-tier retention should be watched closely post-launch, since the "locked preview" UX in Section 8.4 is the main lever to mitigate this.
- **Risk:** With no NutriCal account, restoring a premium purchase on a new device relies entirely on the user's Apple ID/Google account being recognized by the platform's billing system — the "Restore Purchases" flow needs to be reliable and clearly surfaced, since there's no username/password fallback.
- **Assumption:** A generalist v1 audience (rather than a narrow persona like athletes) is broad enough to validate demand before narrowing.

## 17. Milestones (Rough)

Since this is a student-built project rather than a funded team effort, milestones are intentionally scoped to be achievable solo:

1. **Data foundation:** Build the structured DRI/RDA/AI/UL reference database and the BMR/TDEE/macro calculation engine; unit test against published values.
2. **Visual design system:** Define the color tokens (light: white/green; dark: navy/green), illustration/icon set, and core motion/animation style before or alongside UI build, so every screen after this point is built against a consistent system.
3. **Core UI:** Onboarding flow + results dashboard (free macro view + locked premium micronutrient preview), using the calculation engine and design system.
4. **Education layer:** Plain-language explanations for each nutrient.
5. **Paywall & subscription integration:** Wire up App Store/Play Store billing and entitlement checks to unlock the micronutrient engine.
6. **Polish & testing:** Accessibility pass (including color contrast validation), edge-case testing (bracket boundaries, extreme inputs), animation/design polish.
7. **v1 release** to a small test group for feedback before wider release.

---

*This is a living document — pricing, the lock-icon upsell, and everything else here should be revisited as early user feedback comes in.*
