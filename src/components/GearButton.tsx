import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { spacing, useTheme } from '../theme';

interface GearButtonProps {
  onPress: () => void;
  /** Extra top offset (typically `useSafeAreaInsets().top`) so this clears the status bar/notch. */
  topInset: number;
}

/**
 * Small presentational icon button — an outlined gear (`Ionicons`
 * `"settings-outline"`), per the user's explicit request for an outlined
 * icon rather than an emoji or a custom illustration. Font/glyph-based
 * (not `react-native-svg`), so it doesn't conflict with AGENTS.md's
 * "no new render-dependency without an explicit ask" rule.
 *
 * Deliberately dumb: it knows nothing about navigation. Callers (currently
 * only `ResultsScreen`) pass an `onPress` and position it themselves via
 * `topInset`, same "absolutely-positioned sibling" pattern already used
 * for `CelebrationBanner`.
 */
export function GearButton({ onPress, topInset }: GearButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Settings"
      hitSlop={12}
      style={({ pressed }) => [styles.button, { top: topInset + spacing.sm }, pressed && styles.pressed]}
    >
      <Ionicons name="settings-outline" size={26} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  pressed: {
    opacity: 0.6,
  },
});
