import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingProvider } from './src/onboarding/OnboardingDraftContext';
import { ProfileProvider } from './src/profile/ProfileContext';
import { AppSettingsProvider } from './src/settings/AppSettingsContext';

// `SafeAreaProvider` was an installed-but-unused dependency until the
// Settings gear icon needed `useSafeAreaInsets()` to sit below the status
// bar/notch on both platforms — see `GearButton`/`ResultsScreen`.
// `AppSettingsProvider` sits above `RootNavigator` (and everything else)
// since `useTheme()` reads its appearance preference — see `src/theme/index.ts`.
export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <ProfileProvider>
          <OnboardingProvider>
            <RootNavigator />
          </OnboardingProvider>
        </ProfileProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
