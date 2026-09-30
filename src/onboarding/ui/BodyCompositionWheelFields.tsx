import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Units } from '../../settings/appSettings';
import { radii, spacing, ThemeColors } from '../../theme';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from '../unitConversion';
import { MAX_HEIGHT_CM, MAX_WEIGHT_KG, MIN_HEIGHT_CM, MIN_WEIGHT_KG } from '../validation';
import { getBmi } from './AssessmentFields';

const range = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const CM_VALUES = range(MIN_HEIGHT_CM, MAX_HEIGHT_CM);
const KG_VALUES = range(MIN_WEIGHT_KG, MAX_WEIGHT_KG);
const FEET_VALUES = range(3, 8);
const INCH_VALUES = range(0, 11);
// Whole-pound bounds that stay inside the metric validation range once converted.
const MIN_LB = Math.ceil(kgToLb(MIN_WEIGHT_KG));
const MAX_LB = Math.floor(kgToLb(MAX_WEIGHT_KG));
const LB_VALUES = range(MIN_LB, MAX_LB);

const WHEEL_HEIGHT = 190;

/**
 * Onboarding-only height/weight entry using native wheel pickers (iOS
 * wheel, Android dropdown). Values stay metric; imperial wheels convert at
 * the edge via `unitConversion`.
 */
export function BodyCompositionWheelFields({
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
  const { bmi, bmiLabel } = getBmi(heightCm, weightKg);
  const { feet, inches } = cmToFeetInches(heightCm);
  const lb = clamp(Math.round(kgToLb(weightKg)), MIN_LB, MAX_LB);
  const cm = clamp(Math.round(heightCm), MIN_HEIGHT_CM, MAX_HEIGHT_CM);
  const kg = clamp(Math.round(weightKg), MIN_WEIGHT_KG, MAX_WEIGHT_KG);

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
      itemStyle={[styles.pickerItem, { color: theme.textPrimary }]}
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
        <WheelColumn
          theme={theme}
          icon="scale"
          iconColor={theme.secondary}
          label="Weight"
          valueText={unit === 'imperial' ? `${lb} lb` : `${kg} kg`}
        >
          {unit === 'imperial'
            ? wheel(LB_VALUES, lb, (v) => onWeightChange(lbToKg(v)), 'Weight in pounds')
            : wheel(KG_VALUES, kg, onWeightChange, 'Weight in kilograms')}
        </WheelColumn>
      </View>
      <View style={[styles.bmiPill, { backgroundColor: theme.surfaceContainer }]}>
        <Text style={[styles.bmiText, { color: theme.accent }]}>
          BMI {bmi.toFixed(1)} • {bmiLabel}
        </Text>
      </View>
    </View>
  );
}

function WheelColumn({
  theme,
  icon,
  iconColor,
  label,
  valueText,
  children,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  label: string;
  valueText: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.column, { backgroundColor: theme.surfaceContainerLow }]}>
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
  columns: { flexDirection: 'row', gap: spacing.sm },
  column: { flex: 1, borderRadius: radii.lg, paddingTop: spacing.md, paddingHorizontal: spacing.xs, alignItems: 'center' },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  columnLabel: { fontSize: 15, fontWeight: '600' },
  columnValue: { fontSize: 30, fontWeight: '800', marginTop: spacing.xs },
  wheelRow: { flexDirection: 'row', alignSelf: 'stretch' },
  picker: { alignSelf: 'stretch', height: WHEEL_HEIGHT },
  pickerInRow: { flex: 1, height: WHEEL_HEIGHT },
  pickerItem: { fontSize: 20, height: WHEEL_HEIGHT },
  bmiPill: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  bmiText: { fontSize: 16, fontWeight: '700' },
});
