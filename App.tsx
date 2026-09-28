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
// There used to be a third top-level `OnboardingProvider` here, backing an
// in-memory draft context for the old multi-step onboarding wizard. The
// v1.1 Stitch redesign replaced that wizard with a single scrolling
// `QuickAssessmentScreen` that keeps its own local state (seeded directly
// from `ProfileContext` when editing), so that provider — and the wizard
// screens it existed for — is gone.
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
