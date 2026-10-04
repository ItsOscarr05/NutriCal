import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Units } from '../../settings/appSettings';
import { radii, spacing, ThemeColors } from '../../theme';
import { cmToFeetInches, feetInchesToCm, kgToLb } from '../unitConversion';
import { MAX_HEIGHT_CM, MAX_WEIGHT_KG, MIN_HEIGHT_CM, MIN_WEIGHT_KG } from '../validation';
import { WEIGHT_INPUT_MAX_LENGTH } from '../weightInput';
import { getBmi } from './AssessmentFields';

const range = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const CM_VALUES = range(MIN_HEIGHT_CM, MAX_HEIGHT_CM);
const FEET_VALUES = range(3, 8);
const INCH_VALUES = range(0, 11);

const WHEEL_HEIGHT = 150;

/**
 * Onboarding height (native wheel) plus weight (number pad, same pattern
 * as the Age page), as two full-width stacked cards. Height stays metric
 * internally; imperial wheels convert at the edge. Weight is typed in the
 * active unit and parsed to kg by the parent via `parseWeightInput`.
 */
export function BodyCompositionWheelFields({
  theme,
  unit,
  heightCm,
  weightText,
  weightKg,
  onHeightChange,
  onWeightTextChange,
}: {
  theme: ThemeColors;
  unit: Units;
  heightCm: number;
  weightText: string;
  /** Parsed kilograms, or `null` while the text box is empty/invalid. */
  weightKg: number | null;
  onHeightChange: (heightCm: number) => void;
  onWeightTextChange: (text: string) => void;
}) {
  const weightInputRef = useRef<TextInput>(null);
  const { feet, inches } = cmToFeetInches(heightCm);
  const cm = clamp(Math.round(heightCm), MIN_HEIGHT_CM, MAX_HEIGHT_CM);
  const weightUnit = unit === 'imperial' ? 'lb' : 'kg';
  const showWeightHint = weightText.length > 0 && weightKg === null;
  const minWeight = unit === 'imperial' ? Math.round(kgToLb(MIN_WEIGHT_KG)) : MIN_WEIGHT_KG;
  const maxWeight = unit === 'imperial' ? Math.round(kgToLb(MAX_WEIGHT_KG)) : MAX_WEIGHT_KG;
  const bmi = weightKg === null ? null : getBmi(heightCm, weightKg);

  const setHeightFromImperial = (nextFeet: number, nextInches: number) =>
    onHeightChange(clamp(feetInchesToCm(nextFeet, nextInches), MIN_HEIGHT_CM, MAX_HEIGHT_CM));

  const wheel = (
    values: number[],
    selected: number,
    onChange: (value: number) => void,
    label: string,
    suffix = '',
    inRow = false,
  ) => (
    <Picker<number>
      selectedValue={selected}
      onValueChange={onChange}
      accessibilityLabel={label}
      style={inRow ? styles.pickerInRow : styles.picker}
      itemStyle={[styles.pickerItem, inRow && styles.pickerItemInRow, { color: theme.textPrimary }]}
      dropdownIconColor={theme.textSecondary}
      mode="dropdown"
    >
      {values.map((v) => (
        <Picker.Item key={v} label={`${v}${suffix}`} value={v} color={theme.textPrimary} />
      ))}
    </Picker>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: theme.surfaceContainerLow }]}>
        <View style={styles.cardHeader}>
          <CardLabel theme={theme} icon="height" iconColor={theme.accent} label="Height" />
          <Text style={[styles.heightValue, { color: theme.textPrimary }]}>
            {unit === 'imperial' ? `${feet}'${inches}"` : `${cm} cm`}
          </Text>
        </View>
        {unit === 'imperial' ? (
          <View style={styles.wheelRow}>
            {wheel(FEET_VALUES, feet, (f) => setHeightFromImperial(f, inches), 'Height feet', ' ft', true)}
            {wheel(INCH_VALUES, inches, (i) => setHeightFromImperial(feet, i), 'Height inches', ' in', true)}
          </View>
        ) : (
          wheel(CM_VALUES, cm, onHeightChange, 'Height in centimeters')
        )}
      </View>

      <Pressable
        onPress={() => weightInputRef.current?.focus()}
        accessible={false}
        style={[styles.card, { backgroundColor: theme.surfaceContainerLow }]}
      >
        <View style={styles.cardHeader}>
          <CardLabel theme={theme} icon="scale" iconColor={theme.secondary} label="Weight" />
          <View style={styles.weightInputRow}>
            <TextInput
              ref={weightInputRef}
              value={weightText}
              onChangeText={onWeightTextChange}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={WEIGHT_INPUT_MAX_LENGTH}
              placeholder="--"
              placeholderTextColor={theme.border}
              accessibilityLabel={`Weight in ${unit === 'imperial' ? 'pounds' : 'kilograms'}`}
              style={[styles.weightInput, { color: theme.textPrimary }]}
            />
            <Text style={[styles.weightUnit, { color: theme.textSecondary }]}>{weightUnit}</Text>
          </View>
        </View>
        <Text style={[styles.weightHint, { color: theme.textSecondary }]}>
          {showWeightHint ? `Enter a weight between ${minWeight} and ${maxWeight} ${weightUnit}.` : ' '}
        </Text>
      </Pressable>

      {bmi !== null && (
        <View style={[styles.bmiPill, { backgroundColor: theme.surfaceContainer }]}>
          <Text style={[styles.bmiText, { color: theme.accent }]}>
            BMI {bmi.bmi.toFixed(1)} • {bmi.bmiLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

function CardLabel({
  theme,
  icon,
  iconColor,
  label,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  label: string;
}) {
  return (
    <View style={styles.cardLabel}>
      <MaterialIcons name={icon} size={22} color={iconColor} />
      <Text style={[styles.cardLabelText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  card: { borderRadius: radii.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardLabelText: { fontSize: 15, fontWeight: '600' },
  heightValue: { fontSize: 28, fontWeight: '800' },
  wheelRow: { flexDirection: 'row', alignSelf: 'stretch' },
  picker: { alignSelf: 'stretch', height: WHEEL_HEIGHT },
  pickerInRow: { flex: 1, height: WHEEL_HEIGHT },
  pickerItem: { fontSize: 20, height: WHEEL_HEIGHT },
  pickerItemInRow: { fontSize: 18 },
  weightInputRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  weightInput: { fontSize: 36, fontWeight: '800', width: 80, textAlign: 'right', padding: 0 },
  weightUnit: { fontSize: 16, fontWeight: '600' },
  weightHint: { fontSize: 11, textAlign: 'right', marginTop: spacing.xs, minHeight: 16 },
  bmiPill: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  bmiText: { fontSize: 16, fontWeight: '700' },
});
