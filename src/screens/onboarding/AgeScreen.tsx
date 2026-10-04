import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput } from 'react-native';
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
  const inputRef = useRef<TextInput>(null);

  const handleNext = () => {
    Keyboard.dismiss();
    navigation.navigate('BodyComposition');
  };

  return (
    <OnboardingStep
      step={2}
      title="How old are you?"
      subtitle="Your biological age changes how many calories your body burns at rest."
      centerBody
      nextDisabled={age === null}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}
        style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text
          style={[styles.unit, styles.unitSpacer]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          years
        </Text>
        <TextInput
          ref={inputRef}
          value={draft.ageText}
          onChangeText={(text) => updateDraft({ ageText: sanitizeAgeText(text) })}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={AGE_INPUT_MAX_LENGTH}
          placeholder="--"
          placeholderTextColor={theme.border}
          accessibilityLabel="Age in years"
          style={[styles.input, { color: theme.textPrimary }]}
        />
        <Text style={[styles.unit, { color: theme.textSecondary }]}>years</Text>
      </Pressable>
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
  input: { fontSize: 56, fontWeight: '800', width: 120, textAlign: 'center', padding: 0 },
  unit: { fontSize: 18, fontWeight: '600' },
  // Invisible mirror of the "years" label so the number itself sits at the card's center.
  unitSpacer: { opacity: 0 },
  hint: { fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
});
