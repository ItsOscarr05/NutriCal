import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { OnboardingScreenLayout } from '../../components/OnboardingScreenLayout';
import { OptionCard } from '../../components/OptionCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { useProfile } from '../../profile/ProfileContext';
import { Goal, UserProfile } from '../../types/profile';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Goal'>;

const OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'maintain', label: 'Maintain weight', description: 'Keep things where they are' },
  { value: 'lose_weight', label: 'Lose weight', description: 'A gradual, sustainable calorie deficit' },
  { value: 'gain_weight', label: 'Gain weight', description: 'A gradual calorie surplus' },
  { value: 'build_muscle', label: 'Build muscle', description: 'Higher protein, a modest calorie surplus' },
];

/**
 * Final onboarding step. Unlike the earlier screens, this one doesn't just
 * commit its field to the draft context and navigate on — it's the one
 * place all six collected fields come together into a real `UserProfile`,
 * which gets persisted (PRD §8.1) before routing to the results dashboard.
 */
export function GoalScreen() {
  const navigation = useNavigation<Nav>();
  const { draft, reset } = useOnboardingDraft();
  const { profile, saveProfile } = useProfile();
  const [selected, setSelected] = useState<Goal | undefined>(draft.goal);
  const [saving, setSaving] = useState(false);

  // A non-null profile here means we arrived via "Edit profile" on the
  // results screen (which hydrates the draft but never clears the saved
  // profile), not first-time onboarding — see ResultsScreen.handleEditProfile.
  const isEditing = profile !== null;

  const canFinish =
    !!selected && !!draft.sex && !!draft.age && !!draft.heightCm && !!draft.weightKg && !!draft.activityLevel;

  const handleFinish = async () => {
    if (!canFinish || !selected || !draft.sex || !draft.age || !draft.heightCm || !draft.weightKg || !draft.activityLevel) {
      return;
    }
    setSaving(true);
    const updatedProfile: UserProfile = {
      sex: draft.sex,
      age: draft.age,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      activityLevel: draft.activityLevel,
      goal: selected,
      updatedAt: new Date().toISOString(),
    };
    await saveProfile(updatedProfile);
    reset();
    navigation.reset({ index: 0, routes: [{ name: 'Results' }] });
  };

  return (
    <OnboardingScreenLayout
      title="What's your goal?"
      footer={
        <PrimaryButton
          label={saving ? 'Saving…' : isEditing ? 'Save changes' : 'See my numbers'}
          disabled={!canFinish || saving}
          onPress={handleFinish}
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
