import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { isValidAge, MAX_SUPPORTED_AGE, MIN_SUPPORTED_AGE } from '../../onboarding/validation';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Age'>;

export function AgeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, setAge } = useOnboardingDraft();
  const [text, setText] = useState(draft.age ? String(draft.age) : '');

  const parsed = Number(text);
  const valid = text.length > 0 && isValidAge(parsed);

  return (
    <OnboardingScreenLayout
      title="How old are you?"
      subtitle={`NutriCal currently supports ages ${MIN_SUPPORTED_AGE}+.`}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!valid}
          onPress={() => {
            setAge(parsed);
            navigation.navigate('Height');
          }}
        />
      }
    >
      <TextInput
        value={text}
        onChangeText={setText}
        keyboardType="number-pad"
        placeholder="Age in years"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
        accessibilityLabel="Age in years"
        maxLength={3}
      />
      {text.length > 0 && !valid ? (
        <Text style={[styles.error, { color: theme.textSecondary }]}>
          Please enter an age between {MIN_SUPPORTED_AGE} and {MAX_SUPPORTED_AGE}.
        </Text>
      ) : null}
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
  },
  error: {
    marginTop: spacing.sm,
    fontSize: 13,
  },
});
