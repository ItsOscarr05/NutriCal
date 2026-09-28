import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useProfile } from '../profile/ProfileContext';
import { MacroDetailScreen } from '../screens/MacroDetailScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ActivityScreen } from '../screens/onboarding/ActivityScreen';
import { AgeScreen } from '../screens/onboarding/AgeScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { HeightScreen } from '../screens/onboarding/HeightScreen';
import { SexScreen } from '../screens/onboarding/SexScreen';
import { WeightScreen } from '../screens/onboarding/WeightScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useTheme } from '../theme';
import { RootStackParamList } from './types';

export type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigation stack (PRD §9). Whether the app opens on `Welcome`
 * (start onboarding) or `Results` (existing profile) is decided once,
 * after the one-time async profile load from `ProfileContext` resolves —
 * this is the "user can return anytime to view their dashboard" behavior.
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
      <Stack.Navigator initialRouteName={profile ? 'Results' : 'Welcome'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Sex" component={SexScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Height" component={HeightScreen} />
        <Stack.Screen name="Weight" component={WeightScreen} />
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="Goal" component={GoalScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="MacroDetail" component={MacroDetailScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
