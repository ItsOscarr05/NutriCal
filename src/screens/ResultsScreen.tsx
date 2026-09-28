import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedFillBar } from '../components/AnimatedFillBar';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CelebrationBanner } from '../components/CelebrationBanner';
import { ChangeNudgeCard } from '../components/ChangeNudgeCard';
import { FadeInView } from '../components/FadeInView';
import { GearButton } from '../components/GearButton';
import { NUTRIENT_INFO, NUTRIENT_KEYS } from '../data/dri';
import { MacroKey } from '../data/education/macroExplanations';
import { calculateNutrientTargets } from '../engine';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { useChangeNudge } from '../profile/useChangeNudge';
import { useEditProfileNavigation } from '../profile/useEditProfileNavigation';
import { radii, spacing, useTheme } from '../theme';

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
 * Illustrated, rounded macro icons (PRD §11.3 — "friendly, rounded,
 * illustrated icon, not a literal medical/molecular icon") plus a matching
 * accent color per macro, reused for that macro's progress-fill bar so the
 * icon badge and bar read as one visual language. Micronutrient icons are
 * deferred until the micronutrient section has real (unlocked) UI to put
 * them in — right now it's just a name + lock, see the section below.
 */
const MACRO_VISUALS: Record<MacroKey, { icon: ImageSourcePropType; accentColor: string }> = {
  protein: { icon: require('../../assets/illustrations/macro-protein.png'), accentColor: '#2ECC71' },
  carbs: { icon: require('../../assets/illustrations/macro-carbs.png'), accentColor: '#F2B705' },
  fat: { icon: require('../../assets/illustrations/macro-fat.png'), accentColor: '#5BC8D6' },
};

/**
 * v1 results dashboard (PRD §8.4). Full macro targets (tappable for a
 * plain-language explanation, see `MacroDetailScreen`) with illustrated
 * icons, animated count-up numbers, and fill-in progress bars (PRD §11.3),
 * plus every micronutrient listed by name with a lock — but not yet real
 * per-nutrient gating (there's no subscription/entitlement system wired up
 * yet per PRD §12/milestone 5, so every install currently sees the locked
 * view). Also shows the "has anything changed?" 30-day nudge (PRD §8.1)
 * once the saved profile is old enough and hasn't already been dismissed
 * for this exact version of it — see `useChangeNudge`.
 */
export function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const editProfile = useEditProfileNavigation();
  // Called unconditionally (before the `!profile` guard below) since hooks
  // can't be called conditionally — `useChangeNudge` is null-safe.
  const { visible: showChangeNudge, dismiss: dismissChangeNudge } = useChangeNudge(profile);
  // Only true right after GoalScreen finishes the wizard (first time or via
  // edit) — never on a routine app open — see RootStackParamList.Results.
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

  // Re-enters the onboarding wizard prefilled with the current profile's
  // answers (PRD §8.1 — "the profile should be editable at any time") — see
  // `useEditProfileNavigation` for the shared implementation (also used by
  // `SettingsScreen`'s "Edit profile" row).
  const handleEditProfile = () => editProfile(profile);

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
        <AnimatedNumber value={targets.calorieTarget} style={[styles.calorieValue, { color: theme.textPrimary }]} />
        <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>calories / day</Text>

        <View style={styles.macroRow}>
          <FadeInView delay={0} style={styles.macroCardWrapper}>
            <MacroCard
              macro="protein"
              label="Protein"
              grams={targets.macros.protein.grams}
              percent={targets.macros.protein.percentOfCalories}
              onPress={() => handleMacroPress('protein', targets.macros.protein.grams, targets.macros.protein.percentOfCalories)}
            />
          </FadeInView>
          <FadeInView delay={100} style={styles.macroCardWrapper}>
            <MacroCard
              macro="carbs"
              label="Carbs"
              grams={targets.macros.carbs.grams}
              percent={targets.macros.carbs.percentOfCalories}
              onPress={() => handleMacroPress('carbs', targets.macros.carbs.grams, targets.macros.carbs.percentOfCalories)}
            />
          </FadeInView>
          <FadeInView delay={200} style={styles.macroCardWrapper}>
            <MacroCard
              macro="fat"
              label="Fat"
              grams={targets.macros.fat.grams}
              percent={targets.macros.fat.percentOfCalories}
              onPress={() => handleMacroPress('fat', targets.macros.fat.grams, targets.macros.fat.percentOfCalories)}
            />
          </FadeInView>
        </View>

        {showChangeNudge && <ChangeNudgeCard onUpdate={handleEditProfile} onDismiss={dismissChangeNudge} />}

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Vitamins & minerals</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Unlock your personalized targets for every vitamin and mineral with NutriCal Premium.
        </Text>
        <View style={[styles.microCard, { backgroundColor: theme.surface }]}>
          {NUTRIENT_KEYS.map((key) => (
            <View key={key} style={[styles.microRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.microLabel, { color: theme.textPrimary }]}>{NUTRIENT_INFO[key].displayName}</Text>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          ))}
        </View>

        <Text onPress={handleEditProfile} style={[styles.editLink, { color: theme.accentDeep }]}>
          Edit profile
        </Text>
      </ScrollView>
      {showCelebration && (
        <CelebrationBanner message="Here are your numbers!" onDone={() => setShowCelebration(false)} />
      )}
    </View>
  );
}

function MacroCard({
  macro,
  label,
  grams,
  percent,
  onPress,
}: {
  macro: MacroKey;
  label: string;
  grams: number;
  percent: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { icon, accentColor } = MACRO_VISUALS[macro];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${grams} grams, ${percent}% of your calories. Tap to learn more.`}
      style={({ pressed }) => [styles.macroCard, { backgroundColor: theme.surface }, pressed && styles.macroCardPressed]}
    >
      <Image source={icon} style={styles.macroIcon} resizeMode="contain" accessibilityIgnoresInvertColors />
      <AnimatedNumber value={grams} suffix="g" style={[styles.macroGrams, { color: theme.textPrimary }]} />
      <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.macroPercent, { color: theme.textSecondary }]}>{percent}%</Text>
      <AnimatedFillBar percent={percent} fillColor={accentColor} trackColor={theme.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, alignItems: 'center' },
  calorieValue: { fontSize: 56, fontWeight: '800', marginTop: spacing.lg },
  calorieLabel: { fontSize: 15, marginBottom: spacing.lg },
  macroRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  macroCardWrapper: { flex: 1 },
  macroCard: { flex: 1, borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  macroCardPressed: { opacity: 0.7 },
  macroIcon: { width: 40, height: 40, marginBottom: spacing.xs },
  macroGrams: { fontSize: 20, fontWeight: '700' },
  macroLabel: { fontSize: 13, marginTop: 2 },
  macroPercent: { fontSize: 12, marginTop: 2, marginBottom: spacing.xs },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: spacing.xl, alignSelf: 'flex-start' },
  sectionSubtitle: { fontSize: 13, marginTop: spacing.xs, marginBottom: spacing.md, alignSelf: 'flex-start' },
  microCard: { width: '100%', borderRadius: radii.md, padding: spacing.md },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  microLabel: { fontSize: 15 },
  lockIcon: { fontSize: 15 },
  editLink: { marginTop: spacing.xl, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
