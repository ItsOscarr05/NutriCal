import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Keyboard } from 'react-native';
import { UnitToggle } from '../../components/UnitToggle';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { BodyCompositionWheelFields } from '../../onboarding/ui/BodyCompositionWheelFields';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { convertWeightText, parseWeightInput, sanitizeWeightText } from '../../onboarding/weightInput';
import { useAppSettings } from '../../settings/AppSettingsContext';
import { Units } from '../../settings/appSettings';
import { useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BodyComposition'>;

export function BodyCompositionScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();
  const { settings, setUnits } = useAppSettings();
  const weightKg = parseWeightInput(draft.weightText, settings.units);

  const handleUnitsChange = (next: Units) => {
    updateDraft({ weightText: convertWeightText(draft.weightText, settings.units, next) });
    setUnits(next);
  };

  const handleNext = () => {
    Keyboard.dismiss();
    navigation.navigate('DailyMotion');
  };

  return (
    <OnboardingStep
      step={3}
      title="Body composition"
      subtitle="Spin the height wheel and type your weight."
      centerBody
      nextDisabled={weightKg === null}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <UnitToggle<Units>
        options={[
          { value: 'imperial', label: 'Imperial' },
          { value: 'metric', label: 'Metric' },
        ]}
        value={settings.units}
        onChange={handleUnitsChange}
        centered
      />
      <BodyCompositionWheelFields
        theme={theme}
        unit={settings.units}
        heightCm={draft.heightCm}
        weightText={draft.weightText}
        weightKg={weightKg}
        onHeightChange={(heightCm) => updateDraft({ heightCm })}
        onWeightTextChange={(text) => updateDraft({ weightText: sanitizeWeightText(text) })}
      />
    </OnboardingStep>
  );
}
