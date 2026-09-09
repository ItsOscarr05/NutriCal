/**
 * WCAG 2.x contrast utilities.
 *
 * Implements the standard relative-luminance / contrast-ratio formulas
 * (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio) so the color tokens in
 * `colors.ts` can be checked programmatically instead of by eye — PRD §11.2
 * calls out that the green-on-white and green-on-navy pairings must be
 * validated against WCAG AA before hex values are finalized, and PRD §14
 * lists sufficient color contrast as a non-functional requirement.
 */

/** Parses a `#rgb` or `#rrggbb` hex string into 0-255 channel values. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (normalized.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function channelToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rl, gl, bl] = [channelToLinear(r), channelToLinear(g), channelToLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two colors, from 1 (no contrast) to 21 (black/white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG AA thresholds:
 *   - normal text: 4.5:1
 *   - large text (>=24px regular, or >=18.66px / 14pt bold) and graphical
 *     objects/UI components (WCAG 1.4.11 non-text contrast): 3:1
 */
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT_OR_UI = 3.0;

export function meetsWcagAA(ratio: number, usage: 'normal-text' | 'large-text-or-ui'): boolean {
  return ratio >= (usage === 'normal-text' ? WCAG_AA_NORMAL_TEXT : WCAG_AA_LARGE_TEXT_OR_UI);
}
