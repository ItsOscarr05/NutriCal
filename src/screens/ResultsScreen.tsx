import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NUTRIENT_INFO, NUTRIENT_KEYS } from '../data/dri';
import { MacroKey } from '../data/education/macroExplanations';
import { calculateNutrientTargets } from '../engine';
import { RootStackParamList } from '../navigation/types';
import { useOnboardingDraft } from '../onboarding/OnboardingDraftContext';
import { useProfile } from '../profile/ProfileContext';
import { radii, spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Results'>;

/**
 * v1 results dashboard (PRD §8.4). This covers the functional core — full
 * macro targets (tappable for a plain-language explanation, see
 * `MacroDetailScreen`), plus every micronutrient listed by name with a
 * lock — but not yet the animated "reveal" treatment or illustrated icons
 * from PRD §11.3 (milestone 2 visual polish), and not yet real
 * per-nutrient gating (there's no subscription/entitlement system wired up
 * yet per PRD §12/milestone 5, so every install currently sees the locked
 * view). The "has anything changed?" 30-day nudge (PRD §8.1) is still
 * follow-up work, not implemented here yet.
 */
export function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { profile } = useProfile();
  const { hydrateFromProfile } = useOnboardingDraft();

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

  /**
   * Re-enters the onboarding wizard prefilled with the current profile's
   * answers (PRD §8.1 — "the profile should be editable at any time"),
   * rather than clearing the saved profile and starting from a blank
   * Welcome screen. The saved profile isn't touched until the user
   * actually finishes the wizard again (`GoalScreen` overwrites it) —
   * backing out partway through leaves the original profile intact.
   */
  const handleEditProfile = () => {
    hydrateFromProfile(profile);
    navigation.navigate('Sex');
  };

  // PRD §8.4: "Tapping an unlocked macro nutrient opens a plain-language
  // explanation of what it does and why the user's specific number is
  // what it is." Passes the already-calculated grams/percent through so
  // the modal never has to recompute (and can't drift from) this screen.
  const handleMacroPress = (macro: MacroKey, grams: number, percent: number) => {
    navigation.navigate('MacroDetail', { macro, grams, percent, goal: profile.goal });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.calorieValue, { color: theme.textPrimary }]}>{targets.calorieTarget}</Text>
      <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>calories / day</Text>

      <View style={styles.macroRow}>
        <MacroCard
          label="Protein"
          grams={targets.macros.protein.grams}
          percent={targets.macros.protein.percentOfCalories}
          onPress={() => handleMacroPress('protein', targets.macros.protein.grams, targets.macros.protein.percentOfCalories)}
        />
        <MacroCard
          label="Carbs"
          grams={targets.macros.carbs.grams}
          percent={targets.macros.carbs.percentOfCalories}
          onPress={() => handleMacroPress('carbs', targets.macros.carbs.grams, targets.macros.carbs.percentOfCalories)}
        />
        <MacroCard
          label="Fat"
          grams={targets.macros.fat.grams}
          percent={targets.macros.fat.percentOfCalories}
          onPress={() => handleMacroPress('fat', targets.macros.fat.grams, targets.macros.fat.percentOfCalories)}
        />
      </View>

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
  );
}

function MacroCard({
  label,
  grams,
  percent,
  onPress,
}: {
  label: string;
  grams: number;
  percent: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${grams} grams, ${percent}% of your calories. Tap to learn more.`}
      style={({ pressed }) => [styles.macroCard, { backgroundColor: theme.surface }, pressed && styles.macroCardPressed]}
    >
      <Text style={[styles.macroGrams, { color: theme.textPrimary }]}>{grams}g</Text>
      <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.macroPercent, { color: theme.textSecondary }]}>{percent}%</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, alignItems: 'center' },
  calorieValue: { fontSize: 56, fontWeight: '800', marginTop: spacing.lg },
  calorieLabel: { fontSize: 15, marginBottom: spacing.lg },
  macroRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  macroCard: { flex: 1, borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  macroCardPressed: { opacity: 0.7 },
  macroGrams: { fontSize: 20, fontWeight: '700' },
  macroLabel: { fontSize: 13, marginTop: 2 },
  macroPercent: { fontSize: 12, marginTop: 2 },
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
