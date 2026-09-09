import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { UnitToggle } from '../../components/UnitToggle';
import { RootStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { kgToLb, lbToKg } from '../../onboarding/unitConversion';
import { isValidWeightKg } from '../../onboarding/validation';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Weight'>;
type Unit = 'imperial' | 'metric';

export function WeightScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, setWeightKg } = useOnboardingDraft();
  const [unit, setUnit] = useState<Unit>('imperial');

  const [lb, setLb] = useState(draft.weightKg ? String(kgToLb(draft.weightKg)) : '');
  const [kg, setKg] = useState(draft.weightKg ? String(draft.weightKg) : '');

  const weightKg = unit === 'imperial' ? (lb.length > 0 ? lbToKg(Number(lb)) : NaN) : Number(kg);
  const valid = isValidWeightKg(weightKg);

  return (
    <OnboardingScreenLayout
      title="What's your weight?"
      subtitle="This is used to calculate your calorie and macro targets — it's never shared."
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!valid}
          onPress={() => {
            setWeightKg(Math.round(weightKg * 10) / 10);
            navigation.navigate('Activity');
          }}
        />
      }
    >
      <UnitToggle<Unit>
        options={[
          { value: 'imperial', label: 'lb' },
          { value: 'metric', label: 'kg' },
        ]}
        value={unit}
        onChange={setUnit}
      />
      {unit === 'imperial' ? (
        <TextInput
          value={lb}
          onChangeText={setLb}
          keyboardType="number-pad"
          placeholder="Pounds"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
          accessibilityLabel="Weight, pounds"
        />
      ) : (
        <TextInput
          value={kg}
          onChangeText={setKg}
          keyboardType="number-pad"
          placeholder="Kilograms"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
          accessibilityLabel="Weight, kilograms"
        />
      )}
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 20,
    marginTop: spacing.md,
  },
});
