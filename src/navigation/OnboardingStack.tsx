import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingDraftProvider } from '../onboarding/OnboardingDraftContext';
import { QuickAssessmentScreen } from '../screens/QuickAssessmentScreen';
import { useTheme } from '../theme';
import { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * First-time onboarding, one question per page. A nested native stack
 * gives each Next a native slide (and swipe-back on iOS) without pulling
 * in an extra animation library. The draft provider wraps the whole stack
 * so answers survive moving back and forth between pages.
 */
export function OnboardingStack() {
  const theme = useTheme();
  return (
    <OnboardingDraftProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="Sex" component={QuickAssessmentScreen} />
      </Stack.Navigator>
    </OnboardingDraftProvider>
  );
}
