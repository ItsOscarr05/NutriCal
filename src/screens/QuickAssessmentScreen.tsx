import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

/**
 * PLACEHOLDER — filled in by the `assessment` todo (single-screen
 * scrolling Quick Assessment replacing the old 6-step onboarding wizard;
 * see AGENTS.md's "Editing an existing profile reuses the onboarding
 * wizard" note, which this screen will take over from `GoalScreen`).
 * Exists now only so `MainTabs`' "Assess" tab has a real component to
 * mount while the tab shell itself is being wired up.
 */
export function QuickAssessmentScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>Quick Assessment — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { fontSize: 15 },
});
