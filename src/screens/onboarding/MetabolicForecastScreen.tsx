import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FadeInView } from '../../components/FadeInView';
import { Mascot } from '../../components/Mascot';
import { calculateNutrientTargets } from '../../engine';
import { OnboardingStackParamList, RootStackParamList } from '../../navigation/types';
import { parseAgeInput } from '../../onboarding/ageInput';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { MetabolicForecastCard } from '../../onboarding/ui/AssessmentFields';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { useProfile } from '../../profile/ProfileContext';
import { spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'MetabolicForecast'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function MetabolicForecastScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft } = useOnboardingDraft();
  const { saveProfile } = useProfile();
  const [saving, setSaving] = useState(false);
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

  const handleFinish = async () => {
    if (sex === null || age === null) return;
    setSaving(true);
    await saveProfile({
      sex,
      age,
      heightCm: Math.round(draft.heightCm),
      weightKg: Math.round(draft.weightKg * 10) / 10,
      activityLevel: draft.activityLevel,
      goal: draft.goal,
      updatedAt: new Date().toISOString(),
    });
    // Swap onboarding out for the tab shell on the root stack.
    // `justCompleted` triggers the one-time celebratory reveal (PRD §11.3)
    // on the Targets tab.
    navigation.getParent<RootNav>()?.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Targets', params: { justCompleted: true } } }],
    });
  };

  return (
    <OnboardingStep
      step={6}
      title="Your metabolic forecast"
      subtitle="Here's a first look at your personalized daily targets."
      centerBody
      nextLabel={saving ? 'Calculating…' : "I'm Ready!"}
      nextDisabled={preview === null || saving}
      onNext={handleFinish}
      onBack={() => navigation.goBack()}
      secondaryAction={{ label: 'Go back and adjust', onPress: () => navigation.goBack(), disabled: saving }}
    >
      <View style={styles.mascot}>
        <Mascot size={72} />
      </View>
      {preview ? (
        <FadeInView delay={150}>
          <MetabolicForecastCard
            theme={theme}
            preview={preview}
            size="large"
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
  mascot: { alignItems: 'center', marginBottom: spacing.md },
  missing: { fontSize: 14, textAlign: 'center' },
});
