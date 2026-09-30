import { Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, useTheme } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * The solid-green filled CTA button: logo mint with a dark-green label in
 * light mode, `primaryContainer` with a white label in dark mode (see the
 * `buttonFill` tokens and the WCAG audit in `src/theme/colors.ts`).
 */
export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed && !disabled ? theme.buttonFillPressed : theme.buttonFill },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: theme.onButtonFill }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
});
