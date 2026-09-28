import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NUTRIENT_INFO, NUTRIENT_KEYS, NutrientCategory, NutrientKey } from '../data/dri';
import { radii, spacing, ThemeColors, useTheme } from '../theme';

type Filter = 'all' | NutrientCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Micros' },
  { key: 'vitamin', label: 'Vitamins' },
  { key: 'mineral', label: 'Minerals' },
];

// Purely decorative per-nutrient emoji — not clinical iconography, matching
// the friendly/non-alarming tone the Stitch mockup used for this screen.
// Real DRI values/percentages for these nutrients stay premium-gated (see
// component doc comment below); this map only labels the *name*.
const NUTRIENT_EMOJI: Record<NutrientKey, string> = {
  vitamin_a: '🥕',
  vitamin_c: '🍊',
  vitamin_d: '☀️',
  vitamin_e: '🌻',
  vitamin_k: '🥦',
  vitamin_b6: '🍌',
  vitamin_b12: '🥩',
  thiamin: '🌾',
  riboflavin: '🥛',
  niacin: '🐔',
  folate: '🥬',
  calcium: '🦴',
  iron: '⚡',
  magnesium: '🌙',
  phosphorus: '🐟',
  potassium: '🥔',
  sodium: '🧂',
  zinc: '🛡️',
  selenium: '🌰',
  iodine: '🌊',
};

/**
 * The "Micronutrient Explorer" screen (v1.1 Stitch redesign, `Micros` tab).
 *
 * IMPORTANT — deliberately diverges from the Stitch mockup: the mockup shows
 * real per-nutrient RDA percentages, progress bars, and "where to get it in
 * real food" drawers to every user. NutriCal has no premium/entitlement
 * system yet and AGENTS.md's freemium rule (PRD §7, §8.4) is explicit that
 * micronutrients stay premium-gated and are shown to free users as a
 * *locked, name-only teaser* — no values, no percentages, no food-source
 * content (that copy belongs in `src/data/education` once gating exists,
 * per AGENTS.md's education-copy note; it hasn't been written yet). So
 * every card below renders only the nutrient's name/category/emoji plus a
 * lock affordance — never `getAllMicronutrientTargets`/DRI amounts.
 */
export function MicronutrientExplorerScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const visibleKeys = useMemo(
    () => NUTRIENT_KEYS.filter((key) => filter === 'all' || NUTRIENT_INFO[key].category === filter),
    [filter],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: theme.surfaceContainerLow }]}>
        <View style={[styles.bannerBadge, { backgroundColor: theme.accentFixed }]}>
          <MaterialIcons name="eco" size={16} color={theme.accent} />
          <Text style={[styles.bannerBadgeText, { color: theme.onAccentFixed }]}>Vital Fuel Lab</Text>
        </View>
        <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>
          Micronutrients: <Text style={{ color: theme.accent }}>The Hidden Fuel</Text>
        </Text>
        <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
          The tiny spark plugs behind your mood, energy, and sleep — unlock your personal targets soon.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Text
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterPill,
                { backgroundColor: active ? theme.accent : theme.surfaceContainer, color: active ? theme.onAccent : theme.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          );
        })}
      </View>

      <View style={styles.grid}>
        {visibleKeys.map((key) => (
          <LockedNutrientCard key={key} nutrientKey={key} theme={theme} />
        ))}
      </View>

      <View style={[styles.promoCard, { backgroundColor: theme.surfaceContainerHigh }]}>
        <View style={styles.promoHeaderRow}>
          <View style={styles.promoHeaderLeft}>
            <MaterialIcons name="verified" size={20} color={theme.secondary} />
            <Text style={[styles.promoEyebrow, { color: theme.secondary }]}>Clinical Deep-Dive</Text>
          </View>
          <View style={[styles.comingSoonBadge, { backgroundColor: theme.secondaryFixed }]}>
            <Text style={[styles.comingSoonBadgeText, { color: theme.onSecondaryFixed }]}>Coming Soon</Text>
          </View>
        </View>
        <Text style={[styles.promoTitle, { color: theme.textPrimary }]}>Personal Micronutrient Targets</Text>
        <Text style={[styles.promoBody, { color: theme.textSecondary }]}>
          We're building daily RDA gauges, food-source pairings, and a bioavailability &amp; timing guide tailored to
          your profile — locked for now while we get the science right.
        </Text>
      </View>
    </ScrollView>
  );
}

function LockedNutrientCard({ nutrientKey, theme }: { nutrientKey: NutrientKey; theme: ThemeColors }) {
  const info = NUTRIENT_INFO[nutrientKey];
  const isVitamin = info.category === 'vitamin';
  const badgeBg = isVitamin ? theme.accentFixed : theme.secondaryFixed;
  const badgeFg = isVitamin ? theme.onAccentFixed : theme.onSecondaryFixed;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={[styles.cardIconBadge, { backgroundColor: badgeBg }]}>
        <Text style={styles.cardEmoji}>{NUTRIENT_EMOJI[nutrientKey]}</Text>
      </View>
      <View style={styles.cardTextBlock}>
        <Text style={[styles.cardName, { color: theme.textPrimary }]}>{info.displayName}</Text>
        <Text style={[styles.cardCategory, { color: badgeFg, backgroundColor: badgeBg }]}>
          {isVitamin ? 'Vitamin' : 'Mineral'}
        </Text>
      </View>
      <View style={[styles.lockBadge, { backgroundColor: theme.surfaceContainerHigh }]}>
        <MaterialIcons name="lock-outline" size={16} color={theme.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },

  banner: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  bannerBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginTop: 4 },
  bannerSubtitle: { fontSize: 13, marginTop: 2, maxWidth: 280 },

  filterRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  filterPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.pill, fontSize: 12, fontWeight: '700', overflow: 'hidden' },

  grid: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.lg, padding: spacing.sm },
  cardIconBadge: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 20 },
  cardTextBlock: { flex: 1, minWidth: 0, gap: 4 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardCategory: { fontSize: 10, fontWeight: '700', alignSelf: 'flex-start', paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: radii.pill, textTransform: 'uppercase', letterSpacing: 0.3, overflow: 'hidden' },
  lockBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  promoCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  promoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoEyebrow: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  comingSoonBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill },
  comingSoonBadgeText: { fontSize: 10, fontWeight: '800' },
  promoTitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  promoBody: { fontSize: 13, lineHeight: 18 },
});
