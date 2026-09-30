import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProfileProvider } from './src/profile/ProfileContext';
import { AppSettingsProvider } from './src/settings/AppSettingsContext';

// `SafeAreaProvider` was an installed-but-unused dependency until the
// Settings gear icon needed `useSafeAreaInsets()` to sit below the status
// bar/notch on both platforms — see `GearButton`/`ResultsScreen`.
// `AppSettingsProvider` sits above `RootNavigator` (and everything else)
// since `useTheme()` reads its appearance preference — see `src/theme/index.ts`.
//
// The paged first-time onboarding keeps its in-progress answers in an
// `OnboardingDraftProvider` scoped to `OnboardingStack`, not here, so the
// draft only lives while those pages are mounted.
export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <ProfileProvider>
          <RootNavigator />
        </ProfileProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
