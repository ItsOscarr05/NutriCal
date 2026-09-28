import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, radii, spacing } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * The solid-green filled CTA button (Stitch palette, `primaryContainer`).
 * Uses fixed literal palette values rather than `useTheme()`, same as
 * before the Stitch re-theme — `primaryContainer`/`primary` are identical
 * in both light and dark mode, so the button looks the same either way.
 * Label color is white — per the WCAG audit in `src/theme/colors.ts`,
 * white on `primaryContainer` passes AA (~4.64:1).
 */
export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.primaryContainer,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: palette.primary,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
