import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { NUTRIENT_INFO, NutrientKey } from '../data/dri';
import { radii, spacing, ThemeColors } from '../theme';

/** Short chemical/vitamin symbol shown in each row's badge — a label only, never a value. */
export const NUTRIENT_SYMBOL: Record<NutrientKey, string> = {
  vitamin_a: 'A',
  vitamin_c: 'C',
  vitamin_d: 'D',
  vitamin_e: 'E',
  vitamin_k: 'K',
  vitamin_b6: 'B6',
  vitamin_b12: 'B12',
  thiamin: 'B1',
  riboflavin: 'B2',
  niacin: 'B3',
  folate: 'B9',
  calcium: 'Ca',
  iron: 'Fe',
  magnesium: 'Mg',
  phosphorus: 'P',
  potassium: 'K',
  sodium: 'Na',
  zinc: 'Zn',
  selenium: 'Se',
  iodine: 'I',
};

/**
 * One locked micronutrient row: symbol badge, name, category, and a lock.
 * Micronutrient values are premium-gated (PRD §7, §8.4) and there's no
 * entitlement system yet, so this deliberately renders no DRI amount,
 * percentage, or food-source copy — the Stitch mockups' progress bars
 * and "% met" are replaced by the lock.
 */
export function LockedMicronutrientRow({ nutrientKey, theme }: { nutrientKey: NutrientKey; theme: ThemeColors }) {
  const info = NUTRIENT_INFO[nutrientKey];
  const isVitamin = info.category === 'vitamin';
  const badgeBg = isVitamin ? theme.accentFixed : theme.secondaryFixed;
  const badgeFg = isVitamin ? theme.onAccentFixed : theme.onSecondaryFixed;

  return (
    <View
      style={[styles.row, { backgroundColor: theme.surface }]}
      accessible
      accessibilityLabel={`${info.displayName}, ${isVitamin ? 'vitamin' : 'mineral'}, target locked`}
    >
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.symbol, { color: badgeFg }]}>{NUTRIENT_SYMBOL[nutrientKey]}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{info.displayName}</Text>
        <Text style={[styles.category, { color: theme.textSecondary }]}>
          {isVitamin ? 'Vitamin' : 'Mineral'} • Target locked
        </Text>
      </View>
      <View style={[styles.lock, { backgroundColor: theme.surfaceContainerHigh }]}>
        <MaterialIcons name="lock-outline" size={16} color={theme.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.md, padding: spacing.sm + 4 },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 13, fontWeight: '800' },
  textBlock: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '700' },
  category: { fontSize: 11, marginTop: 1 },
  lock: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
