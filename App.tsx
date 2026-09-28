import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingProvider } from './src/onboarding/OnboardingDraftContext';
import { ProfileProvider } from './src/profile/ProfileContext';

// `SafeAreaProvider` was an installed-but-unused dependency until the
// Settings gear icon needed `useSafeAreaInsets()` to sit below the status
// bar/notch on both platforms — see `GearButton`/`ResultsScreen`.
export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <OnboardingProvider>
          <RootNavigator />
        </OnboardingProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
