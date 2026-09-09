import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { OptionCard } from '../../components/OptionCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { RootStackParamList } from '../../navigation/types';
import { Sex } from '../../types/profile';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Sex'>;

const OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

export function SexScreen() {
  const navigation = useNavigation<Nav>();
  const { draft, setSex } = useOnboardingDraft();
  const [selected, setSelected] = useState<Sex | undefined>(draft.sex);

  return (
    <OnboardingScreenLayout
      title="Let's get your numbers"
      subtitle="Sex is used to pull the right DRI (dietary reference intake) tables for your targets. It stays on your device."
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setSex(selected);
            navigation.navigate('Age');
          }}
        />
      }
    >
      <View>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
          />
        ))}
      </View>
    </OnboardingScreenLayout>
  );
}
