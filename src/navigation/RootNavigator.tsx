import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useProfile } from '../profile/ProfileContext';
import { MacroDetailScreen } from '../screens/MacroDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useTheme } from '../theme';
import { MainTabs } from './MainTabs';
import { OnboardingStack } from './OnboardingStack';
import { RootStackParamList } from './types';

export type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigation stack (PRD §9). Whether the app opens on `Welcome`
 * (start onboarding) or `Main` (existing profile, the bottom tab shell —
 * see `MainTabs`) is decided once, after the one-time async profile load
 * from `ProfileContext` resolves — this is the "user can return anytime
 * to view their dashboard" behavior.
 */
export function RootNavigator() {
  const { profile, isLoading } = useProfile();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.accentDeep} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={profile ? 'Main' : 'Welcome'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="MacroDetail" component={MacroDetailScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
