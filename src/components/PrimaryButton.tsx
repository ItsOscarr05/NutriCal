import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, radii, spacing } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * The bright-green filled CTA button. Label color is `textDarkPrimary`
 * (near-black-green) rather than white — per the WCAG audit in
 * `src/theme/colors.ts`, dark text on the bright brand green passes AA
 * (~7.6:1) while white text on it does not.
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
    backgroundColor: palette.green,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: palette.greenDark,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: palette.textDarkPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
