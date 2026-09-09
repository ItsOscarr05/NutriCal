import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { OptionCard } from '../../components/OptionCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { ActivityLevel } from '../../types/profile';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Activity'>;

const OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'lightly_active', label: 'Lightly active', description: 'Light exercise or sports 1-3 days a week' },
  { value: 'moderately_active', label: 'Moderately active', description: 'Moderate exercise or sports 3-5 days a week' },
  { value: 'very_active', label: 'Very active', description: 'Hard exercise or sports 6-7 days a week' },
  { value: 'extremely_active', label: 'Extremely active', description: 'Very hard exercise, or a physically demanding job' },
];

export function ActivityScreen() {
  const navigation = useNavigation<Nav>();
  const { draft, setActivityLevel } = useOnboardingDraft();
  const [selected, setSelected] = useState<ActivityLevel | undefined>(draft.activityLevel);

  return (
    <OnboardingScreenLayout
      title="How active are you?"
      subtitle="Pick the option that best matches a typical week."
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setActivityLevel(selected);
            navigation.navigate('Goal');
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
          />
        ))}
      </ScrollView>
    </OnboardingScreenLayout>
  );
}
