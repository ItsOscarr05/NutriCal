import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { splitActiveCalories } from '../components/activeCalorieSplit';
import { AnimatedFillBar } from '../components/AnimatedFillBar';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { AppHeader } from '../components/AppHeader';
import { CelebrationBanner } from '../components/CelebrationBanner';
import { ChangeNudgeCard } from '../components/ChangeNudgeCard';
import { EnergyArcGauge } from '../components/EnergyArcGauge';
import { FadeInView } from '../components/FadeInView';
import { LockedMicronutrientRow } from '../components/LockedMicronutrientRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { NUTRIENT_INFO, NUTRIENT_KEYS, NutrientCategory } from '../data/dri';
import { MacroKey } from '../data/education/macroExplanations';
import {
  calculateNutrientTargets,
  calculateProteinPerMeal,
  CARB_MIN_GRAMS,
  FAT_MIN_SHARE,
  LB_PER_KG,
  NutrientTargets,
} from '../engine';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { useChangeNudge } from '../profile/useChangeNudge';
import { useAppSettings } from '../settings/AppSettingsContext';
import { Units } from '../settings/appSettings';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { Goal, UserProfile } from '../types/profile';

// Rendered as the `Targets` tab inside `MainTabs`, but navigates to
// root-stack-only routes (`MacroDetail`) — hence the composite type.
type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Targets'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Route = RouteProp<MainTabParamList, 'Targets'>;

type TargetsView = 'macros' | 'micros';
type MicroFilter = 'all' | NutrientCategory;

/** "Anywhere in this band is on target" framing around the calorie number — presentational only. */
const CALORIE_RANGE_KCAL = 50;

const GOAL_STRATEGY: Record<Goal, string> = {
  lose_weight: 'Gentle fat loss • muscle preservation',
  gain_weight: 'Steady gain • balanced fuel',
  build_muscle: 'Lean muscle gain • recovery',
  maintain: 'Maintenance • steady energy',
};

const MACRO_VISUALS: Record<MacroKey, { icon: keyof typeof MaterialIcons.glyphMap; label: string; description: string }> = {
  protein: { icon: 'fitness-center', label: 'Protein', description: 'Muscle retention & satiety' },
  carbs: { icon: 'bolt', label: 'Carbohydrates', description: 'Sustained mental & physical fuel' },
  fat: { icon: 'water-drop', label: 'Healthy Fats', description: 'Hormone health & vitamin uptake' },
};

const MICRO_FILTERS: { key: MicroFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'vitamin', label: 'Vitamins' },
  { key: 'mineral', label: 'Minerals' },
];

/**
 * The `Targets` tab (v2 Stitch "Your Science Targets" redesign): a
 * Macronutrients / Micros & Minerals toggle. Macros shows the real
 * calorie target on a BMR / movement / digestion arc, per-macro cards
 * (tap for `MacroDetail`), and the energy-budget math. Micros is the
 * locked, name-only list (PRD §7, §8.4) that used to be its own tab.
 *
 * Every number comes from `calculateNutrientTargets` except the
 * NEAT / workout / TEF sub-split, which is the labeled estimate from
 * `splitActiveCalories`. Also hosts the one-time post-onboarding
 * celebration (`justCompleted`) and the 30-day change nudge.
 */
export function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const theme = useTheme();
  const { profile } = useProfile();
  const { settings } = useAppSettings();
  const { visible: showChangeNudge, dismiss: dismissChangeNudge } = useChangeNudge(profile);
  const [showCelebration, setShowCelebration] = useState(!!params?.justCompleted);
  const [view, setView] = useState<TargetsView>('macros');

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const targets = calculateNutrientTargets(profile);
  const handleEditProfile = () => navigation.navigate('Profile');

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>Metabolic precision</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Your Science Targets</Text>
          </View>
          <View style={[styles.titleIcon, { backgroundColor: theme.accentFixed }]}>
            <MaterialIcons name="calculate" size={28} color={theme.accent} />
          </View>
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.surfaceContainerHigh }]} accessibilityRole="tablist">
          <SegmentButton theme={theme} icon="bolt" label="Macronutrients" active={view === 'macros'} onPress={() => setView('macros')} />
          <SegmentButton theme={theme} icon="biotech" label="Micros & Minerals" active={view === 'micros'} onPress={() => setView('micros')} />
        </View>

        {showChangeNudge && <ChangeNudgeCard onUpdate={handleEditProfile} onDismiss={dismissChangeNudge} />}

        {view === 'macros' ? (
          <MacrosView
            theme={theme}
            profile={profile}
            targets={targets}
            units={settings.units}
            onMacroPress={(macro) =>
              navigation.navigate('MacroDetail', {
                macro,
                grams: targets.macros[macro].grams,
                percent: targets.macros[macro].percentOfCalories,
                goal: profile.goal,
              })
            }
          />
        ) : (
          <MicrosView theme={theme} />
        )}

        <View style={styles.cta}>
          <PrimaryButton label="Recalibrate My Targets" onPress={handleEditProfile} />
        </View>
      </ScrollView>
      {showCelebration && <CelebrationBanner message="Here are your numbers!" onDone={() => setShowCelebration(false)} />}
    </View>
  );
}

function SegmentButton({
  theme,
  icon,
  label,
  active,
  onPress,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.segment, active && { backgroundColor: theme.buttonFill }]}
    >
      <MaterialIcons name={icon} size={18} color={active ? theme.onButtonFill : theme.textSecondary} />
      <Text style={[styles.segmentLabel, { color: active ? theme.onButtonFill : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function MacrosView({
  theme,
  profile,
  targets,
  units,
  onMacroPress,
}: {
  theme: ThemeColors;
  profile: UserProfile;
  targets: NutrientTargets;
  units: Units;
  onMacroPress: (macro: MacroKey) => void;
}) {
  const split = splitActiveCalories(targets.bmr, targets.tdee);
  const bmr = Math.round(targets.bmr);
  const tdee = Math.round(targets.tdee);
  const movement = split.neat + split.exercise;
  const delta = Math.round(targets.calorieTarget - targets.tdee);
  const deltaPercent = tdee > 0 ? Math.round((Math.abs(delta) / tdee) * 100) : 0;
  const perWeight = (grams: number) =>
    units === 'imperial' ? `${(grams / (profile.weightKg * LB_PER_KG)).toFixed(1)} g / lb` : `${(grams / profile.weightKg).toFixed(1)} g / kg`;

  const macroTips: Record<MacroKey, { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }> = {
    protein: { icon: 'schedule', label: 'Per-meal guide', value: `~${calculateProteinPerMeal(profile.weightKg)} g across ~4 meals` },
    carbs: { icon: 'grain', label: 'Daily floor', value: `At least ${CARB_MIN_GRAMS} g for brain fuel` },
    fat: { icon: 'spa', label: 'Daily floor', value: `At least ${Math.round(FAT_MIN_SHARE * 100)}% of calories` },
  };
  const macroColors: Record<MacroKey, { accent: string; tint: string; onTint: string; fill: string }> = {
    protein: { accent: theme.tertiary, tint: theme.tertiaryFixed, onTint: theme.onTertiaryFixed, fill: theme.tertiary },
    carbs: { accent: theme.secondary, tint: theme.secondaryFixed, onTint: theme.onSecondaryFixed, fill: theme.secondaryContainer },
    fat: { accent: theme.accent, tint: theme.accentFixed, onTint: theme.onAccentFixed, fill: theme.accentFill },
  };

  return (
    <View style={styles.section}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.flexShrink}>
            <Badge theme={theme} icon="verified" label="Mifflin-St Jeor calibrated" />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Daily Energy Compass</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Calibrated to your body and your goal</Text>
          </View>
          <View style={[styles.zeroGuilt, { backgroundColor: theme.secondaryFixed }]}>
            <MaterialIcons name="eco" size={14} color={theme.onSecondaryFixed} />
            <Text style={[styles.zeroGuiltText, { color: theme.onSecondaryFixed }]}>Zero guilt</Text>
          </View>
        </View>

        <View style={[styles.compassInner, { backgroundColor: theme.surfaceContainerLow }]}>
          <View style={styles.gaugeRow}>
            <EnergyArcGauge
              size={144}
              trackColor={theme.surfaceContainerHigh}
              segments={[
                { value: bmr, color: theme.accent },
                { value: movement, color: theme.secondaryContainer },
                { value: split.tef, color: theme.tertiary },
              ]}
            >
              <View style={[styles.gaugeBadge, { backgroundColor: theme.accentFixed }]}>
                <Text style={[styles.gaugeBadgeText, { color: theme.onAccentFixed }]}>Target</Text>
              </View>
              <AnimatedNumber value={targets.calorieTarget} style={[styles.gaugeValue, { color: theme.textPrimary }]} />
              <Text style={[styles.gaugeUnit, { color: theme.textSecondary }]}>kcal / day</Text>
            </EnergyArcGauge>
            <View style={styles.rangeBlock}>
              <View style={styles.rangeHeader}>
                <Text style={[styles.rangeTitle, { color: theme.textPrimary }]}>Flexible range</Text>
                <View style={[styles.smallPill, { backgroundColor: theme.accentFixed }]}>
                  <Text style={[styles.smallPillText, { color: theme.onAccentFixed }]}>±{CALORIE_RANGE_KCAL} kcal</Text>
                </View>
              </View>
              <Text style={[styles.rangeValue, { color: theme.accent }]}>
                {(targets.calorieTarget - CALORIE_RANGE_KCAL).toLocaleString()} – {(targets.calorieTarget + CALORIE_RANGE_KCAL).toLocaleString()}
                <Text style={[styles.rangeUnit, { color: theme.textSecondary }]}> kcal</Text>
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Anywhere in this band is on target — day-to-day swings are normal.
              </Text>
            </View>
          </View>
          <View style={[styles.legendRow, { borderTopColor: theme.surfaceContainerHigh }]}>
            <LegendPill theme={theme} color={theme.accent} label="BMR base" value={bmr} />
            <LegendPill theme={theme} color={theme.secondaryContainer} label="Movement*" value={movement} />
            <LegendPill theme={theme} color={theme.tertiary} label="Digestion*" value={split.tef} />
          </View>
          <Text style={[styles.footnote, { color: theme.textSecondary }]}>
            Arc shows your maintenance burn ({tdee.toLocaleString()} kcal). *Estimated split of your activity calories.
          </Text>
        </View>

        <View style={styles.strategyRow}>
          <View style={styles.strategyLabel}>
            <View style={[styles.dot, { backgroundColor: theme.accentFill }]} />
            <Text style={[styles.strategyText, { color: theme.textPrimary }]}>Goal strategy</Text>
          </View>
          <View style={[styles.strategyPill, { backgroundColor: theme.accentFixed }]}>
            <Text style={[styles.strategyPillText, { color: theme.onAccentFixed }]}>{GOAL_STRATEGY[profile.goal]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Target Distribution</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Tap a card for the why</Text>
      </View>
      {(['protein', 'carbs', 'fat'] as MacroKey[]).map((macro, i) => {
        const target = targets.macros[macro];
        const visual = MACRO_VISUALS[macro];
        const colors = macroColors[macro];
        const tip = macroTips[macro];
        return (
          <FadeInView key={macro} delay={i * 100}>
            <Pressable
              onPress={() => onMacroPress(macro)}
              accessibilityRole="button"
              accessibilityLabel={`${visual.label}, ${target.grams} grams, ${target.percentOfCalories}% of your calories. Tap to learn more.`}
              style={({ pressed }) => [styles.card, styles.macroCard, { backgroundColor: theme.surface }, pressed && styles.pressed]}
            >
              <View style={styles.macroTop}>
                <View style={styles.macroLeft}>
                  <View style={[styles.macroIcon, { backgroundColor: colors.tint }]}>
                    <MaterialIcons name={visual.icon} size={24} color={colors.onTint} />
                  </View>
                  <View style={styles.flexShrink}>
                    <View style={styles.macroNameRow}>
                      <Text style={[styles.macroName, { color: theme.textPrimary }]}>{visual.label}</Text>
                      <View style={[styles.smallPill, { backgroundColor: colors.tint }]}>
                        <Text style={[styles.smallPillText, { color: colors.onTint }]}>{target.percentOfCalories}%</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{visual.description}</Text>
                  </View>
                </View>
                <View style={styles.macroRight}>
                  <AnimatedNumber value={target.grams} suffix="g" style={[styles.macroGrams, { color: colors.accent }]} />
                  <Text style={[styles.macroPerWeight, { color: theme.textSecondary }]}>{perWeight(target.grams)}</Text>
                </View>
              </View>
              <AnimatedFillBar percent={target.percentOfCalories} fillColor={colors.fill} trackColor={theme.surfaceContainerHigh} height={10} />
              <View style={[styles.tipRow, { backgroundColor: theme.surfaceContainerLow }]}>
                <View style={styles.tipLabel}>
                  <MaterialIcons name={tip.icon} size={16} color={colors.accent} />
                  <Text style={[styles.tipLabelText, { color: theme.textSecondary }]}>{tip.label}</Text>
                </View>
                <Text style={[styles.tipValue, { color: theme.textPrimary }]}>{tip.value}</Text>
              </View>
            </Pressable>
          </FadeInView>
        );
      })}

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.budgetTitleRow}>
            <MaterialIcons name="science" size={20} color={theme.accent} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Energy Budget Math</Text>
          </View>
          <View style={[styles.smallPill, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.smallPillText, { color: theme.textSecondary }]}>Scientific TDEE</Text>
          </View>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
          No starvation diets. Your target starts from your resting burn plus everyday movement.
        </Text>
        <View style={styles.budgetGrid}>
          <BudgetTile theme={theme} label="Basal metabolic rate" value={bmr} caption="BMR, at rest" />
          <BudgetTile theme={theme} label="Daily movement (NEAT)" value={split.neat} caption="Estimated" />
          <BudgetTile theme={theme} label="Structured workouts" value={split.exercise} caption="Estimated" />
          <BudgetTile theme={theme} label="Digestive burn (TEF)" value={split.tef} caption="Estimated" />
        </View>
        <View style={[styles.deltaBanner, { backgroundColor: theme.accentFixed }]}>
          <View style={styles.deltaLeft}>
            <MaterialIcons
              name={delta < 0 ? 'trending-down' : delta > 0 ? 'trending-up' : 'trending-flat'}
              size={20}
              color={theme.onAccentFixed}
            />
            <View>
              <Text style={[styles.deltaTitle, { color: theme.onAccentFixed }]}>
                {delta < 0 ? 'Daily deficit' : delta > 0 ? 'Daily surplus' : 'At maintenance'}
              </Text>
              <Text style={[styles.deltaCaption, { color: theme.onAccentFixed }]}>
                {delta === 0 ? 'Matches your maintenance burn' : `${deltaPercent}% ${delta < 0 ? 'below' : 'above'} maintenance`}
              </Text>
            </View>
          </View>
          <Text style={[styles.deltaValue, { color: theme.onAccentFixed }]}>
            {delta > 0 ? '+' : delta < 0 ? '−' : ''}
            {Math.abs(delta).toLocaleString()} kcal
          </Text>
        </View>
      </View>
    </View>
  );
}

function MicrosView({ theme }: { theme: ThemeColors }) {
  const [filter, setFilter] = useState<MicroFilter>('all');
  const keys = useMemo(
    () => NUTRIENT_KEYS.filter((key) => filter === 'all' || NUTRIENT_INFO[key].category === filter),
    [filter],
  );

  return (
    <View style={styles.section}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.flexShrink}>
            <Badge theme={theme} icon="eco" label="Cellular health" />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Vital Minerals & Vitamins</Text>
          </View>
          <View style={[styles.microIcon, { backgroundColor: theme.secondaryFixed }]}>
            <MaterialIcons name="medication" size={20} color={theme.onSecondaryFixed} />
          </View>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
          Calories shape your weight; micronutrients shape energy, mood, and repair. Personal targets unlock soon.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {MICRO_FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filterPill, { backgroundColor: active ? theme.accentFill : theme.surfaceContainer }]}
            >
              <Text style={[styles.filterText, { color: active ? theme.onAccentFill : theme.textSecondary }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.microList}>
        {keys.map((key) => (
          <LockedMicronutrientRow key={key} nutrientKey={key} theme={theme} />
        ))}
      </View>

      <View style={[styles.comingSoon, { backgroundColor: theme.surfaceContainerLow }]}>
        <View style={[styles.comingSoonIcon, { backgroundColor: theme.accentFill }]}>
          <MaterialIcons name="lightbulb" size={20} color={theme.onAccentFill} />
        </View>
        <View style={styles.flexShrink}>
          <Text style={[styles.comingSoonTitle, { color: theme.textPrimary }]}>Personal micronutrient targets</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Daily amounts and food pairings tailored to your profile — locked for now while we get the science right.
          </Text>
        </View>
      </View>
    </View>
  );
}

function Badge({ theme, icon, label }: { theme: ThemeColors; icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: theme.accentFixed }]}>
      <MaterialIcons name={icon} size={14} color={theme.onAccentFixed} />
      <Text style={[styles.badgeText, { color: theme.onAccentFixed }]}>{label}</Text>
    </View>
  );
}

function LegendPill({ theme, color, label, value }: { theme: ThemeColors; color: string; label: string; value: number }) {
  return (
    <View style={[styles.legendPill, { backgroundColor: theme.surface }]}>
      <View style={styles.legendLabelRow}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.legendValue, { color: theme.textPrimary }]}>
        {value.toLocaleString()} <Text style={[styles.legendUnit, { color: theme.textSecondary }]}>kcal</Text>
      </Text>
    </View>
  );
}

function BudgetTile({ theme, label, value, caption }: { theme: ThemeColors; label: string; value: number; caption: string }) {
  return (
    <View style={[styles.budgetTile, { backgroundColor: theme.surfaceContainerLow }]}>
      <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.budgetValue, { color: theme.textPrimary }]}>
        {value.toLocaleString()} <Text style={[styles.budgetUnit, { color: theme.textSecondary }]}>kcal</Text>
      </Text>
      <Text style={[styles.budgetCaption, { color: theme.textSecondary }]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md + 4, gap: spacing.md, paddingBottom: spacing.xl },
  flexShrink: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.75 },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleBlock: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  titleIcon: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },

  segmented: { flexDirection: 'row', borderRadius: radii.pill, padding: 6 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radii.pill },
  segmentLabel: { fontSize: 14, fontWeight: '700' },

  section: { gap: spacing.md },
  card: { borderRadius: radii.lg, padding: spacing.md + 4, gap: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, lineHeight: 17 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill, marginBottom: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  zeroGuilt: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  zeroGuiltText: { fontSize: 10, fontWeight: '800' },
  smallPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  smallPillText: { fontSize: 10, fontWeight: '800' },

  compassInner: { borderRadius: radii.md, padding: spacing.sm + 6, gap: spacing.sm, marginTop: spacing.xs },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gaugeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radii.pill, marginTop: 6 },
  gaugeBadgeText: { fontSize: 10, fontWeight: '800' },
  gaugeValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  gaugeUnit: { fontSize: 10, fontWeight: '700' },
  rangeBlock: { flex: 1, minWidth: 0, gap: 4 },
  rangeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rangeTitle: { fontSize: 14, fontWeight: '700' },
  rangeValue: { fontSize: 17, fontWeight: '800' },
  rangeUnit: { fontSize: 12, fontWeight: '400' },
  legendRow: { flexDirection: 'row', gap: 6, paddingTop: spacing.sm, borderTopWidth: 1 },
  legendPill: { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 6 },
  legendLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontWeight: '600' },
  legendValue: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  legendUnit: { fontSize: 10, fontWeight: '400' },
  footnote: { fontSize: 10, lineHeight: 14 },
  strategyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' },
  strategyLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  strategyText: { fontSize: 12, fontWeight: '600' },
  strategyPill: { paddingHorizontal: spacing.sm + 4, paddingVertical: 4, borderRadius: radii.pill, flexShrink: 1 },
  strategyPillText: { fontSize: 12, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 11 },

  macroCard: { gap: spacing.sm + 4 },
  macroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  macroLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, flex: 1, minWidth: 0 },
  macroIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  macroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  macroName: { fontSize: 17, fontWeight: '700' },
  macroRight: { alignItems: 'flex-end' },
  macroGrams: { fontSize: 22, fontWeight: '800' },
  macroPerWeight: { fontSize: 10, fontWeight: '700' },
  tipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: 10, borderRadius: radii.md },
  tipLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipLabelText: { fontSize: 11, fontWeight: '700' },
  tipValue: { fontSize: 11, fontWeight: '700', flexShrink: 1, textAlign: 'right' },

  budgetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.xs },
  budgetTile: { width: '48%', flexGrow: 1, borderRadius: radii.md, padding: spacing.sm + 4 },
  budgetLabel: { fontSize: 11, fontWeight: '600' },
  budgetValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  budgetUnit: { fontSize: 11, fontWeight: '400' },
  budgetCaption: { fontSize: 10, marginTop: 2 },
  deltaBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm + 4, borderRadius: radii.md, marginTop: spacing.xs },
  deltaLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  deltaTitle: { fontSize: 13, fontWeight: '800' },
  deltaCaption: { fontSize: 11 },
  deltaValue: { fontSize: 17, fontWeight: '800' },

  microIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: spacing.xs },
  filterPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill },
  filterText: { fontSize: 12, fontWeight: '700' },
  microList: { gap: 10 },
  comingSoon: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, borderRadius: radii.lg, padding: spacing.md },
  comingSoonIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  comingSoonTitle: { fontSize: 13, fontWeight: '800' },

  cta: { marginTop: spacing.xs },
});
