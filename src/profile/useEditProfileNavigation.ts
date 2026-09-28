import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useOnboardingDraft } from '../onboarding/OnboardingDraftContext';
import { UserProfile } from '../types/profile';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Shared "re-enter the onboarding wizard prefilled with an existing
 * profile" action (AGENTS.md — editing an existing profile reuses the
 * onboarding wizard via `hydrateFromProfile` + `navigate('Sex')`, and does
 * *not* call `clearProfile`). Factored out so `ResultsScreen`'s "Edit
 * profile" link and `SettingsScreen`'s "Edit profile" row can't drift out
 * of sync with each other.
 */
export function useEditProfileNavigation(): (profile: UserProfile) => void {
  const navigation = useNavigation<Nav>();
  const { hydrateFromProfile } = useOnboardingDraft();

  return (profile: UserProfile) => {
    hydrateFromProfile(profile);
    navigation.navigate('Sex');
  };
}
