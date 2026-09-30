import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FadeInView } from '../../components/FadeInView';
import { Mascot } from '../../components/Mascot';
import { calculateNutrientTargets } from '../../engine';
import { OnboardingStackParamList } from '../../navigation/types';
import { parseAgeInput } from '../../onboarding/ageInput';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { MetabolicForecastCard } from '../../onboarding/ui/AssessmentFields';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'MetabolicForecast'>;

export function MetabolicForecastScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft } = useOnboardingDraft();
  const age = parseAgeInput(draft.ageText);
  const sex = draft.sex;

  const preview = useMemo(
    () =>
      sex !== null && age !== null
        ? calculateNutrientTargets({
            sex,
            age,
            heightCm: draft.heightCm,
            weightKg: draft.weightKg,
            activityLevel: draft.activityLevel,
            goal: draft.goal,
            updatedAt: '',
          })
        : null,
    [sex, age, draft.heightCm, draft.weightKg, draft.activityLevel, draft.goal],
  );

  return (
    <OnboardingStep
      step={6}
      title="Your metabolic forecast"
      subtitle="Here's a first look at your personalized daily targets."
      nextLabel="See my targets"
      nextDisabled={preview === null}
      onNext={() => {}}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.mascot}>
        <Mascot size={96} />
      </View>
      {preview ? (
        <FadeInView delay={150}>
          <MetabolicForecastCard
            theme={theme}
            preview={preview}
            footer="Calculated with the Mifflin-St Jeor equation. You can recalibrate any time from the Assess tab."
          />
        </FadeInView>
      ) : (
        <Text style={[styles.missing, { color: theme.textSecondary }]}>
          Go back and add your sex and age to see your forecast.
        </Text>
      )}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  mascot: { alignItems: 'center', marginBottom: spacing.lg },
  missing: { fontSize: 14, textAlign: 'center' },
});
