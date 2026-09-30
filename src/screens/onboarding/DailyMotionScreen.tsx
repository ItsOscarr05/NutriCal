import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { ActivityPicker } from '../../onboarding/ui/AssessmentFields';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'DailyMotion'>;

export function DailyMotionScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();

  return (
    <OnboardingStep
      step={4}
      title="Daily motion"
      subtitle="Pick the option that best matches a typical week."
      onNext={() => navigation.navigate('TargetOutcome')}
      onBack={() => navigation.goBack()}
    >
      <ActivityPicker theme={theme} value={draft.activityLevel} onChange={(activityLevel) => updateDraft({ activityLevel })} />
    </OnboardingStep>
  );
}
