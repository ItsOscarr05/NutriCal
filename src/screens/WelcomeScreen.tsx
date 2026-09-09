import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

/**
 * Placeholder welcome/value-prop screen (PRD §9, step 1). Onboarding
 * (sex -> age -> height -> weight -> activity -> goal) is the next screen
 * to build in this flow.
 */
export function WelcomeScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>NutriCal</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Know your numbers. Personalized daily nutrient targets, built just for you.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
