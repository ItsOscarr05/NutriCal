import { Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, useTheme } from '../theme';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

/** A single selectable card, used for the sex/activity/goal single-select onboarding steps. */
export function OptionCard({ label, description, selected, onPress }: OptionCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.accentDeep : theme.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});
