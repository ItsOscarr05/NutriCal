import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { OnboardingGoalPicker } from '../../onboarding/ui/OnboardingGoalPicker';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'TargetOutcome'>;

export function TargetOutcomeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();

  return (
    <OnboardingStep
      step={5}
      title="Target outcome"
      subtitle="What would you like your nutrition to support right now?"
      centerBody
      onNext={() => navigation.navigate('MetabolicForecast')}
      onBack={() => navigation.goBack()}
    >
      <OnboardingGoalPicker theme={theme} value={draft.goal} onChange={(goal) => updateDraft({ goal })} />
    </OnboardingStep>
  );
}
