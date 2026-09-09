import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';

/**
 * Root navigation stack. Mirrors the v1 user flow in PRD §9:
 * Welcome -> Onboarding -> Results Dashboard -> (Nutrient Detail | Paywall).
 * Only the first screen is scaffolded so far.
 */
export type RootStackParamList = {
  Welcome: undefined;
  // Onboarding: undefined;
  // Results: undefined;
  // NutrientDetail: { nutrient: string };
  // Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
