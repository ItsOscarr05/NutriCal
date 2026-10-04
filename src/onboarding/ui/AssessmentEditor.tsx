import Slider from '@react-native-community/slider';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { UnitToggle } from '../../components/UnitToggle';
import { calculateNutrientTargets } from '../../engine';
import { useProfile } from '../../profile/ProfileContext';
import { useAppSettings } from '../../settings/AppSettingsContext';
import { Units } from '../../settings/appSettings';
import { radii, spacing, ThemeColors, useTheme } from '../../theme';
import { ActivityLevel, BodyFatCategory, Goal, Sex, UserProfile } from '../../types/profile';
import { DEFAULT_ASSESSMENT } from '../assessmentOptions';
import { MIN_SUPPORTED_AGE } from '../validation';
import { ActivityPicker, BodyCompositionFields, GoalPicker, MetabolicForecastCard } from './AssessmentFields';
import { BodyFatPicker } from './BodyFatPicker';

const PRACTICAL_MAX_AGE = 100;

const SEX_OPTIONS: { value: Sex; label: string; emoji: string }[] = [
  { value: 'female', label: 'Female', emoji: '🌸' },
  { value: 'male', label: 'Male', emoji: '🌿' },
];

const DEFAULT_SEX: Sex = 'female';

/**
 * Scrollable recalibration form (live `calculateNutrientTargets` preview +
 * save). Used only from the Profile tab — first-time onboarding is the
 * paged `OnboardingStack`. `header` is rendered at the top of the same
 * ScrollView so Profile's stats summary and this form never nest scrolls.
 */
export function AssessmentEditor({ header, onSaved }: { header?: ReactNode; onSaved: () => void }) {
  const theme = useTheme();
  const { profile, saveProfile } = useProfile();
  const { settings, setUnits } = useAppSettings();

  const [unit, setUnit] = useState<Units>(settings.units);
  const [sex, setSex] = useState<Sex>(profile?.sex ?? DEFAULT_SEX);
  const [age, setAge] = useState(profile?.age ?? DEFAULT_ASSESSMENT.age);
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? DEFAULT_ASSESSMENT.heightCm);
  const [weightKg, setWeightKg] = useState(profile?.weightKg ?? DEFAULT_ASSESSMENT.weightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? DEFAULT_ASSESSMENT.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? DEFAULT_ASSESSMENT.goal);
  const [bodyFat, setBodyFat] = useState<BodyFatCategory | undefined>(profile?.bodyFat);
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
        bodyFat,
        updatedAt: '',
      }),
    [sex, age, heightCm, weightKg, activityLevel, goal, bodyFat],
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
      ...(bodyFat ? { bodyFat } : {}),
      updatedAt: new Date().toISOString(),
    };
    await saveProfile(nextProfile);
    setSaving(false);
    onSaved();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {header}
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

        <SectionCard number={3} title="Body Fat Estimate" theme={theme}>
          <BodyFatPicker theme={theme} sex={sex} value={bodyFat} onChange={setBodyFat} />
        </SectionCard>

        <SectionCard number={4} title="Daily Motion" theme={theme}>
          <ActivityPicker theme={theme} value={activityLevel} onChange={setActivityLevel} />
        </SectionCard>

        <SectionCard number={5} title="Target Outcome" theme={theme}>
          <GoalPicker theme={theme} value={goal} onChange={setGoal} />
        </SectionCard>

        <MetabolicForecastCard
          theme={theme}
          preview={preview}
          footer="Your personalized target calculates instantly as you adjust."
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <PrimaryButton label={saving ? 'Calculating…' : 'Save changes'} onPress={handleFinish} disabled={saving} />
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
