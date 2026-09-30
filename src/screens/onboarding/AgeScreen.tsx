import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingStackParamList } from '../../navigation/types';
import { AGE_INPUT_MAX_LENGTH, parseAgeInput, sanitizeAgeText } from '../../onboarding/ageInput';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { MAX_SUPPORTED_AGE, MIN_SUPPORTED_AGE } from '../../onboarding/validation';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Age'>;

export function AgeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();
  const age = parseAgeInput(draft.ageText);
  const showHint = draft.ageText.length > 0 && age === null;

  const handleNext = () => {
    Keyboard.dismiss();
    navigation.navigate('BodyComposition');
  };

  return (
    <OnboardingStep
      step={2}
      title="How old are you?"
      subtitle="Your biological age changes how many calories your body burns at rest."
      nextDisabled={age === null}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <View style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          value={draft.ageText}
          onChangeText={(text) => updateDraft({ ageText: sanitizeAgeText(text) })}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={AGE_INPUT_MAX_LENGTH}
          autoFocus
          placeholder="--"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Age in years"
          style={[styles.input, { color: theme.textPrimary }]}
        />
        <Text style={[styles.unit, { color: theme.textSecondary }]}>years</Text>
      </View>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        {showHint
          ? `Enter an age between ${MIN_SUPPORTED_AGE} and ${MAX_SUPPORTED_AGE}.`
          : `Ages ${MIN_SUPPORTED_AGE} and up are supported.`}
      </Text>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  inputCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
  },
  input: { fontSize: 56, fontWeight: '800', minWidth: 90, textAlign: 'center', padding: 0 },
  unit: { fontSize: 18, fontWeight: '600' },
  hint: { fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
});
