import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { UnitToggle } from '../components/UnitToggle';
import { calculateNutrientTargets } from '../engine';
import { DEFAULT_ASSESSMENT } from '../onboarding/assessmentOptions';
import { ActivityPicker, BodyCompositionFields, GoalPicker, MetabolicForecastCard } from '../onboarding/ui/AssessmentFields';
import { MIN_SUPPORTED_AGE } from '../onboarding/validation';
import { useProfile } from '../profile/ProfileContext';
import { useAppSettings } from '../settings/AppSettingsContext';
import { Units } from '../settings/appSettings';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { ActivityLevel, Goal, Sex, UserProfile } from '../types/profile';

// A generous-but-still-realistic slider ceiling — `MAX_SUPPORTED_AGE` (120,
// see `src/onboarding/validation.ts`) is a validation ceiling, not a
// sensible single-drag slider range. `MIN_SUPPORTED_AGE` (9) is kept as
// the true floor, since the DRI data layer genuinely supports it and this
// is the only way to enter age on this screen (no text input) — AGENTS.md's
// "ages below MIN_SUPPORTED_AGE aren't seeded" note assumes 9+ is reachable.
const PRACTICAL_MAX_AGE = 100;

const SEX_OPTIONS: { value: Sex; label: string; emoji: string }[] = [
  { value: 'female', label: 'Female', emoji: '🌸' },
  { value: 'male', label: 'Male', emoji: '🌿' },
];

const DEFAULT_SEX: Sex = 'female';

/**
 * The single scrolling "Quick Assessment" screen (v1.1 Stitch redesign) —
 * pills/sliders and a live-calculating preview strip. Serves two roles
 * depending on where it's mounted:
 *
 *  - First-time onboarding: inside the root `Onboarding` stack, reached
 *    from `WelcomeScreen`. No profile exists yet, so every field starts
 *    from defaults.
 *  - Editing: the `Assess` tab inside `MainTabs`, reached any time a
 *    profile already exists. Every field seeds directly from `profile`.
 *
 * The live preview always calls the real `calculateNutrientTargets`
 * engine entry point (never the mockup's simplified inline formulas), so
 * it can never drift from the numbers shown on the Targets dashboard.
 */
export function QuickAssessmentScreen() {
  // Deliberately loosely typed: this component mounts in two different
  // navigator contexts (see the doc comment above) with two different
  // navigation prop shapes, and only one of the two branches below is
  // ever reachable for the actual mounted instance — see `handleFinish`.
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { profile, saveProfile } = useProfile();
  const { settings, setUnits } = useAppSettings();
  const isEditing = profile !== null;

  const [unit, setUnit] = useState<Units>(settings.units);
  const [sex, setSex] = useState<Sex>(profile?.sex ?? DEFAULT_SEX);
  const [age, setAge] = useState(profile?.age ?? DEFAULT_ASSESSMENT.age);
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? DEFAULT_ASSESSMENT.heightCm);
  const [weightKg, setWeightKg] = useState(profile?.weightKg ?? DEFAULT_ASSESSMENT.weightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? DEFAULT_ASSESSMENT.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? DEFAULT_ASSESSMENT.goal);
  const [saving, setSaving] = useState(false);

  const handleUnitChange = (next: Units) => {
    setUnit(next);
    setUnits(next);
  };

  const preview = useMemo(
    () =>
      calculateNutrientTargets({
        sex,
        age,
        heightCm,
        weightKg,
        activityLevel,
        goal,
        updatedAt: '',
      }),
    [sex, age, heightCm, weightKg, activityLevel, goal],
  );

  const handleFinish = async () => {
    setSaving(true);
    const nextProfile: UserProfile = {
      sex,
      age: Math.round(age),
      heightCm: Math.round(heightCm),
      weightKg: Math.round(weightKg * 10) / 10,
      activityLevel,
      goal,
      updatedAt: new Date().toISOString(),
    };
    await saveProfile(nextProfile);
    if (isEditing) {
      // Already inside `MainTabs` — `Targets` is a sibling tab.
      navigation.navigate('Targets');
    } else {
      // Nested inside the `Onboarding` stack — swap onboarding out for the
      // tab shell. `justCompleted` triggers the one-time celebratory
      // reveal (PRD §11.3) on the Targets tab.
      (navigation.getParent() ?? navigation).reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Targets', params: { justCompleted: true } } }],
      });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Mascot size={72} />
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Calibrate your biology.</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            No account required. Stored 100% on your device, backed by metabolic science.
          </Text>
        </View>

        <SectionCard number={1} title="Sex & Age" theme={theme}>
          <View style={styles.sexRow}>
            {SEX_OPTIONS.map((option) => (
              <SexPill
                key={option.value}
                label={option.label}
                emoji={option.emoji}
                selected={sex === option.value}
                onPress={() => setSex(option.value)}
                theme={theme}
              />
            ))}
          </View>
          <SliderRow
            theme={theme}
            label="Biological Age"
            valueText={`${Math.round(age)}`}
            unitText="yrs"
            minimumValue={MIN_SUPPORTED_AGE}
            maximumValue={PRACTICAL_MAX_AGE}
            value={age}
            onValueChange={setAge}
            leftLabel={`${MIN_SUPPORTED_AGE} yrs`}
            centerLabel="Peak Vitality"
            rightLabel={`${PRACTICAL_MAX_AGE} yrs`}
          />
        </SectionCard>

        <SectionCard
          number={2}
          title="Body Composition"
          theme={theme}
          headerRight={
            <UnitToggle<Units>
              options={[
                { value: 'metric', label: 'Metric' },
                { value: 'imperial', label: 'Imp' },
              ]}
              value={unit}
              onChange={handleUnitChange}
            />
          }
        >
          <BodyCompositionFields
            theme={theme}
            unit={unit}
            heightCm={heightCm}
            weightKg={weightKg}
            onHeightChange={setHeightCm}
            onWeightChange={setWeightKg}
          />
        </SectionCard>

        <SectionCard number={3} title="Daily Motion" theme={theme}>
          <ActivityPicker theme={theme} value={activityLevel} onChange={setActivityLevel} />
        </SectionCard>

        <SectionCard number={4} title="Target Outcome" theme={theme}>
          <GoalPicker theme={theme} value={goal} onChange={setGoal} />
        </SectionCard>

        <MetabolicForecastCard
          theme={theme}
          preview={preview}
          footer="Your personalized target calculates instantly as you adjust."
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <PrimaryButton
          label={saving ? 'Calculating…' : isEditing ? 'Save changes' : 'Calculate My Science Targets'}
          onPress={handleFinish}
          disabled={saving}
        />
      </View>
    </View>
  );
}

function SectionCard({
  number,
  title,
  theme,
  headerRight,
  children,
}: {
  number: number;
  title: string;
  theme: ThemeColors;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionBadge, { backgroundColor: theme.accentFixed }]}>
            <Text style={[styles.sectionBadgeText, { color: theme.onAccentFixed }]}>{number}</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
        </View>
        {headerRight}
      </View>
      {children}
    </View>
  );
}

function SexPill({
  label,
  emoji,
  selected,
  onPress,
  theme,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  theme: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.sexPill,
        { backgroundColor: selected ? theme.surfaceContainerLow : 'transparent' },
        selected && styles.sexPillSelected,
      ]}
    >
      <Text style={styles.sexEmoji}>{emoji}</Text>
      <Text style={[styles.sexLabel, { color: selected ? theme.accent : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function SliderRow({
  theme,
  label,
  valueText,
  unitText,
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  leftLabel,
  centerLabel,
  rightLabel,
}: {
  theme: ThemeColors;
  label: string;
  valueText: string;
  unitText: string;
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
}) {
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeaderRow}>
        <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>{label}</Text>
        <View style={[styles.sliderValuePill, { backgroundColor: theme.surfaceContainer }]}>
          <Text style={[styles.sliderValueText, { color: theme.textPrimary }]}>{valueText}</Text>
          <Text style={[styles.sliderUnitText, { color: theme.textSecondary }]}> {unitText}</Text>
        </View>
      </View>
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.border}
        thumbTintColor={theme.accent}
      />
      <View style={styles.sliderCaptionsRow}>
        <Text style={[styles.sliderCaption, { color: theme.textSecondary }]}>{leftLabel}</Text>
        <Text style={[styles.sliderCaption, { color: theme.textSecondary }]}>{centerLabel}</Text>
        <Text style={[styles.sliderCaption, { color: theme.textSecondary }]}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  hero: { alignItems: 'center', marginBottom: spacing.sm },
  heroTitle: { fontSize: 24, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, marginTop: spacing.xs, textAlign: 'center', maxWidth: 280 },

  section: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionBadgeText: { fontSize: 13, fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '700' },

  sexRow: { flexDirection: 'row', gap: spacing.sm },
  sexPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  sexPillSelected: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  sexEmoji: { fontSize: 16 },
  sexLabel: { fontSize: 14, fontWeight: '700' },

  sliderBlock: { marginTop: spacing.xs },
  sliderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  sliderLabel: { fontSize: 13, fontWeight: '600' },
  sliderValuePill: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  sliderValueText: { fontSize: 17, fontWeight: '800' },
  sliderUnitText: { fontSize: 12 },
  sliderCaptionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sliderCaption: { fontSize: 11 },

  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
