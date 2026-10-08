import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { ScienceBreakdownScreen } from '../screens/ScienceBreakdownScreen';
import { useTheme } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  Targets: 'track-changes',
  Recipes: 'restaurant-menu',
  Science: 'menu-book',
  Profile: 'account-circle',
};

/**
 * The persistent bottom tab bar (max five) — Home (daily overview, the
 * default tab), Targets (macros + locked micros toggle), Recipes
 * (placeholder), Science, Profile (local stats + recalibrate; no account). Mounted as the `Main` route in
 * `RootNavigator`, once a profile exists. First-time onboarding is the
 * paged `OnboardingStack`.
 */
export function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <MaterialIcons name={TAB_ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Targets" component={ResultsScreen} />
      <Tab.Screen name="Recipes" component={RecipesScreen} />
      <Tab.Screen name="Science" component={ScienceBreakdownScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
