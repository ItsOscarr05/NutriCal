import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkTheme, radii, spacing, ThemeColors } from '../../theme';
import { ActivityLevel } from '../../types/profile';
import { ACTIVITY_OPTIONS } from '../assessmentOptions';

const COLUMNS = 2;

// Reading order of the grid; differs from ACTIVITY_OPTIONS (which the
// Profile tab's compact list keeps in intensity order).
const GRID_ORDER: ActivityLevel[] = [
  'inactive',
  'sedentary',
  'moderately_active',
  'lightly_active',
  'very_active',
  'extremely_active',
];

// Per-activity hues, local to this grid rather than theme tokens (same
// pattern as the Sex page). `fill` is the light-mode border/icon color and
// the selected icon badge fill (carries a white icon); `dark` is the
// brighter border/icon color for the navy dark-mode background.
const ACTIVITY_COLORS: Record<ActivityLevel, { fill: string; dark: string }> = {
  inactive: { fill: '#7E22CE', dark: '#D8B4FE' },
  sedentary: { fill: '#1D4ED8', dark: '#93C5FD' },
  lightly_active: { fill: '#15803D', dark: '#86EFAC' },
  moderately_active: { fill: '#B45309', dark: '#FCD34D' },
  very_active: { fill: '#C2410C', dark: '#FDBA74' },
  extremely_active: { fill: '#B91C1C', dark: '#FCA5A5' },
};

/**
 * Onboarding-only 2x3 activity grid: large cards that stretch to fill the
 * page's content area, each with a thick color-coded border on a
 * transparent background and an outlined icon in a ringed badge. The
 * `Profile` tab uses the compact `ActivityPicker` instead.
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
  const options = GRID_ORDER.map((level) => ACTIVITY_OPTIONS.find((o) => o.value === level)!);
  const rows = Array.from({ length: Math.ceil(options.length / COLUMNS) }, (_, i) =>
    options.slice(i * COLUMNS, i * COLUMNS + COLUMNS),
  );
  const isDark = theme === darkTheme;

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((option) => {
            const selected = value === option.value;
            const colors = ACTIVITY_COLORS[option.value];
            const accent = isDark ? colors.dark : colors.fill;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${option.description}`}
                style={({ pressed }) => [styles.card, { borderColor: accent }, pressed && styles.pressed]}
              >
                {selected ? (
                  <MaterialIcons name="check-circle" size={22} color={accent} style={styles.check} />
                ) : null}
                <View
                  style={[
                    styles.iconRing,
                    { borderColor: accent, backgroundColor: selected ? colors.fill : 'transparent' },
                  ]}
                >
                  <MaterialCommunityIcons name={option.icon} size={30} color={selected ? '#ffffff' : accent} />
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
    borderWidth: 4,
    backgroundColor: 'transparent',
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
