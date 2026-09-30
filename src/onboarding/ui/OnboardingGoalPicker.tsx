import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, ThemeColors } from '../../theme';
import { Goal } from '../../types/profile';
import { GOAL_OPTIONS } from '../assessmentOptions';

/**
 * Each goal gets its own existing palette family so the options feel
 * distinct: `tint` is the card fill, `fg` the icon/selected border, and
 * `on` the text color already contrast-validated on that tint.
 */
function goalColors(goal: Goal, theme: ThemeColors): { tint: string; fg: string; on: string } {
  switch (goal) {
    case 'lose_weight':
      return { tint: theme.tertiaryFixed, fg: theme.tertiary, on: theme.onTertiaryFixed };
    case 'build_muscle':
      return { tint: theme.accentFixed, fg: theme.accent, on: theme.onAccentFixed };
    case 'gain_weight':
      return { tint: theme.secondaryFixed, fg: theme.secondary, on: theme.onSecondaryFixed };
    case 'maintain':
      return { tint: theme.surfaceContainerHigh, fg: theme.textPrimary, on: theme.textPrimary };
  }
}

/**
 * Onboarding-only goal picker: tall, color-coded cards that stretch to
 * fill the page. The `Assess` tab keeps the compact `GoalPicker`.
 */
export function OnboardingGoalPicker({
  theme,
  value,
  onChange,
}: {
  theme: ThemeColors;
  value: Goal;
  onChange: (value: Goal) => void;
}) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {GOAL_OPTIONS.map((option) => {
        const selected = value === option.value;
        const colors = goalColors(option.value, theme);
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}, ${option.description}`}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.tint, borderColor: selected ? colors.fg : 'transparent' },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: theme.surface }]}>
              <MaterialIcons name={option.icon} size={28} color={colors.fg} />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.on }]}>{option.label}</Text>
                {option.badge ? (
                  <View style={[styles.badge, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.badgeText, { color: colors.fg }]}>{option.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.description, { color: colors.on }]}>{option.description}</Text>
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: colors.fg, backgroundColor: selected ? colors.fg : 'transparent' },
              ]}
            >
              {selected ? <MaterialIcons name="check" size={16} color={colors.tint} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, gap: spacing.sm },
  card: {
    flex: 1,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconBadge: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  textBlock: { flex: 1, minWidth: 0 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  label: { fontSize: 17, fontWeight: '800' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  badgeText: { fontSize: 11, fontWeight: '800' },
  description: { fontSize: 14, marginTop: 2 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
