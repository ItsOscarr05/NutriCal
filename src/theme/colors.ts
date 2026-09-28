/**
 * NutriCal color tokens (PRD §11.2).
 *
 * v1.1 UPDATE: this palette was adopted wholesale from a Stitch-generated
 * design system ("NutriCal Nutrition Target Calculator" project) rather
 * than hand-picked, per an explicit user decision to re-theme the app
 * around it. Stitch only exported a LIGHT color scheme; the dark theme
 * below keeps the app's original navy base (an established v1 decision,
 * PRD §11.2) and re-accents it using the *-fixed-dim / on-*-fixed-variant
 * tokens Stitch's own Material-3-style export already provides as that
 * palette's dark-mode-safe counterparts — so the dark theme is still
 * faithful to the new palette's hues, just anchored to the pre-existing
 * navy neutral rather than a from-scratch M3 dark scheme (Stitch didn't
 * export one).
 *
 * WCAG AA CONTRAST — VALIDATED (see `src/theme/__tests__/contrast.test.ts`,
 * which asserts every ratio below and will fail if a future hex edit
 * breaks one). Ratios computed with `contrastRatio()` from `contrast.ts`.
 * AA thresholds: normal text >= 4.5:1; large text (>=24px regular /
 * >=18.66px bold) and icons/UI components (WCAG 1.4.11) >= 3:1.
 *
 * Light theme (all pass normal-text AA directly on both `background` and
 * `surface` unless noted):
 *   textPrimary (on-surface, #1a1b22):        16.32 / 17.16
 *   textSecondary (on-surface-variant, #3e4a3d): 8.87 / 9.33
 *   accent/primary (#006b2c):                  6.36 / 6.69  -> also safe
 *                                                              as direct fg
 *                                                              text/icon,
 *                                                              unlike the
 *                                                              old brand
 *                                                              green.
 *   secondary (#855300):                       6.17 / 6.49
 *   tertiary (#a63047):                        6.37 / 6.70
 *   error (unchanged from v1, muted/non-alarm, PRD §11.1): 4.61 on the new
 *     background (was 4.85 on the old white bg) -> still passes.
 *   onAccentFixed / onSecondaryFixed / onTertiaryFixed on their own
 *     *Fixed pale-tint backgrounds:             7.21 / 7.26 / 7.25
 *   onAccent (white) on accent/accentContainer: 6.69 / 4.64 (primaryContainer
 *     passes but close to the 4.5 floor -> reserved for large/bold text
 *     and icons, not small body copy)
 *   onTertiary... white on tertiaryContainer:   4.65 (same caveat as above)
 *   onAccentDeep (white) on accentDeep (#006b2c):        6.69
 *   NOTE: white on secondaryContainer is only 1.97 (FAILS) -- that pale
 *     orange container must always pair with a dark "on" color
 *     (onSecondaryFixed), never white. Don't add a white-text usage
 *     against `secondaryContainer` without re-running the contrast suite.
 *
 * Dark theme (navy base retained; new accents):
 *   textPrimary (#F5F7F6) on navy/navyElevated: 16.19 / 13.62
 *   accent/primaryDark (#62df7d) on navy/navyElevated (also normal-text
 *     safe, so usable as small text too):        10.26 / 8.63
 *   secondary/secondaryDark (#ffb95f):            10.25 / 8.62
 *   tertiary/tertiaryDark (#ffb2b9):               10.22 / 8.60
 *   textSecondary (#A9B3AD):                       8.08 / 6.80
 *   onAccentDeep (dark green #002109) on accentDeep (#62df7d): 10.13
 *     (accentDeep flips to a BRIGHT green in dark mode, so its "on" color
 *     flips to dark green too — see `onAccentDeep`'s field doc.)
 */

export const palette = {
  // ---- Light-mode surfaces (Stitch: surface / surface-container-* tiers) ----
  bgLight: '#fbf8ff',
  surfaceLight: '#ffffff',
  surfaceContainerLowLight: '#f4f2fd',
  surfaceContainerLight: '#eeedf7',
  surfaceContainerHighLight: '#e8e7f1',
  onSurfaceLight: '#1a1b22',
  onSurfaceVariantLight: '#3e4a3d',
  outlineVariantLight: '#bdcaba',

  // ---- Dark-mode surfaces (original navy base, PRD §11.2 — kept as-is) ----
  navy: '#0B1B2B',
  navyElevated: '#132A40',
  navyContainer: '#1c3550',
  navyContainerHigh: '#234163',
  onNavy: '#F5F7F6',
  onNavyVariant: '#A9B3AD',
  navyOutline: '#2c4a63',

  // ---- Primary (green) — Stitch's "primary" family ----
  primary: '#006b2c',
  primaryDark: '#62df7d', // primary-fixed-dim: Stitch's own dark-mode-safe counterpart
  primaryContainer: '#00873a',
  primaryFixed: '#7ffc97', // pale tint bg (e.g. the "fats" macro badge in light mode)
  onPrimaryFixed: '#002109', // safe dark fg text/icon on primaryFixed
  onPrimaryFixedVariant: '#005320', // also doubles as the dark-mode "fixed" tint bg (paired with primaryDark fg)

  // ---- Secondary (amber/gold) — Stitch's "secondary" family ----
  secondary: '#855300',
  secondaryDark: '#ffb95f', // secondary-fixed-dim
  secondaryContainer: '#fea619',
  secondaryFixed: '#ffddb8', // pale tint bg (e.g. the "carbs" macro badge in light mode)
  onSecondaryFixedVariant: '#653e00', // safe dark fg on secondaryFixed; also the dark-mode "fixed" tint bg

  // ---- Tertiary (coral/berry) — Stitch's "tertiary" family ----
  tertiary: '#a63047',
  tertiaryDark: '#ffb2b9', // tertiary-fixed-dim
  tertiaryContainer: '#c6495e',
  tertiaryFixed: '#ffdadc', // pale tint bg (e.g. the "protein" macro badge in light mode)
  onTertiaryFixedVariant: '#891933', // safe dark fg on tertiaryFixed; also the dark-mode "fixed" tint bg

  white: '#ffffff',
  // Deliberately UNCHANGED from the pre-Stitch palette: NutriCal avoids
  // red/green alarm language (PRD §11.1), and Stitch's own "tertiary" is
  // itself a vivid coral-red used for macro branding, not the safe choice
  // for a destructive-action label. Keeps its original muted-brown value.
  errorNeutral: '#8A6D3B',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  /** One step tonal layer above `surface` — chips, filter pills, nav bars. */
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;

  /** Primary brand green. Safe as a *direct* fg text/icon color on `background`/`surface` in BOTH themes now (unlike the old brand green, which needed `accentDeep` for that role in light mode). */
  accent: string;
  /** Kept for backward compatibility with call sites written against the pre-Stitch palette; equal to `accent` in this generation (both are already AA-safe as direct fg). */
  accentDeep: string;
  /** Safe fg text/icon color *on* a solid `accentDeep` fill specifically (e.g. `PrimaryButton`/`UnitToggle`'s selected segment). Needed as its own field because `accentDeep` flips from dark-in-light-mode to bright-in-dark-mode, so the correct "on" color flips too (white / dark-green respectively) — unlike `onAccent`, which is always white and is meant for `accentContainer`, a fill that stays mid-tone in both themes. */
  onAccentDeep: string;
  /** Mid-tone solid fill, e.g. a CTA button or an icon-badge background. Pair with `onAccent`, and only for large/bold text or icons (see contrast notes above). */
  accentContainer: string;
  /** Pale/muted tint background, e.g. a macro badge. Pair with `onAccentFixed`. */
  accentFixed: string;
  /** Safe fg text/icon color *on* `accentFixed`. */
  onAccentFixed: string;
  /** Safe fg text/icon color *on* `accent`/`accentContainer` (large/bold text or icons only for `accentContainer`, see contrast notes). */
  onAccent: string;

  secondary: string;
  secondaryContainer: string;
  secondaryFixed: string;
  onSecondaryFixed: string;

  tertiary: string;
  tertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;

  textPrimary: string;
  textSecondary: string;
  border: string;
  /** Muted, non-alarm-color destructive-action text (PRD §11.1). */
  error: string;
}

export const lightTheme: ThemeColors = {
  background: palette.bgLight,
  surface: palette.surfaceLight,
  surfaceContainerLow: palette.surfaceContainerLowLight,
  surfaceContainer: palette.surfaceContainerLight,
  surfaceContainerHigh: palette.surfaceContainerHighLight,

  accent: palette.primary,
  accentDeep: palette.primary,
  onAccentDeep: palette.white,
  accentContainer: palette.primaryContainer,
  accentFixed: palette.primaryFixed,
  onAccentFixed: palette.onPrimaryFixed,
  onAccent: palette.white,

  secondary: palette.secondary,
  secondaryContainer: palette.secondaryContainer,
  secondaryFixed: palette.secondaryFixed,
  onSecondaryFixed: palette.onSecondaryFixedVariant,

  tertiary: palette.tertiary,
  tertiaryContainer: palette.tertiaryContainer,
  tertiaryFixed: palette.tertiaryFixed,
  onTertiaryFixed: palette.onTertiaryFixedVariant,

  textPrimary: palette.onSurfaceLight,
  textSecondary: palette.onSurfaceVariantLight,
  border: palette.outlineVariantLight,
  error: palette.errorNeutral,
};

export const darkTheme: ThemeColors = {
  background: palette.navy,
  surface: palette.navyElevated,
  surfaceContainerLow: palette.navyElevated,
  surfaceContainer: palette.navyContainer,
  surfaceContainerHigh: palette.navyContainerHigh,

  accent: palette.primaryDark,
  accentDeep: palette.primaryDark,
  onAccentDeep: palette.onPrimaryFixed,
  accentContainer: palette.primaryContainer,
  // Roles swap in dark mode: the "fixed" tint becomes a dark muted fill,
  // with the bright family color as its "on" content (rather than a pale
  // tint + dark text, as in light mode).
  accentFixed: palette.onPrimaryFixedVariant,
  onAccentFixed: palette.primaryDark,
  onAccent: palette.white,

  secondary: palette.secondaryDark,
  secondaryContainer: palette.secondaryContainer,
  secondaryFixed: palette.onSecondaryFixedVariant,
  onSecondaryFixed: palette.secondaryDark,

  tertiary: palette.tertiaryDark,
  tertiaryContainer: palette.tertiaryContainer,
  tertiaryFixed: palette.onTertiaryFixedVariant,
  onTertiaryFixed: palette.tertiaryDark,

  textPrimary: palette.onNavy,
  textSecondary: palette.onNavyVariant,
  border: palette.navyOutline,
  error: palette.errorNeutral,
};
