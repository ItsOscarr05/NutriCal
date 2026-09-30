import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UnitToggle } from '../../components/UnitToggle';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { BodyCompositionFields } from '../../onboarding/ui/AssessmentFields';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { useAppSettings } from '../../settings/AppSettingsContext';
import { Units } from '../../settings/appSettings';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BodyComposition'>;

export function BodyCompositionScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();
  const { settings, setUnits } = useAppSettings();

  return (
    <OnboardingStep
      step={3}
      title="Body composition"
      subtitle="Drag to set your height and weight. Change units any time."
      onNext={() => navigation.navigate('DailyMotion')}
      onBack={() => navigation.goBack()}
    >
      <UnitToggle<Units>
        options={[
          { value: 'imperial', label: 'Imperial' },
          { value: 'metric', label: 'Metric' },
        ]}
        value={settings.units}
        onChange={setUnits}
      />
      <BodyCompositionFields
        theme={theme}
        unit={settings.units}
        heightCm={draft.heightCm}
        weightKg={draft.weightKg}
        onHeightChange={(heightCm) => updateDraft({ heightCm })}
        onWeightChange={(weightKg) => updateDraft({ weightKg })}
      />
    </OnboardingStep>
  );
}
