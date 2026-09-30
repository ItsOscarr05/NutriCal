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
 * These lock in the audit documented at the top of `colors.ts` (the Stitch
 * palette adopted in v1.1). If any of these fail, either a hex value
 * changed without re-validating contrast, or the documented comment in
 * `colors.ts` is now stale — update both together.
 */
describe('NutriCal palette — WCAG AA audit (PRD §11.2, §14)', () => {
  it('confirms primary/secondary/tertiary are all AA-safe as direct fg text/icon on light surfaces', () => {
    for (const fg of [palette.primary, palette.secondary, palette.tertiary]) {
      expect(meetsWcagAA(contrastRatio(fg, palette.bgLight), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(fg, palette.surfaceLight), 'normal-text')).toBe(true);
    }
  });

  it('confirms primaryDark/secondaryDark/tertiaryDark are all AA-safe as direct fg text/icon on the navy dark surfaces', () => {
    for (const fg of [palette.primaryDark, palette.secondaryDark, palette.tertiaryDark]) {
      expect(meetsWcagAA(contrastRatio(fg, palette.navy), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(fg, palette.navyElevated), 'normal-text')).toBe(true);
    }
  });

  it('confirms onSurface/onSurfaceVariant pass AA normal-text on the light background/surface', () => {
    expect(meetsWcagAA(contrastRatio(palette.onSurfaceLight, palette.bgLight), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onSurfaceLight, palette.surfaceLight), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onSurfaceVariantLight, palette.bgLight), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onSurfaceVariantLight, palette.surfaceLight), 'normal-text')).toBe(true);
  });

  it('confirms onNavy/onNavyVariant pass AA normal-text on the navy background/surface', () => {
    expect(meetsWcagAA(contrastRatio(palette.onNavy, palette.navy), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onNavy, palette.navyElevated), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onNavyVariant, palette.navy), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onNavyVariant, palette.navyElevated), 'normal-text')).toBe(true);
  });

  it('confirms each *Fixed pale tint pairs with its dark on-fixed-variant text at normal-text AA', () => {
    expect(meetsWcagAA(contrastRatio(palette.onPrimaryFixed, palette.primaryFixed), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onSecondaryFixedVariant, palette.secondaryFixed), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.onTertiaryFixedVariant, palette.tertiaryFixed), 'normal-text')).toBe(true);
  });

  it('confirms the reverse dark-mode "fixed" pairing (bright family color as fg on the dark muted tint) also passes AA', () => {
    expect(meetsWcagAA(contrastRatio(palette.primaryDark, palette.onPrimaryFixedVariant), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.secondaryDark, palette.onSecondaryFixedVariant), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.tertiaryDark, palette.onTertiaryFixedVariant), 'normal-text')).toBe(true);
  });

  it('confirms white passes AA on primary/primaryContainer and tertiary/tertiaryContainer (large/bold text and icons)', () => {
    expect(meetsWcagAA(contrastRatio(palette.white, palette.primary), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.white, palette.primaryContainer), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.white, palette.tertiary), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(palette.white, palette.tertiaryContainer), 'normal-text')).toBe(true);
  });

  it('flags that white FAILS on secondaryContainer — that fill must always pair with a dark "on" color instead', () => {
    expect(meetsWcagAA(contrastRatio(palette.white, palette.secondaryContainer), 'large-text-or-ui')).toBe(false);
  });

  it('confirms onAccentDeep flips correctly and stays AA-safe against accentDeep in both themes', () => {
    expect(meetsWcagAA(contrastRatio(lightTheme.onAccentDeep, lightTheme.accentDeep), 'normal-text')).toBe(true);
    expect(meetsWcagAA(contrastRatio(darkTheme.onAccentDeep, darkTheme.accentDeep), 'normal-text')).toBe(true);
  });

  it('confirms the muted, non-alarm-color error text stays AA-safe on the light background (PRD §11.1)', () => {
    expect(meetsWcagAA(contrastRatio(palette.errorNeutral, palette.bgLight), 'normal-text')).toBe(true);
  });
});

describe('lightTheme / darkTheme — resolved tokens stay AA-safe for their documented roles', () => {
  it('textPrimary and textSecondary are AA-safe normal text on background and surface, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const bg of [theme.background, theme.surface]) {
        expect(meetsWcagAA(contrastRatio(theme.textPrimary, bg), 'normal-text')).toBe(true);
        expect(meetsWcagAA(contrastRatio(theme.textSecondary, bg), 'normal-text')).toBe(true);
      }
    }
  });

  it('accent/accentDeep are AA-safe as direct fg text/icon on background and surface, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const bg of [theme.background, theme.surface]) {
        expect(meetsWcagAA(contrastRatio(theme.accent, bg), 'normal-text')).toBe(true);
        expect(meetsWcagAA(contrastRatio(theme.accentDeep, bg), 'normal-text')).toBe(true);
      }
    }
  });

  it('secondary and tertiary are AA-safe as direct fg text/icon on background and surface, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const bg of [theme.background, theme.surface]) {
        expect(meetsWcagAA(contrastRatio(theme.secondary, bg), 'normal-text')).toBe(true);
        expect(meetsWcagAA(contrastRatio(theme.tertiary, bg), 'normal-text')).toBe(true);
      }
    }
  });

  it('each *Fixed tint pairs with its own onXFixed text at normal-text AA, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(meetsWcagAA(contrastRatio(theme.onAccentFixed, theme.accentFixed), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(theme.onSecondaryFixed, theme.secondaryFixed), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(theme.onTertiaryFixed, theme.tertiaryFixed), 'normal-text')).toBe(true);
    }
  });

  it('onAccentFill is AA-safe on accentFill, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(meetsWcagAA(contrastRatio(theme.onAccentFill, theme.accentFill), 'normal-text')).toBe(true);
    }
  });

  it('the PrimaryButton label is AA-safe on its fill and pressed fill, in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(meetsWcagAA(contrastRatio(theme.onButtonFill, theme.buttonFill), 'normal-text')).toBe(true);
      expect(meetsWcagAA(contrastRatio(theme.onButtonFill, theme.buttonFillPressed), 'normal-text')).toBe(true);
    }
  });

  it('flags that the light-mode mint fill is too pale to be text on the light surfaces', () => {
    expect(meetsWcagAA(contrastRatio(lightTheme.accentFill, lightTheme.surface), 'large-text-or-ui')).toBe(false);
  });

  it('error stays a muted, AA-safe (non-alarm) color on background in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(meetsWcagAA(contrastRatio(theme.error, theme.background), 'large-text-or-ui')).toBe(true);
    }
  });
});
