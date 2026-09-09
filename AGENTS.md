# NutriCal — Agent Notes

Personalized daily macro/micronutrient targets app (Expo + React Native + TypeScript). Full spec: `project-docs/PRD.md`. See `README.md` for stack, structure, and current status.

Key constraints to respect when working in this repo:

- **No accounts, no backend, no cloud sync.** Profile data is local-only (`AsyncStorage`). Don't add a server or auth system without an explicit request — this is a deliberate v1 decision (PRD §8.1, §12, §13).
- **Calculation engine (`src/engine`, `src/data/dri`) must stay pure and unit-tested.** It's the credibility core of the product (PRD §10, §14) — no UI concerns leaking in, no unvalidated formula changes without updating/adding tests in `__tests__`.
- **DRI micronutrient data (`src/data/dri/adultBrackets.ts`, `adolescentBrackets.ts`) covers ages 9+ (both sexes) but is still explicitly flagged as needing verification against the NIH ODS DRI tables** before it's treated as production-accurate — don't assume it's audited. Ages below `MIN_SUPPORTED_AGE` (9, exported from `src/data/dri/index.ts`) and pregnancy/lactation life stages are not seeded at all.
- **Tone/design:** plain-language, non-judgmental, no red/green alarm framing (PRD §11.1). Light mode = white + green accent; dark mode = navy + green accent (PRD §11.2) — colors in `src/theme/colors.ts` are drafts, not WCAG-validated yet.
- **Freemium boundary:** macros are always free; micronutrients are premium-gated and shown to free users as a locked, name-only teaser (PRD §7, §8.4) — don't leak micronutrient values to free users in UI work.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
