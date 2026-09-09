import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { UnitToggle } from '../../components/UnitToggle';
import { RootStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { cmToFeetInches, feetInchesToCm } from '../../onboarding/unitConversion';
import { isValidHeightCm } from '../../onboarding/validation';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Height'>;
type Unit = 'imperial' | 'metric';

export function HeightScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, setHeightCm } = useOnboardingDraft();
  const [unit, setUnit] = useState<Unit>('imperial');

  const initialImperial = draft.heightCm ? cmToFeetInches(draft.heightCm) : undefined;
  const [feet, setFeet] = useState(initialImperial ? String(initialImperial.feet) : '');
  const [inches, setInches] = useState(initialImperial ? String(initialImperial.inches) : '');
  const [cm, setCm] = useState(draft.heightCm ? String(draft.heightCm) : '');

  const heightCm =
    unit === 'imperial'
      ? feet.length > 0 && inches.length > 0
        ? feetInchesToCm(Number(feet), Number(inches))
        : NaN
      : Number(cm);

  const valid = isValidHeightCm(heightCm);

  return (
    <OnboardingScreenLayout
      title="How tall are you?"
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!valid}
          onPress={() => {
            setHeightCm(Math.round(heightCm));
            navigation.navigate('Weight');
          }}
        />
      }
    >
      <UnitToggle<Unit>
        options={[
          { value: 'imperial', label: 'ft/in' },
          { value: 'metric', label: 'cm' },
        ]}
        value={unit}
        onChange={setUnit}
      />
      {unit === 'imperial' ? (
        <View style={styles.row}>
          <TextInput
            value={feet}
            onChangeText={setFeet}
            keyboardType="number-pad"
            placeholder="Feet"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, styles.half, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
            accessibilityLabel="Height, feet"
          />
          <TextInput
            value={inches}
            onChangeText={setInches}
            keyboardType="number-pad"
            placeholder="Inches"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, styles.half, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
            accessibilityLabel="Height, inches"
          />
        </View>
      ) : (
        <TextInput
          value={cm}
          onChangeText={setCm}
          keyboardType="number-pad"
          placeholder="Centimeters"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
          accessibilityLabel="Height, centimeters"
        />
      )}
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 20,
    marginTop: spacing.md,
  },
});
