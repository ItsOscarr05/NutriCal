import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { UnitToggle } from '../components/UnitToggle';
import { calculateNutrientTargets } from '../engine';
import { cmToFeetInches, kgToLb } from '../onboarding/unitConversion';
import { MAX_HEIGHT_CM, MAX_WEIGHT_KG, MIN_HEIGHT_CM, MIN_SUPPORTED_AGE, MIN_WEIGHT_KG } from '../onboarding/validation';
import { useProfile } from '../profile/ProfileContext';
import { useAppSettings } from '../settings/AppSettingsContext';
import { Units } from '../settings/appSettings';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { ActivityLevel, Goal, Sex, UserProfile } from '../types/profile';

// A generous-but-still-realistic slider ceiling — `MAX_SUPPORTED_AGE` (120,
// see `src/onboarding/validation.ts`) is a validation ceiling, not a
// sensible single-drag slider range. `MIN_SUPPORTED_AGE` (9) is kept as
// the true floor, since the DRI data layer genuinely supports it and this
// is now the *only* way to enter age (no more text input) — AGENTS.md's
// "ages below MIN_SUPPORTED_AGE aren't seeded" note assumes 9+ is reachable.
const PRACTICAL_MAX_AGE = 100;

const SEX_OPTIONS: { value: Sex; label: string; emoji: string }[] = [
  { value: 'female', label: 'Female', emoji: '🌸' },
  { value: 'male', label: 'Male', emoji: '🌿' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string; emoji: string }[] = [
  { value: 'sedentary', label: 'Desk Bound', description: '< 4,000 steps/day', emoji: '🛋️' },
  { value: 'lightly_active', label: 'Light Active', description: 'Daily walks & chores', emoji: '🚶' },
  { value: 'moderately_active', label: 'Active', description: 'Workouts 3-5x/wk', emoji: '🏃' },
  { value: 'very_active', label: 'Very Active', description: 'Hard training, 6-7x/wk', emoji: '⚡' },
  // A 5th tier beyond the Stitch mockup's 4 cards — kept so this screen
  // doesn't regress the engine's existing `extremely_active` coverage.
  { value: 'extremely_active', label: 'Athlete', description: 'Elite training / physical job', emoji: '🔥' },
];

// The Stitch mockup only offered 3 goal pills with flat kcal deltas
// (-400/+250/0) and no "gain_weight" option. Mapped onto the engine's real
// 4-goal, %-based `GOAL_ADJUSTMENT_FACTOR` (`src/engine/bmr.ts`) instead —
// see AGENTS.md's "calculation engine must stay pure" rule.
const GOAL_OPTIONS: { value: Goal; label: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; badge?: string }[] = [
  { value: 'lose_weight', label: 'Fat Loss & Vital Energy', description: 'A gentle, sustainable deficit', icon: 'local-fire-department', badge: 'Popular' },
  { value: 'build_muscle', label: 'Lean Hypertrophy', description: 'Higher protein + a modest surplus', icon: 'fitness-center' },
  { value: 'maintain', label: 'Longevity & Maintenance', description: 'Nutrient density, no calorie change', icon: 'self-improvement' },
  { value: 'gain_weight', label: 'Healthy Weight Gain', description: 'A gradual, steady calorie surplus', icon: 'trending-up' },
];

const DEFAULT_DRAFT = {
  sex: 'female' as Sex,
  age: 28,
  heightCm: 173,
  weightKg: 70,
  activityLevel: 'lightly_active' as ActivityLevel,
  goal: 'lose_weight' as Goal,
};

/**
 * The single scrolling "Quick Assessment" screen (v1.1 Stitch redesign) —
 * replaces the old 6-step onboarding wizard (Sex -> Age -> Height ->
 * Weight -> Activity -> Goal screens, all deleted) with one screen of
 * pills/sliders and a live-calculating preview strip, per an explicit
 * user decision. Serves two roles depending on where it's mounted:
 *
 *  - First-time onboarding: the root stack's `QuickAssessment` route,
 *    reached from `WelcomeScreen`. No profile exists yet, so every field
 *    starts from `DEFAULT_DRAFT`.
 *  - Editing: the `Assess` tab inside `MainTabs`, reached any time a
 *    profile already exists. Every field seeds directly from `profile` —
 *    there's no more separate draft context to hydrate (the old
 *    `OnboardingDraftContext` is gone with the wizard it existed for).
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
  const [sex, setSex] = useState<Sex>(profile?.sex ?? DEFAULT_DRAFT.sex);
  const [age, setAge] = useState(profile?.age ?? DEFAULT_DRAFT.age);
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? DEFAULT_DRAFT.heightCm);
  const [weightKg, setWeightKg] = useState(profile?.weightKg ?? DEFAULT_DRAFT.weightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? DEFAULT_DRAFT.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? DEFAULT_DRAFT.goal);
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

  // BMI is a well-known, standard, universally-defined formula (unlike
  // calorie/macro targets) — shown here as light contextual info only,
  // not a computed "target," so it lives in this screen rather than
  // `src/engine`.
  const bmi = weightKg / (heightCm / 100) ** 2;
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  const heightText = unit === 'imperial' ? formatFeetInches(heightCm) : `${Math.round(heightCm)}`;
  const heightUnitText = unit === 'imperial' ? '' : 'cm';
  const weightText = unit === 'imperial' ? String(Math.round(kgToLb(weightKg))) : String(Math.round(weightKg));
  const weightUnitText = unit === 'imperial' ? 'lb' : 'kg';

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
      // Mounted directly on the root stack (no profile existed yet) —
      // swap onboarding out for the tab shell. `justCompleted` triggers
      // the one-time celebratory reveal (PRD §11.3) on the Targets tab.
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
          <View style={styles.bodyRow}>
            <BodyStatCard
              theme={theme}
              icon="height"
              label="Height"
              valueText={heightText}
              unitText={heightUnitText}
              accentColor={theme.accent}
              tintColor={theme.accentFixed}
              minimumValue={MIN_HEIGHT_CM}
              maximumValue={MAX_HEIGHT_CM}
              value={heightCm}
              onValueChange={setHeightCm}
            />
            <BodyStatCard
              theme={theme}
              icon="scale"
              label="Weight"
              valueText={weightText}
              unitText={weightUnitText}
              accentColor={theme.secondary}
              tintColor={theme.secondaryFixed}
              minimumValue={MIN_WEIGHT_KG}
              maximumValue={MAX_WEIGHT_KG}
              value={weightKg}
              onValueChange={setWeightKg}
            />
          </View>
          <View style={[styles.bmiPill, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.bmiText, { color: theme.accent }]}>
              BMI {bmi.toFixed(1)} • {bmiLabel}
            </Text>
          </View>
        </SectionCard>

        <SectionCard number={3} title="Daily Motion" theme={theme}>
          <View style={styles.activityGrid}>
            {ACTIVITY_OPTIONS.map((option) => (
              <ActivityCard
                key={option.value}
                theme={theme}
                emoji={option.emoji}
                label={option.label}
                description={option.description}
                selected={activityLevel === option.value}
                onPress={() => setActivityLevel(option.value)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard number={4} title="Target Outcome" theme={theme}>
          <View style={styles.goalList}>
            {GOAL_OPTIONS.map((option) => (
              <GoalPill
                key={option.value}
                theme={theme}
                icon={option.icon}
                label={option.label}
                description={option.description}
                badge={option.badge}
                selected={goal === option.value}
                onPress={() => setGoal(option.value)}
              />
            ))}
          </View>
        </SectionCard>

        <View style={[styles.previewCard, { backgroundColor: theme.surfaceContainer }]}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.previewHeading, { color: theme.textSecondary }]}>Metabolic Forecast</Text>
          </View>
          <View style={styles.previewRow}>
            <PreviewStat theme={theme} label="Daily Energy" value={preview.calorieTarget} unit="kcal" color={theme.accent} />
            <PreviewStat theme={theme} label="Protein" value={preview.macros.protein.grams} unit="g" color={theme.tertiary} />
            <PreviewStat theme={theme} label="Base Burn" value={preview.bmr} unit="kcal" color={theme.secondary} />
          </View>
          <Text style={[styles.previewFooter, { color: theme.textSecondary }]}>
            Your personalized target calculates instantly as you adjust.
          </Text>
        </View>
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

function formatFeetInches(heightCm: number): string {
  const { feet, inches } = cmToFeetInches(heightCm);
  return `${feet}'${inches}"`;
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

function BodyStatCard({
  theme,
  icon,
  label,
  valueText,
  unitText,
  accentColor,
  tintColor,
  minimumValue,
  maximumValue,
  value,
  onValueChange,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  valueText: string;
  unitText: string;
  accentColor: string;
  tintColor: string;
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <View style={[styles.bodyCard, { backgroundColor: theme.surfaceContainerLow }]}>
      <MaterialIcons name={icon} size={26} color={accentColor} />
      <Text style={[styles.bodyCardLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.bodyCardValueRow}>
        <Text style={[styles.bodyCardValue, { color: theme.textPrimary }]}>{valueText}</Text>
        {unitText ? <Text style={[styles.bodyCardUnit, { color: theme.textSecondary }]}>{unitText}</Text> : null}
      </View>
      <Slider
        style={styles.bodyCardSlider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={accentColor}
        maximumTrackTintColor={tintColor}
        thumbTintColor={accentColor}
      />
    </View>
  );
}

function ActivityCard({
  theme,
  emoji,
  label,
  description,
  selected,
  onPress,
}: {
  theme: ThemeColors;
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.activityCard,
        { backgroundColor: selected ? theme.accentFixed : theme.surfaceContainerLow },
      ]}
    >
      <View style={styles.activityCardHeader}>
        <View style={[styles.activityEmojiBadge, { backgroundColor: theme.surface }]}>
          <Text style={styles.activityEmoji}>{emoji}</Text>
        </View>
        {selected ? <MaterialIcons name="check-circle" size={20} color={theme.onAccentFixed} /> : null}
      </View>
      <Text style={[styles.activityLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

function GoalPill({
  theme,
  icon,
  label,
  description,
  badge,
  selected,
  onPress,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.goalPill, { backgroundColor: selected ? theme.accentFixed : theme.surfaceContainerLow }]}
    >
      <View style={styles.goalPillLeft}>
        <View style={[styles.goalIconBadge, { backgroundColor: theme.surface }]}>
          <MaterialIcons name={icon} size={22} color={theme.accent} />
        </View>
        <View style={styles.goalTextBlock}>
          <View style={styles.goalLabelRow}>
            <Text style={[styles.goalLabel, { color: theme.textPrimary }]}>{label}</Text>
            {badge ? (
              <View style={[styles.goalBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.goalBadgeText, { color: theme.onAccent }]}>{badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.goalDescription, { color: theme.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <View
        style={[
          styles.goalRadio,
          { backgroundColor: selected ? theme.accent : theme.surfaceContainerHigh },
        ]}
      >
        {selected ? <MaterialIcons name="check" size={14} color={theme.onAccent} /> : null}
      </View>
    </Pressable>
  );
}

function PreviewStat({
  theme,
  label,
  value,
  unit,
  color,
}: {
  theme: ThemeColors;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={[styles.previewStat, { backgroundColor: theme.surface }]}>
      <Text style={[styles.previewStatLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.previewStatValueRow}>
        <Text style={[styles.previewStatValue, { color }]}>{value.toLocaleString()}</Text>
        <Text style={[styles.previewStatUnit, { color: theme.textSecondary }]}> {unit}</Text>
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

  bodyRow: { flexDirection: 'row', gap: spacing.sm },
  bodyCard: { flex: 1, borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  bodyCardLabel: { fontSize: 13, marginTop: spacing.xs },
  bodyCardValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  bodyCardValue: { fontSize: 22, fontWeight: '800' },
  bodyCardUnit: { fontSize: 12, marginLeft: 2 },
  bodyCardSlider: { width: '100%', marginTop: spacing.sm },
  bmiPill: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.pill },
  bmiText: { fontSize: 13, fontWeight: '700' },

  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  activityCard: { width: '47%', borderRadius: radii.md, padding: spacing.sm },
  activityCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityEmojiBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityEmoji: { fontSize: 18 },
  activityLabel: { fontSize: 14, fontWeight: '700', marginTop: spacing.sm },
  activityDescription: { fontSize: 12, marginTop: 2 },

  goalList: { gap: spacing.sm },
  goalPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.md, padding: spacing.sm },
  goalPillLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
  goalIconBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  goalTextBlock: { flex: 1, minWidth: 0 },
  goalLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  goalLabel: { fontSize: 14, fontWeight: '700' },
  goalBadge: { paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: radii.pill },
  goalBadgeText: { fontSize: 10, fontWeight: '800' },
  goalDescription: { fontSize: 12, marginTop: 1 },
  goalRadio: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  previewCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  previewHeading: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  previewRow: { flexDirection: 'row', gap: spacing.xs },
  previewStat: { flex: 1, borderRadius: radii.sm, padding: spacing.xs, alignItems: 'center' },
  previewStatLabel: { fontSize: 10 },
  previewStatValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  previewStatValue: { fontSize: 15, fontWeight: '800' },
  previewStatUnit: { fontSize: 10 },
  previewFooter: { fontSize: 12, textAlign: 'center' },

  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
