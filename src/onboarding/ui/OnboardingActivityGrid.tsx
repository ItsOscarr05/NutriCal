import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkTheme, radii, spacing, ThemeColors } from '../../theme';
import { ActivityLevel } from '../../types/profile';
import { ACTIVITY_OPTIONS } from '../assessmentOptions';

const COLUMNS = 2;

// Cool-to-warm hues by intensity, local to this grid rather than theme
// tokens (same pattern as the Sex page). `fill` carries white text
// (>= 4.5:1); `lightText`/`darkText` color the icon on the pale `tint` in
// light and dark mode.
const ACTIVITY_COLORS: Record<ActivityLevel, { fill: string; lightText: string; darkText: string; tint: string }> = {
  inactive: { fill: '#1D4ED8', lightText: '#1E40AF', darkText: '#93C5FD', tint: 'rgba(29, 78, 216, 0.14)' },
  sedentary: { fill: '#0F766E', lightText: '#115E59', darkText: '#5EEAD4', tint: 'rgba(15, 118, 110, 0.14)' },
  lightly_active: { fill: '#15803D', lightText: '#166534', darkText: '#86EFAC', tint: 'rgba(21, 128, 61, 0.14)' },
  moderately_active: { fill: '#B45309', lightText: '#92400E', darkText: '#FCD34D', tint: 'rgba(180, 83, 9, 0.14)' },
  very_active: { fill: '#C2410C', lightText: '#9A3412', darkText: '#FDBA74', tint: 'rgba(194, 65, 12, 0.14)' },
  extremely_active: { fill: '#B91C1C', lightText: '#991B1B', darkText: '#FCA5A5', tint: 'rgba(185, 28, 28, 0.14)' },
};

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
            const colors = ACTIVITY_COLORS[option.value];
            const fg = selected ? '#ffffff' : theme === darkTheme ? colors.darkText : colors.lightText;
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
                    backgroundColor: selected ? colors.fill : colors.tint,
                    borderColor: selected ? colors.fill : 'transparent',
                  },
                  pressed && styles.pressed,
                ]}
              >
                {selected ? (
                  <MaterialIcons name="check-circle" size={20} color="#ffffff" style={styles.check} />
                ) : null}
                <View style={[styles.iconRing, { borderColor: fg }]}>
                  <MaterialCommunityIcons name={option.icon} size={30} color={fg} />
                </View>
                <Text style={[styles.label, { color: selected ? '#ffffff' : theme.textPrimary }]}>{option.label}</Text>
                <Text style={[styles.description, { color: selected ? '#ffffff' : theme.textSecondary }]}>
                  {option.description}
                </Text>
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
