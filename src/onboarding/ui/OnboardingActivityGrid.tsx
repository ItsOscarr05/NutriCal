import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, ThemeColors } from '../../theme';
import { ActivityLevel } from '../../types/profile';
import { ACTIVITY_OPTIONS } from '../assessmentOptions';

const COLUMNS = 2;

/**
 * Onboarding-only 2x3 activity grid: large cards that stretch to fill the
 * page's content area, each with an outlined icon in a ringed badge. The
 * `Assess` tab uses the compact `ActivityPicker` instead.
 */
export function OnboardingActivityGrid({
  theme,
  value,
  onChange,
}: {
  theme: ThemeColors;
  value: ActivityLevel;
  onChange: (value: ActivityLevel) => void;
}) {
  const rows = Array.from({ length: Math.ceil(ACTIVITY_OPTIONS.length / COLUMNS) }, (_, i) =>
    ACTIVITY_OPTIONS.slice(i * COLUMNS, i * COLUMNS + COLUMNS),
  );

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((option) => {
            const selected = value === option.value;
            const fg = selected ? theme.onAccentFixed : theme.accent;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${option.description}`}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: selected ? theme.accentFixed : theme.surfaceContainerLow,
                    borderColor: selected ? theme.accent : 'transparent',
                  },
                  pressed && styles.pressed,
                ]}
              >
                {selected ? (
                  <MaterialIcons name="check-circle" size={20} color={theme.onAccentFixed} style={styles.check} />
                ) : null}
                <View style={[styles.iconRing, { borderColor: fg }]}>
                  <MaterialCommunityIcons name={option.icon} size={30} color={fg} />
                </View>
                <Text style={[styles.label, { color: theme.textPrimary }]}>{option.label}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flex: 1, gap: spacing.sm },
  row: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  check: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  description: { fontSize: 12, marginTop: 2, textAlign: 'center' },
});
