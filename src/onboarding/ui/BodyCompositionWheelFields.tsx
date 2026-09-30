import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
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

const WHEEL_HEIGHT = 190;

/**
 * Onboarding height (native wheel) plus weight (number pad, same pattern
 * as the Age page). Height stays metric internally; imperial wheels
 * convert at the edge. Weight is typed in the active unit and parsed to
 * kg by the parent via `parseWeightInput`.
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
      <View style={styles.columns}>
        <WheelColumn
          theme={theme}
          icon="height"
          iconColor={theme.accent}
          label="Height"
          flex={1.4}
          valueText={unit === 'imperial' ? `${feet}'${inches}"` : `${cm} cm`}
        >
          {unit === 'imperial' ? (
            <View style={styles.wheelRow}>
              {wheel(FEET_VALUES, feet, (f) => setHeightFromImperial(f, inches), 'Height feet', ' ft', true)}
              {wheel(INCH_VALUES, inches, (i) => setHeightFromImperial(feet, i), 'Height inches', ' in', true)}
            </View>
          ) : (
            wheel(CM_VALUES, cm, onHeightChange, 'Height in centimeters')
          )}
        </WheelColumn>
        <View style={[styles.column, { flex: 0.9, backgroundColor: theme.surfaceContainerLow }]}>
          <View style={styles.columnHeader}>
            <MaterialIcons name="scale" size={22} color={theme.secondary} />
            <Text style={[styles.columnLabel, { color: theme.textSecondary }]}>Weight</Text>
          </View>
          <View style={styles.weightInputRow}>
            <TextInput
              value={weightText}
              onChangeText={onWeightTextChange}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={WEIGHT_INPUT_MAX_LENGTH}
              placeholder="--"
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel={`Weight in ${unit === 'imperial' ? 'pounds' : 'kilograms'}`}
              style={[styles.weightInput, { color: theme.textPrimary }]}
            />
            <Text style={[styles.weightUnit, { color: theme.textSecondary }]}>{weightUnit}</Text>
          </View>
          <Text style={[styles.weightHint, { color: theme.textSecondary }]}>
            {showWeightHint
              ? `Enter a weight between ${minWeight} and ${maxWeight} ${weightUnit}.`
              : ' '}
          </Text>
        </View>
      </View>
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

function WheelColumn({
  theme,
  icon,
  iconColor,
  label,
  flex,
  valueText,
  children,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  label: string;
  flex: number;
  valueText: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.column, { flex, backgroundColor: theme.surfaceContainerLow }]}>
      <View style={styles.columnHeader}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
        <Text style={[styles.columnLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.columnValue, { color: theme.textPrimary }]}>{valueText}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  columns: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  column: { borderRadius: radii.lg, paddingTop: spacing.md, paddingHorizontal: spacing.xs, alignItems: 'center', paddingBottom: spacing.md },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  columnLabel: { fontSize: 15, fontWeight: '600' },
  columnValue: { fontSize: 30, fontWeight: '800', marginTop: spacing.xs },
  wheelRow: { flexDirection: 'row', alignSelf: 'stretch' },
  picker: { alignSelf: 'stretch', height: WHEEL_HEIGHT },
  pickerInRow: { flex: 1, height: WHEEL_HEIGHT },
  pickerItem: { fontSize: 20, height: WHEEL_HEIGHT },
  pickerItemInRow: { fontSize: 18 },
  weightInputRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.md },
  weightInput: { fontSize: 40, fontWeight: '800', minWidth: 72, textAlign: 'center', padding: 0 },
  weightUnit: { fontSize: 16, fontWeight: '600' },
  weightHint: { fontSize: 11, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xs, minHeight: 28 },
  bmiPill: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  bmiText: { fontSize: 16, fontWeight: '700' },
});
