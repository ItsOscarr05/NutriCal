/**
 * NutriCal color tokens (PRD §11.2).
 *
 * Light mode: white background, green accent.
 * Dark mode: navy background (not pure black), same green accent for
 * cross-mode brand consistency.
 *
 * NOTE: these hex values are placeholders. PRD §11.2 explicitly calls out
 * that both green-on-white and green-on-navy pairings must be validated
 * against WCAG AA contrast ratios before finalizing — treat this file as a
 * draft to be revisited during the "visual design system" milestone
 * (PRD §17, milestone 2), not a final palette.
 */

export const palette = {
  green: '#2ECC71', // primary accent — large text, icons, fills only (contrast risk at small sizes)
  greenDark: '#1E9E58', // secondary green — shadows, pressed states, depth
  navy: '#0B1B2B', // dark mode background
  navyElevated: '#132A40', // dark mode surface/card background
  white: '#FFFFFF',
  offWhite: '#F7F9F8',
  textDarkPrimary: '#12261D', // near-black-green, used for body copy on light bg (contrast-safe)
  textLightPrimary: '#F5F7F6', // near-white, used for body copy on dark bg
  gray: '#8A9A93',
  errorNeutral: '#8A6D3B', // reserved: NutriCal avoids red/green alarm language (PRD §11.1) — use sparingly, non-judgmental tone
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  accent: string;
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
  textSecondary: palette.gray,
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
