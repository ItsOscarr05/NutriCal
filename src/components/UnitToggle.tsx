import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, useTheme } from '../theme';

interface UnitToggleOption<T extends string> {
  value: T;
  label: string;
}

interface UnitToggleProps<T extends string> {
  options: UnitToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Center horizontally instead of hugging the leading edge. */
  centered?: boolean;
}

/**
 * Small segmented control for the imperial/metric toggle on the height and
 * weight onboarding screens (AGENTS.md — imperial-first with a metric
 * toggle). The selected segment is an `accentFill` pill with
 * `onAccentFill` text.
 */
export function UnitToggle<T extends string>({ options, value, onChange, centered = false }: UnitToggleProps<T>) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        centered && styles.centered,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.option, selected && { backgroundColor: theme.accentFill }]}
          >
            <Text style={[styles.label, { color: selected ? theme.onAccentFill : theme.textSecondary }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    borderWidth: 1,
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  centered: { alignSelf: 'center' },
  option: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
