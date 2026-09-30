import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MicronutrientExplorerScreen } from '../screens/MicronutrientExplorerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { QuickAssessmentScreen } from '../screens/QuickAssessmentScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { ScienceBreakdownScreen } from '../screens/ScienceBreakdownScreen';
import { useTheme } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Ported 1:1 from the Stitch mockups' bottom nav (Material Symbols names, hyphenated for `MaterialIcons`). */
const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Targets: 'track-changes',
  Assess: 'auto-awesome',
  Micros: 'eco',
  Science: 'menu-book',
  Profile: 'person-outline',
};

/**
 * The persistent bottom tab bar — Targets / Assess / Micros / Science /
 * Profile (local stats summary; no account). Mounted as the `Main` route
 * in `RootNavigator`, once a profile exists.
 *
 * `Assess` is the single-scroll Quick Assessment for recalibrating an
 * existing profile; first-time onboarding is the separate paged
 * `OnboardingStack`.
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
      <Tab.Screen name="Targets" component={ResultsScreen} />
      <Tab.Screen name="Assess" component={QuickAssessmentScreen} />
      <Tab.Screen name="Micros" component={MicronutrientExplorerScreen} />
      <Tab.Screen name="Science" component={ScienceBreakdownScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
