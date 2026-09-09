import { darkTheme, lightTheme, palette } from '../colors';
import { contrastRatio, meetsWcagAA, relativeLuminance } from '../contrast';

describe('contrastRatio / relativeLuminance', () => {
  it('gives black/white the maximum ratio of 21:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('gives an identical color pair a ratio of 1:1', () => {
    expect(contrastRatio('#2ECC71', '#2ECC71')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    expect(contrastRatio('#2ECC71', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#2ECC71'), 5);
  });

  it('white has the maximum relative luminance of 1', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('black has the minimum relative luminance of 0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

/**
 * These lock in the audit documented at the top of `colors.ts`. If any of
 * these fail, either a hex value changed without re-validating contrast, or
 * the documented comment in `colors.ts` is now stale — update both together.
 */
describe('NutriCal palette — WCAG AA audit (PRD §11.2, §14)', () => {
  it('flags that the bright brand green fails AA as a foreground color on light backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.green, palette.white), 'large-text-or-ui')).toBe(false);
    expect(meetsWcagAA(contrastRatio(palette.green, palette.offWhite), 'large-text-or-ui')).toBe(false);
  });

  it('confirms the bright brand green passes AA as a foreground color on dark backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.green, palette.navy), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.green, palette.navyElevated), 'normal-text')).toBe(true);
  });

  it('confirms dark near-black text passes AA directly on the bright green fill (safe button/badge pairing)', () => {
    expect(meetsWcagAA(contrastRatio(palette.textDarkPrimary, palette.green), 'normal-text')).toBe(true);
  });

  it('confirms greenDark passes AA large-text/icon contrast on light backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.greenDark, palette.white), 'large-text-or-ui')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.greenDark, palette.offWhite), 'large-text-or-ui')).toBe(true);
  });

  it('confirms greenDark passes AA large-text/icon contrast on dark backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.greenDark, palette.navy), 'large-text-or-ui')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.greenDark, palette.navyElevated), 'large-text-or-ui')).toBe(true);
  });

  it('confirms body-copy text colors pass AA normal-text contrast on their own backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.textDarkPrimary, palette.white), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.textDarkPrimary, palette.offWhite), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.textLightPrimary, palette.navy), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.textLightPrimary, palette.navyElevated), 'normal-text')).toBe(true);
  });

  it('flags that the original single gray fails AA as secondary text on light backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.gray, palette.white), 'large-text-or-ui')).toBe(false);
    expect(meetsWcagAA(contrastRatio(palette.gray, palette.offWhite), 'large-text-or-ui')).toBe(false);
  });

  it('confirms gray passes AA as secondary text on dark backgrounds', () => {
    expect(meetsWcagAA(contrastRatio(palette.gray, palette.navy), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.gray, palette.navyElevated), 'normal-text')).toBe(true);
  });

  it('confirms sage passes AA as secondary text on light backgrounds (the gray fix)', () => {
    expect(meetsWcagAA(contrastRatio(palette.sage, palette.white), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.sage, palette.offWhite), 'normal-text')).toBe(true);
  });
});

describe('lightTheme / darkTheme — resolved tokens stay AA-safe for their documented roles', () => {
  it('lightTheme.textPrimary and textSecondary are AA-safe normal text on background and surface', () => {
    for (const bg of [lightTheme.background, lightTheme.surface]) {
      expect(meetsWcagAA(contrastRatio(lightTheme.textPrimary, bg), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(lightTheme.textSecondary, bg), 'normal-text')).toBe(true);
    }
  });

  it('darkTheme.textPrimary and textSecondary are AA-safe normal text on background and surface', () => {
    for (const bg of [darkTheme.background, darkTheme.surface]) {
      expect(meetsWcagAA(contrastRatio(darkTheme.textPrimary, bg), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(darkTheme.textSecondary, bg), 'normal-text')).toBe(true);
    }
  });

  it('accentDeep is at least large-text/icon AA-safe on both themes background and surface', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const bg of [theme.background, theme.surface]) {
        expect(meetsWcagAA(contrastRatio(theme.accentDeep, bg), 'large-text-or-ui')).toBe(true);
      }
    }
  });
});
