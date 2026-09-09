import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingProvider } from './src/onboarding/OnboardingDraftContext';
import { ProfileProvider } from './src/profile/ProfileContext';

export default function App() {
  return (
    <ProfileProvider>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
    </ProfileProvider>
  );
}
