import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

/**
 * PLACEHOLDER — filled in by the `science` todo (BMR/NEAT/Exercise/TEF
 * energy-source breakdown, personalized-vs-crash-diet comparison, audit
 * checklist). Exists now only so `MainTabs`' "Science" tab has a real
 * component to mount while the tab shell itself is being wired up.
 */
export function ScienceBreakdownScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>Science Breakdown — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { fontSize: 15 },
});
