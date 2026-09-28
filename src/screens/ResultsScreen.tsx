import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CelebrationBanner } from '../components/CelebrationBanner';
import { ChangeNudgeCard } from '../components/ChangeNudgeCard';
import { CircularProgress } from '../components/CircularProgress';
import { FadeInView } from '../components/FadeInView';
import { GearButton } from '../components/GearButton';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { MacroKey } from '../data/education/macroExplanations';
import { calculateNutrientTargets } from '../engine';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { useChangeNudge } from '../profile/useChangeNudge';
import { palette, radii, spacing, ThemeColors, useTheme } from '../theme';
import { Goal } from '../types/profile';

// This screen now renders as the `Targets` tab inside `MainTabs`, but still
// navigates to root-stack-only routes (`Settings`, `MacroDetail`) — hence
// the composite type combining both navigators, the standard React
// Navigation pattern for a screen nested in a child navigator that needs
// to act on an ancestor navigator.
type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Targets'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Route = RouteProp<MainTabParamList, 'Targets'>;

/**
 * Per-macro visual language (PRD §11.3) — each macro gets a Material icon
 * in a pale "fixed" badge, matched to one of the new Stitch palette's
 * three accent families (tertiary/secondary/primary) rather than the old
 * arbitrary one-off hex codes, so macro colors now share the exact same
 * semantic families used everywhere else in the redesign (e.g. the Quick
 * Assessment screen's goal icons).
 */
const MACRO_VISUALS: Record<MacroKey, { icon: keyof typeof MaterialIcons.glyphMap }> = {
  protein: { icon: 'fitness-center' },
  carbs: { icon: 'wb-sunny' },
  fat: { icon: 'water-drop' },
};

const GOAL_DESCRIPTOR: Record<Goal, string> = {
  maintain: 'Maintenance Target',
  lose_weight: 'Weight Loss Target',
  gain_weight: 'Weight Gain Target',
  build_muscle: 'Muscle Building Target',
};

// Plain-language, non-judgmental (PRD §11.1) — mirrors the tone/structure
// of `src/data/education/macroExplanations.ts`, but goal-level rather than
// macro-level, so it lives here rather than in that per-macro data module.
const GOAL_INSIGHT: Record<Goal, string> = {
  lose_weight: 'A gentle calorie deficit tailored to your activity level. Designed for steady, sustainable progress — no starving, no food guilt.',
  gain_weight: 'A gentle calorie surplus tailored to your activity level, giving your body the extra energy it needs to gain weight steadily.',
  build_muscle: 'A modest calorie surplus with extra protein, giving your body what it needs to build muscle without excess fat gain.',
  maintain: 'Your calories are set to match your activity level — no deficit, no surplus, just steady fuel for where you are today.',
};

/**
 * The "Targets Dashboard" (v1.1 Stitch redesign of the old flat Results
 * screen) — a mascot greeting, a big circular calorie dial, per-macro
 * cards with mini progress rings, a plain-language "why this works"
 * banner, and a recalibrate CTA. Full macro targets (tappable for a
 * plain-language explanation, see `MacroDetailScreen`) with animated
 * count-up numbers (PRD §11.3). The old locked micronutrient list has
 * moved to its own `Micros` tab (`MicronutrientExplorerScreen`) rather
 * than living here too, matching the mockups' one-concern-per-screen
 * structure. Also shows the "has anything changed?" 30-day nudge
 * (PRD §8.1) once the saved profile is old enough and hasn't already
 * been dismissed for this exact version of it — see `useChangeNudge`.
 */
export function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  // Called unconditionally (before the `!profile` guard below) since hooks
  // can't be called conditionally — `useChangeNudge` is null-safe.
  const { visible: showChangeNudge, dismiss: dismissChangeNudge } = useChangeNudge(profile);
  // Only true right after `QuickAssessmentScreen.handleFinish` completes
  // first-time onboarding — never on a routine app open, and not on a
  // profile *edit* either (that path navigates straight to this tab
  // without the param) — see `MainTabParamList.Targets`.
  const [showCelebration, setShowCelebration] = useState(!!params?.justCompleted);

  if (!profile) {
    // Shouldn't normally happen — RootNavigator only routes here once a
    // profile exists — but guards against a race rather than crashing.
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const targets = calculateNutrientTargets(profile);
  const activeOffset = Math.max(0, Math.round(targets.tdee - targets.bmr));

  // Jumps to the `Assess` tab — the single-screen Quick Assessment,
  // reused for editing (PRD §8.1 — "the profile should be editable at any
  // time"). It reads directly from `useProfile()` itself, so there's
  // nothing to hydrate/pass here, unlike the old multi-step wizard.
  const handleEditProfile = () => navigation.navigate('Assess');

  const handleOpenSettings = () => navigation.navigate('Settings');

  // PRD §8.4: "Tapping an unlocked macro nutrient opens a plain-language
  // explanation of what it does and why the user's specific number is
  // what it is." Passes the already-calculated grams/percent through so
  // the modal never has to recompute (and can't drift from) this screen.
  const handleMacroPress = (macro: MacroKey, grams: number, percent: number) => {
    navigation.navigate('MacroDetail', { macro, grams, percent, goal: profile.goal });
  };

  return (
    <View style={styles.root}>
      <GearButton onPress={handleOpenSettings} topInset={insets.top} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
          <Mascot size={64} />
          <View style={[styles.heroBadge, { backgroundColor: theme.accentFixed }]}>
            <View style={[styles.heroBadgeDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.heroBadgeText, { color: theme.onAccentFixed }]}>Your Daily Calibration</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Here are your numbers ✨</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Science-backed and custom-tuned to you.
          </Text>
        </View>

        <View style={[styles.dialCard, { backgroundColor: theme.surface }]}>
          <View style={styles.dialCardHeader}>
            <MaterialIcons name="verified" size={18} color={theme.textSecondary} />
            <Text style={[styles.dialCardHeaderText, { color: theme.textSecondary }]}>The North Star Target</Text>
          </View>
          <View style={styles.dialWrapper}>
            <CircularProgress
              size={224}
              strokeWidth={16}
              // Decorative framing only, not a literal "% complete" claim —
              // this app doesn't log food/consumption in v1, so there's no
              // real daily-progress metric to represent here.
              progress={82}
              trackColor={theme.surfaceContainerLow}
              gradientStops={[
                { offset: '0%', color: palette.primaryContainer },
                { offset: '50%', color: palette.primaryDark },
                { offset: '100%', color: palette.primaryFixed },
              ]}
            >
              <View style={styles.dialCenter}>
                <View style={[styles.dialInnerCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.dialInnerLabel, { color: theme.textSecondary }]}>Daily Energy</Text>
                  <AnimatedNumber value={targets.calorieTarget} style={[styles.dialValue, { color: theme.accent }]} />
                  <Text style={[styles.dialUnitLabel, { color: theme.textPrimary }]}>kcal target</Text>
                </View>
              </View>
            </CircularProgress>
          </View>
          <View style={[styles.statusPill, { backgroundColor: theme.surfaceContainerLow }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.statusPillText, { color: theme.textPrimary }]}>{GOAL_DESCRIPTOR[profile.goal]}</Text>
          </View>
          <View style={[styles.quickStatsRow, { backgroundColor: theme.surfaceContainerLow }]}>
            <StatChip theme={theme} icon="local-fire-department" label="Base Burn (BMR)" value={`${Math.round(targets.bmr).toLocaleString()} kcal`} />
            <StatChip theme={theme} icon="directions-walk" label="Active Offset" value={`+${activeOffset.toLocaleString()} kcal`} />
          </View>
        </View>

        <View style={styles.macroSection}>
          <View style={styles.macroSectionHeader}>
            <Text style={[styles.macroSectionTitle, { color: theme.textPrimary }]}>Macro Harmony</Text>
            <Text style={[styles.macroSectionSubtitle, { color: theme.textSecondary }]}>Gram targets &amp; purpose</Text>
          </View>
          <FadeInView delay={0}>
            <MacroCard
              macro="protein"
              label="Protein"
              description="Muscle retention & high satiety"
              grams={targets.macros.protein.grams}
              percent={targets.macros.protein.percentOfCalories}
              accentColor={theme.tertiary}
              tintColor={theme.tertiaryFixed}
              onTintColor={theme.onTertiaryFixed}
              onPress={() => handleMacroPress('protein', targets.macros.protein.grams, targets.macros.protein.percentOfCalories)}
            />
          </FadeInView>
          <FadeInView delay={100}>
            <MacroCard
              macro="carbs"
              label="Carbohydrates"
              description="Sustained energy & clean fuel"
              grams={targets.macros.carbs.grams}
              percent={targets.macros.carbs.percentOfCalories}
              accentColor={theme.secondary}
              tintColor={theme.secondaryFixed}
              onTintColor={theme.onSecondaryFixed}
              onPress={() => handleMacroPress('carbs', targets.macros.carbs.grams, targets.macros.carbs.percentOfCalories)}
            />
          </FadeInView>
          <FadeInView delay={200}>
            <MacroCard
              macro="fat"
              label="Healthy Fats"
              description="Hormone health & vital nutrients"
              grams={targets.macros.fat.grams}
              percent={targets.macros.fat.percentOfCalories}
              accentColor={theme.accent}
              tintColor={theme.accentFixed}
              onTintColor={theme.onAccentFixed}
              onPress={() => handleMacroPress('fat', targets.macros.fat.grams, targets.macros.fat.percentOfCalories)}
            />
          </FadeInView>
        </View>

        {showChangeNudge && <ChangeNudgeCard onUpdate={handleEditProfile} onDismiss={dismissChangeNudge} />}

        <View style={[styles.insightCard, { backgroundColor: theme.surfaceContainerLow }]}>
          <View style={[styles.insightIconBadge, { backgroundColor: theme.accentContainer }]}>
            <MaterialIcons name="lightbulb" size={20} color={theme.onAccent} />
          </View>
          <View style={styles.insightTextBlock}>
            <View style={styles.insightHeaderRow}>
              <Text style={[styles.insightHeading, { color: theme.textPrimary }]}>Why this works</Text>
              <View style={[styles.insightBadge, { backgroundColor: theme.surfaceContainerHigh }]}>
                <Text style={[styles.insightBadgeText, { color: theme.textSecondary }]}>Evidence-based</Text>
              </View>
            </View>
            <Text style={[styles.insightBody, { color: theme.textSecondary }]}>{GOAL_INSIGHT[profile.goal]}</Text>
          </View>
        </View>

        <View style={styles.ctaWrapper}>
          <PrimaryButton label="Recalibrate My Targets" onPress={handleEditProfile} />
        </View>
      </ScrollView>
      {showCelebration && (
        <CelebrationBanner message="Here are your numbers!" onDone={() => setShowCelebration(false)} />
      )}
    </View>
  );
}

function StatChip({
  theme,
  icon,
  label,
  value,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statChip}>
      <View style={[styles.statChipIcon, { backgroundColor: theme.surface }]}>
        <MaterialIcons name={icon} size={18} color={theme.accent} />
      </View>
      <View style={styles.statChipTextBlock}>
        <Text style={[styles.statChipLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.statChipValue, { color: theme.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function MacroCard({
  macro,
  label,
  description,
  grams,
  percent,
  accentColor,
  tintColor,
  onTintColor,
  onPress,
}: {
  macro: MacroKey;
  label: string;
  description: string;
  grams: number;
  percent: number;
  accentColor: string;
  tintColor: string;
  onTintColor: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { icon } = MACRO_VISUALS[macro];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${grams} grams, ${percent}% of your calories. Tap to learn more.`}
      style={({ pressed }) => [styles.macroCard, { backgroundColor: theme.surface }, pressed && styles.macroCardPressed]}
    >
      <View style={[styles.macroIconBadge, { backgroundColor: tintColor }]}>
        <MaterialIcons name={icon} size={26} color={accentColor} />
      </View>
      <View style={styles.macroTextBlock}>
        <View style={styles.macroTopRow}>
          <AnimatedNumber value={grams} suffix="g" style={[styles.macroGrams, { color: theme.textPrimary }]} />
          <View style={[styles.macroPercentBadge, { backgroundColor: tintColor }]}>
            <Text style={[styles.macroPercentText, { color: onTintColor }]}>{percent}%</Text>
          </View>
        </View>
        <Text style={[styles.macroLabel, { color: accentColor }]}>{label}</Text>
        <Text style={[styles.macroDescription, { color: theme.textSecondary }]} numberOfLines={1}>
          {description}
        </Text>
      </View>
      <CircularProgress size={44} strokeWidth={3.5} progress={percent} trackColor={tintColor} progressColor={accentColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },

  heroCard: { borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill, marginTop: spacing.xs },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 20, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, marginTop: 2, textAlign: 'center' },

  dialCard: { borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
  dialCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginBottom: spacing.sm },
  dialCardHeaderText: { fontSize: 12, fontWeight: '700' },
  dialWrapper: { marginVertical: spacing.sm },
  dialCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dialInnerCard: {
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  dialInnerLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dialValue: { fontSize: 40, fontWeight: '900', marginTop: 2 },
  dialUnitLabel: { fontSize: 13, fontWeight: '700', marginTop: -2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.pill, marginTop: spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPillText: { fontSize: 13, fontWeight: '700' },
  quickStatsRow: { flexDirection: 'row', width: '100%', borderRadius: radii.md, padding: spacing.sm, marginTop: spacing.md, gap: spacing.sm },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statChipIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statChipTextBlock: { flex: 1, minWidth: 0 },
  statChipLabel: { fontSize: 11 },
  statChipValue: { fontSize: 14, fontWeight: '700' },

  macroSection: { gap: spacing.sm },
  macroSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 2 },
  macroSectionTitle: { fontSize: 18, fontWeight: '700' },
  macroSectionSubtitle: { fontSize: 11 },
  macroCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.lg, padding: spacing.md },
  macroCardPressed: { opacity: 0.7 },
  macroIconBadge: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  macroTextBlock: { flex: 1, minWidth: 0 },
  macroTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  macroGrams: { fontSize: 19, fontWeight: '800' },
  macroPercentBadge: { paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: radii.pill },
  macroPercentText: { fontSize: 11, fontWeight: '700' },
  macroLabel: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  macroDescription: { fontSize: 12, marginTop: 1 },

  insightCard: { flexDirection: 'row', gap: spacing.sm, borderRadius: radii.lg, padding: spacing.md },
  insightIconBadge: { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  insightTextBlock: { flex: 1, minWidth: 0 },
  insightHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  insightHeading: { fontSize: 14, fontWeight: '700' },
  insightBadge: { paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: radii.pill },
  insightBadgeText: { fontSize: 10, fontWeight: '700' },
  insightBody: { fontSize: 13, marginTop: spacing.xs, lineHeight: 18 },

  ctaWrapper: { marginTop: spacing.xs },
});
