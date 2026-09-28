import { useColorScheme } from 'react-native';
import { useAppSettings } from '../settings/AppSettingsContext';
import { darkTheme, lightTheme, palette, ThemeColors } from './colors';

export { palette, lightTheme, darkTheme };
export type { ThemeColors };

/**
 * Resolves the active color theme from the system color scheme, unless the
 * user has picked an explicit Light/Dark override in Settings
 * (`AppSettingsContext`'s `appearance`, default `'system'`). PRD §11.3:
 * animation/illustration style stays identical across modes — only
 * background/text/surface colors swap, which is why this hook only returns
 * colors, not layout or motion values.
 */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  const { settings } = useAppSettings();
  const resolved = settings.appearance === 'system' ? scheme : settings.appearance;
  return resolved === 'dark' ? darkTheme : lightTheme;
}

/** Shared radii/spacing tokens — rounded, soft UI per PRD §11.3. */
export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
