/**
 * NutriCal color tokens (PRD §11.2).
 *
 * Light mode: white background, green accent.
 * Dark mode: navy background (not pure black), same green accent for
 * cross-mode brand consistency.
 *
 * WCAG AA CONTRAST — VALIDATED (see `src/theme/__tests__/contrast.test.ts`,
 * which asserts every ratio below and will fail if a future hex edit
 * breaks one). Ratios computed with `contrastRatio()` from `contrast.ts`.
 * AA thresholds: normal text >= 4.5:1; large text (>=24px regular /
 * >=18.66px bold) and icons/UI components (WCAG 1.4.11) >= 3:1.
 *
 *   green (#2ECC71) on white/offWhite:      2.10 / 1.99  -> FAILS both AA
 *                                                            thresholds.
 *   green on navy/navyElevated:             8.29 / 6.97  -> passes everything.
 *   greenDark (#1E9E58) on white/offWhite:  3.45 / 3.26  -> passes large
 *                                                            text/icons only.
 *   greenDark on navy/navyElevated:         5.05 / 4.25  -> passes normal
 *                                                            text on navy;
 *                                                            large text/icons
 *                                                            only on navyElevated.
 *   textDarkPrimary on white/offWhite:      15.9 / 15.0  -> passes everything.
 *   textLightPrimary on navy/navyElevated:  16.2 / 13.6  -> passes everything.
 *   gray (#8A9A93) on white/offWhite:       2.95 / 2.79  -> FAILS both AA
 *                                                            thresholds.
 *   gray on navy/navyElevated:              5.91 / 4.97  -> passes normal text.
 *   sage (#5B6B64) on white/offWhite:       5.63 / 5.32  -> passes normal text.
 *
 * Takeaways baked into the tokens below:
 *   1. The bright brand green (`green`) confirms the PRD's own suspicion —
 *      it fails AA on light backgrounds even at large-text/icon size. It
 *      must NOT be used as a foreground (icon/text/stroke) color directly
 *      on a light background. It's still great as a large fill/background
 *      block (progress bars, buttons, badges) as long as the content drawn
 *      on top of that fill is dark (see `textDarkPrimary` on `green`:
 *      that pairing is ~7.6:1, comfortably passing), and it's great as a
 *      direct foreground color in dark mode (8.29:1).
 *   2. `greenDark` is the AA-safe stand-in for "green icon or large text
 *      directly on the page background" in light mode (3.45:1) — this is
 *      the "darker green ... used for body copy" the PRD anticipated,
 *      though it should still be reserved for large text/icons, not small
 *      body copy (which uses `textPrimary`).
 *   3. The original single `gray` failed as light-mode secondary text, so
 *      light and dark mode now use different secondary-text grays: `sage`
 *      (light) and `gray` (dark) — both AA-safe on their respective
 *      backgrounds.
 */

export const palette = {
  green: '#2ECC71', // primary accent — dark-mode fg, or light-mode FILLS with dark content on top only (fails AA as light-mode fg, see above)
  greenDark: '#1E9E58', // secondary green — shadows/pressed-state depth (PRD §11.2), AND the AA-safe green for icons/large text directly on a light background
  navy: '#0B1B2B', // dark mode background
  navyElevated: '#132A40', // dark mode surface/card background
  white: '#FFFFFF',
  offWhite: '#F7F9F8',
  textDarkPrimary: '#12261D', // near-black-green, used for body copy on light bg (contrast-safe)
  textLightPrimary: '#F5F7F6', // near-white, used for body copy on dark bg
  gray: '#8A9A93', // AA-safe secondary text on dark backgrounds only — NOT light backgrounds (2.95:1, fails)
  sage: '#5B6B64', // AA-safe secondary text on light backgrounds (muted, slightly green-tinted gray to match brand)
  errorNeutral: '#8A6D3B', // reserved: NutriCal avoids red/green alarm language (PRD §11.1) — use sparingly, non-judgmental tone. AA-safe as text on light backgrounds (4.85:1); on dark backgrounds it only clears the large-text/icon bar (3.59:1), not normal body text.
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  /**
   * Primary brand green. Safe as a direct foreground (icon/text) color in
   * dark mode. In light mode, only safe as a fill/background block with
   * dark content drawn on top — do not use as small icon/text color
   * directly against `background`/`surface` in light mode (fails AA).
   */
  accent: string;
  /**
   * Deeper green. PRD-intended use: shadows/pressed states. Also the
   * AA-safe choice for green icons/large text placed directly on
   * `background`/`surface` in light mode (see module-level contrast notes).
   */
  accentDeep: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export const lightTheme: ThemeColors = {
  background: palette.white,
  surface: palette.offWhite,
  accent: palette.green,
  accentDeep: palette.greenDark,
  textPrimary: palette.textDarkPrimary,
  textSecondary: palette.sage,
  border: '#E3E8E6',
};

export const darkTheme: ThemeColors = {
  background: palette.navy,
  surface: palette.navyElevated,
  accent: palette.green,
  accentDeep: palette.greenDark,
  textPrimary: palette.textLightPrimary,
  textSecondary: palette.gray,
  border: '#1E3A52',
};
