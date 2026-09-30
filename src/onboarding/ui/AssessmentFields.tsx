import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NutrientTargets } from '../../engine';
import { Units } from '../../settings/appSettings';
import { radii, spacing, ThemeColors } from '../../theme';
import { ActivityLevel, Goal } from '../../types/profile';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../assessmentOptions';
import { cmToFeetInches, kgToLb } from '../unitConversion';
import { MAX_HEIGHT_CM, MAX_WEIGHT_KG, MIN_HEIGHT_CM, MIN_WEIGHT_KG } from '../validation';

/**
 * Assessment inputs shared by the `Assess` tab and the paged first-time
 * onboarding, so the two never drift. Values are always metric; imperial
 * is display-only here.
 */

export function BodyCompositionFields({
  theme,
  unit,
  heightCm,
  weightKg,
  onHeightChange,
  onWeightChange,
}: {
  theme: ThemeColors;
  unit: Units;
  heightCm: number;
  weightKg: number;
  onHeightChange: (heightCm: number) => void;
  onWeightChange: (weightKg: number) => void;
}) {
  // BMI is a well-known, standard, universally-defined formula (unlike
  // calorie/macro targets) — shown here as light contextual info only,
  // not a computed "target," so it lives in the UI rather than
  // `src/engine`.
  const bmi = weightKg / (heightCm / 100) ** 2;
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  const heightText = unit === 'imperial' ? formatFeetInches(heightCm) : `${Math.round(heightCm)}`;
  const heightUnitText = unit === 'imperial' ? '' : 'cm';
  const weightText = unit === 'imperial' ? String(Math.round(kgToLb(weightKg))) : String(Math.round(weightKg));
  const weightUnitText = unit === 'imperial' ? 'lb' : 'kg';

  return (
    <View style={styles.bodyBlock}>
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
          onValueChange={onHeightChange}
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
          onValueChange={onWeightChange}
        />
      </View>
      <View style={[styles.bmiPill, { backgroundColor: theme.surfaceContainer }]}>
        <Text style={[styles.bmiText, { color: theme.accent }]}>
          BMI {bmi.toFixed(1)} • {bmiLabel}
        </Text>
      </View>
    </View>
  );
}

export function ActivityPicker({
  theme,
  value,
  onChange,
}: {
  theme: ThemeColors;
  value: ActivityLevel;
  onChange: (value: ActivityLevel) => void;
}) {
  return (
    <View style={styles.activityGrid} accessibilityRole="radiogroup">
      {ACTIVITY_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.activityCard, { backgroundColor: selected ? theme.accentFixed : theme.surfaceContainerLow }]}
          >
            <View style={styles.activityCardHeader}>
              <View style={[styles.activityEmojiBadge, { backgroundColor: theme.surface }]}>
                <Text style={styles.activityEmoji}>{option.emoji}</Text>
              </View>
              {selected ? <MaterialIcons name="check-circle" size={20} color={theme.onAccentFixed} /> : null}
            </View>
            <Text style={[styles.activityLabel, { color: theme.textPrimary }]}>{option.label}</Text>
            <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function GoalPicker({
  theme,
  value,
  onChange,
}: {
  theme: ThemeColors;
  value: Goal;
  onChange: (value: Goal) => void;
}) {
  return (
    <View style={styles.goalList} accessibilityRole="radiogroup">
      {GOAL_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.goalPill, { backgroundColor: selected ? theme.accentFixed : theme.surfaceContainerLow }]}
          >
            <View style={styles.goalPillLeft}>
              <View style={[styles.goalIconBadge, { backgroundColor: theme.surface }]}>
                <MaterialIcons name={option.icon} size={22} color={theme.accent} />
              </View>
              <View style={styles.goalTextBlock}>
                <View style={styles.goalLabelRow}>
                  <Text style={[styles.goalLabel, { color: theme.textPrimary }]}>{option.label}</Text>
                  {option.badge ? (
                    <View style={[styles.goalBadge, { backgroundColor: theme.accent }]}>
                      <Text style={[styles.goalBadgeText, { color: theme.onAccent }]}>{option.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.goalDescription, { color: theme.textSecondary }]}>{option.description}</Text>
              </View>
            </View>
            <View style={[styles.goalRadio, { backgroundColor: selected ? theme.accent : theme.surfaceContainerHigh }]}>
              {selected ? <MaterialIcons name="check" size={14} color={theme.onAccent} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MetabolicForecastCard({
  theme,
  preview,
  footer,
}: {
  theme: ThemeColors;
  preview: NutrientTargets;
  footer: string;
}) {
  return (
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
      <Text style={[styles.previewFooter, { color: theme.textSecondary }]}>{footer}</Text>
    </View>
  );
}

function formatFeetInches(heightCm: number): string {
  const { feet, inches } = cmToFeetInches(heightCm);
  return `${feet}'${inches}"`;
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
  bodyBlock: { gap: spacing.md },
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
});
