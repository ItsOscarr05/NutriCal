import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { splitActiveCalories } from '../components/activeCalorieSplit';
import { AnimatedFillBar } from '../components/AnimatedFillBar';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { AppHeader } from '../components/AppHeader';
import { EnergyArcGauge } from '../components/EnergyArcGauge';
import { FadeInView } from '../components/FadeInView';
import { LockedMicronutrientRow } from '../components/LockedMicronutrientRow';
import { Mascot } from '../components/Mascot';
import { NutrientKey } from '../data/dri';
import { MacroKey } from '../data/education/macroExplanations';
import { calculateNutrientTargets } from '../engine';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../onboarding/assessmentOptions';
import { daysSince } from '../profile/nudge';
import { useProfile } from '../profile/ProfileContext';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { Goal } from '../types/profile';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Featured on the Home teaser only as names — values stay locked (PRD §7, §8.4). */
const FEATURED_MICROS: NutrientKey[] = ['vitamin_d', 'magnesium'];

const BURN_LABEL: Record<Goal, string> = {
  lose_weight: 'Gentle deficit',
  gain_weight: 'Gentle surplus',
  build_muscle: 'Lean surplus',
  maintain: 'Balanced burn',
};

// Plain-language, non-judgmental (PRD §11.1); goal-level rather than
// macro-level, so it lives here rather than in `macroExplanations.ts`.
const GOAL_INSIGHT: Record<Goal, string> = {
  lose_weight: 'A gentle deficit tailored to your activity level — steady, sustainable progress with no starving and no food guilt.',
  gain_weight: 'A gentle surplus tailored to your activity level, giving your body the extra energy it needs to gain steadily.',
  build_muscle: 'A modest surplus with extra protein — what your body needs to build muscle without excess fat gain.',
  maintain: 'Calories matched to your activity level — no deficit, no surplus, just steady fuel for where you are today.',
};

const MACRO_TILES: { key: MacroKey; label: string; caption: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'protein', label: 'Protein', caption: 'Tissue & repair', icon: 'fitness-center' },
  { key: 'carbs', label: 'Carbs', caption: 'Glycogen fuel', icon: 'bolt' },
  { key: 'fat', label: 'Fats', caption: 'Hormone health', icon: 'spa' },
];

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The `Home` tab (v2 Stitch "Home" mockup) — a daily overview: greeting,
 * the calorie gauge (same BMR / movement / digestion split as Targets),
 * quick macro tiles (tap for `MacroDetail`), a locked micronutrient
 * teaser, and shortcuts to Profile, Science, and Recipes.
 *
 * The mockup's name, streak, energy/hydration/sleep pills, barcode
 * scanner, and "recovery score" have no data behind them in this app, so
 * they're replaced by things that are real (goal/activity chips, how long
 * ago the profile was calibrated) or left out.
 */
export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { profile } = useProfile();

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const targets = calculateNutrientTargets(profile);
  const split = splitActiveCalories(targets.bmr, targets.tdee);
  const bmr = Math.round(targets.bmr);
  const tdee = Math.round(targets.tdee);
  const movement = split.neat + split.exercise;
  const share = (value: number) => (tdee > 0 ? Math.round((value / tdee) * 100) : 0);
  const goalLabel = GOAL_OPTIONS.find((o) => o.value === profile.goal)?.label ?? '';
  const activityLabel = ACTIVITY_OPTIONS.find((o) => o.value === profile.activityLevel)?.label ?? '';
  const calibratedDays = Math.max(0, Math.floor(daysSince(profile.updatedAt)));

  const macroColors: Record<MacroKey, { tint: string; onTint: string; fill: string }> = {
    protein: { tint: theme.tertiaryFixed, onTint: theme.onTertiaryFixed, fill: theme.tertiary },
    carbs: { tint: theme.secondaryFixed, onTint: theme.onSecondaryFixed, fill: theme.secondaryContainer },
    fat: { tint: theme.accentFixed, onTint: theme.onAccentFixed, fill: theme.accentFill },
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.greetingRow}>
            <View style={styles.flexShrink}>
              <Text style={[styles.greeting, { color: theme.textPrimary }]}>{greeting(new Date())} 👋</Text>
              <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>Today's metabolic blueprint</Text>
            </View>
            <View style={[styles.greetingIcon, { backgroundColor: theme.accentFixed }]}>
              <MaterialIcons name="eco" size={22} color={theme.accent} />
            </View>
          </View>
          <View style={styles.chipRow}>
            <Chip icon="flag" label={goalLabel} bg={theme.accentFixed} fg={theme.onAccentFixed} />
            <Chip icon="directions-walk" label={activityLabel} bg={theme.secondaryFixed} fg={theme.onSecondaryFixed} />
            <Chip icon="lock-outline" label="On-device only" bg={theme.surfaceContainer} fg={theme.textSecondary} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.dot, { backgroundColor: theme.accent }]} />
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Target Fuel Gauge</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.pillText, { color: theme.textSecondary }]}>{BURN_LABEL[profile.goal]}</Text>
            </View>
          </View>

          <View style={styles.gaugeWrap}>
            <EnergyArcGauge
              size={220}
              strokeWidth={10}
              trackColor={theme.surfaceContainerHigh}
              segments={[
                { value: bmr, color: theme.accent },
                { value: movement, color: theme.secondaryContainer },
                { value: split.tef, color: theme.tertiary },
              ]}
            >
              <View style={[styles.gaugeBadge, { backgroundColor: theme.accentFixed }]}>
                <Text style={[styles.gaugeBadgeText, { color: theme.onAccentFixed }]}>Daily target</Text>
              </View>
              <AnimatedNumber value={targets.calorieTarget} style={[styles.gaugeValue, { color: theme.textPrimary }]} />
              <Text style={[styles.gaugeUnit, { color: theme.textSecondary }]}>KCAL / DAY</Text>
            </EnergyArcGauge>
            <View style={styles.gaugeMarkers}>
              <Text style={[styles.marker, { color: theme.textSecondary }]}>BMR {bmr.toLocaleString()}</Text>
              <Text style={[styles.marker, { color: theme.textSecondary }]}>TDEE {tdee.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.partitionBox, { borderColor: theme.surfaceContainerHigh }]}>
            <View style={styles.partitionHeader}>
              <Text style={[styles.partitionTitle, { color: theme.textSecondary }]}>Maintenance burn partitions</Text>
              <Text style={[styles.partitionTotal, { color: theme.textSecondary }]}>total = {tdee.toLocaleString()} kcal</Text>
            </View>
            <View style={styles.partitionRow}>
              <Partition theme={theme} color={theme.accent} bg={theme.accentFixed} fg={theme.onAccentFixed} label="BMR base" value={bmr} caption={`${share(bmr)}% resting`} />
              <Partition theme={theme} color={theme.secondaryContainer} bg={theme.secondaryFixed} fg={theme.onSecondaryFixed} label="Movement*" value={movement} caption={`${share(movement)}% activity`} />
              <Partition theme={theme} color={theme.tertiary} bg={theme.tertiaryFixed} fg={theme.onTertiaryFixed} label="Digestion*" value={split.tef} caption={`${share(split.tef)}% thermic`} />
            </View>
            <Text style={[styles.footnote, { color: theme.textSecondary }]}>*Estimated split of your activity calories.</Text>
          </View>

          <View style={[styles.takeaway, { backgroundColor: theme.accentFixed }]}>
            <MaterialIcons name="psychology" size={20} color={theme.onAccentFixed} />
            <Text style={[styles.takeawayText, { color: theme.onAccentFixed }]}>
              <Text style={styles.bold}>Why this works: </Text>
              {GOAL_INSIGHT[profile.goal]}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Macro Fuel Partition</Text>
            <Text style={[styles.hint, { color: theme.textSecondary }]}>Daily allotment</Text>
          </View>
          <View style={styles.macroRow}>
            {MACRO_TILES.map((tile, i) => {
              const target = targets.macros[tile.key];
              const colors = macroColors[tile.key];
              return (
                <FadeInView key={tile.key} delay={i * 80} style={styles.macroTileWrap}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('MacroDetail', {
                        macro: tile.key,
                        grams: target.grams,
                        percent: target.percentOfCalories,
                        goal: profile.goal,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${tile.label}, ${target.grams} grams. Tap to learn more.`}
                    style={({ pressed }) => [styles.macroTile, { backgroundColor: colors.tint }, pressed && styles.pressed]}
                  >
                    <View style={styles.macroTileHeader}>
                      <Text style={[styles.macroTileLabel, { color: colors.onTint }]}>{tile.label}</Text>
                      <MaterialIcons name={tile.icon} size={16} color={colors.onTint} />
                    </View>
                    <AnimatedNumber value={target.grams} suffix="g" style={[styles.macroTileValue, { color: colors.onTint }]} />
                    <AnimatedFillBar percent={target.percentOfCalories} fillColor={colors.fill} trackColor={theme.surface} height={5} />
                    <Text style={[styles.macroTileCaption, { color: colors.onTint }]} numberOfLines={1}>
                      {tile.caption}
                    </Text>
                  </Pressable>
                </FadeInView>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialIcons name="verified" size={20} color={theme.accent} />
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Micro Focus</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.pillText, { color: theme.textSecondary }]}>Coming soon</Text>
            </View>
          </View>
          <View style={styles.microList}>
            {FEATURED_MICROS.map((key) => (
              <LockedMicronutrientRow key={key} nutrientKey={key} theme={theme} />
            ))}
          </View>
          <Pressable
            onPress={() => navigation.navigate('Targets', { view: 'micros' })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <Text style={[styles.linkText, { color: theme.accent }]}>Explore all micros & minerals</Text>
            <MaterialIcons name="arrow-forward" size={16} color={theme.accent} />
          </Pressable>
        </View>

        <View style={styles.actionGrid}>
          <ActionCard
            theme={theme}
            icon="scale"
            iconBg={theme.accentFixed}
            iconFg={theme.onAccentFixed}
            title="Update my stats"
            body="Weight or activity changed? Recalibrate your targets."
            onPress={() => navigation.navigate('Profile')}
          />
          <ActionCard
            theme={theme}
            icon="science"
            iconBg={theme.tertiaryFixed}
            iconFg={theme.onTertiaryFixed}
            title="Thermic effect"
            badge="TEF fact"
            body="Digesting protein burns roughly 20–30% of its own calories — more than carbs or fat."
            onPress={() => navigation.navigate('Science')}
          />
          <ActionCard
            theme={theme}
            icon="soup-kitchen"
            iconBg={theme.secondaryFixed}
            iconFg={theme.onSecondaryFixed}
            title="Tailored meals"
            body="Meal ideas ranked against your own macro targets."
            onPress={() => navigation.navigate('Recipes')}
            wide
          />
        </View>

        <View style={[styles.mascotBanner, { backgroundColor: theme.surfaceContainerLow }]}>
          <Mascot size={56} />
          <View style={styles.flexShrink}>
            <Text style={[styles.mascotTitle, { color: theme.textPrimary }]}>NutriCal Sprout</Text>
            <Text style={[styles.mascotBody, { color: theme.textSecondary }]}>
              {calibratedDays === 0
                ? 'Your targets were calibrated today. Steady rhythm — small, consistent days add up.'
                : `Your targets were calibrated ${calibratedDays} day${calibratedDays === 1 ? '' : 's'} ago. If your weight or routine has changed, a quick recalibration keeps them honest.`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Chip({
  icon,
  label,
  bg,
  fg,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  bg: string;
  fg: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <MaterialIcons name={icon} size={14} color={fg} />
      <Text style={[styles.chipText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Partition({
  theme,
  color,
  bg,
  fg,
  label,
  value,
  caption,
}: {
  theme: ThemeColors;
  color: string;
  bg: string;
  fg: string;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <View style={[styles.partition, { backgroundColor: bg }]}>
      <View style={styles.partitionLabelRow}>
        <View style={[styles.partitionDot, { backgroundColor: color }]} />
        <Text style={[styles.partitionLabel, { color: fg }]}>{label}</Text>
      </View>
      <Text style={[styles.partitionValue, { color: fg }]}>
        {value.toLocaleString()} <Text style={[styles.partitionUnit, { color: fg }]}>kcal</Text>
      </Text>
      <Text style={[styles.partitionCaption, { color: theme.textSecondary }]}>{caption}</Text>
    </View>
  );
}

function ActionCard({
  theme,
  icon,
  iconBg,
  iconFg,
  title,
  body,
  badge,
  onPress,
  wide,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconFg: string;
  title: string;
  body: string;
  badge?: string;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.actionCard, wide && styles.actionCardWide, { backgroundColor: theme.surface }, pressed && styles.pressed]}
    >
      <View style={styles.actionHeader}>
        <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconFg} />
        </View>
        {badge ? (
          <View style={[styles.pill, { backgroundColor: theme.tertiaryFixed }]}>
            <Text style={[styles.pillText, { color: theme.onTertiaryFixed }]}>{badge}</Text>
          </View>
        ) : (
          <MaterialIcons name="arrow-forward" size={18} color={theme.textSecondary} />
        )}
      </View>
      <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.actionBody, { color: theme.textSecondary }]}>{body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md + 4, gap: spacing.md, paddingBottom: spacing.xl },
  flexShrink: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.75 },
  bold: { fontWeight: '800' },

  card: { borderRadius: radii.lg, padding: spacing.md + 4, gap: spacing.sm + 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  hint: { fontSize: 11 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill },
  pillText: { fontSize: 10, fontWeight: '800' },

  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  greeting: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  greetingSub: { fontSize: 13, marginTop: 2 },
  greetingIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 2, paddingVertical: 6, borderRadius: radii.pill, maxWidth: '100%' },
  chipText: { fontSize: 12, fontWeight: '700', flexShrink: 1 },

  gaugeWrap: { alignItems: 'center' },
  gaugeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill, marginTop: spacing.sm },
  gaugeBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  gaugeValue: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  gaugeUnit: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  gaugeMarkers: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginTop: -spacing.lg },
  marker: { fontSize: 10, fontWeight: '700' },

  partitionBox: { borderTopWidth: 1, paddingTop: spacing.sm + 4, gap: spacing.sm },
  partitionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  partitionTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  partitionTotal: { fontSize: 10 },
  partitionRow: { flexDirection: 'row', gap: spacing.xs + 2 },
  partition: { flex: 1, borderRadius: radii.md, padding: spacing.sm + 2, gap: 2 },
  partitionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partitionDot: { width: 8, height: 8, borderRadius: 4 },
  partitionLabel: { fontSize: 11, fontWeight: '700' },
  partitionValue: { fontSize: 16, fontWeight: '800' },
  partitionUnit: { fontSize: 10, fontWeight: '400' },
  partitionCaption: { fontSize: 10 },
  footnote: { fontSize: 10 },
  takeaway: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm + 4, borderRadius: radii.md, alignItems: 'flex-start' },
  takeawayText: { flex: 1, fontSize: 12, lineHeight: 17 },

  macroRow: { flexDirection: 'row', gap: spacing.xs + 2 },
  macroTileWrap: { flex: 1 },
  macroTile: { borderRadius: radii.md, padding: spacing.sm + 2, gap: 6 },
  macroTileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  macroTileLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  macroTileValue: { fontSize: 22, fontWeight: '800' },
  macroTileCaption: { fontSize: 10, fontWeight: '700' },

  microList: { gap: spacing.xs + 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  linkText: { fontSize: 13, fontWeight: '700' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 2 },
  actionCard: { flexGrow: 1, flexBasis: '45%', borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  actionCardWide: { flexBasis: '100%' },
  actionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  actionIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '800' },
  actionBody: { fontSize: 12, lineHeight: 17 },

  mascotBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, borderRadius: radii.lg, padding: spacing.md },
  mascotTitle: { fontSize: 14, fontWeight: '800' },
  mascotBody: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
