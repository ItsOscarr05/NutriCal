import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

/**
 * PLACEHOLDER — filled in by the `micros` todo (restyled per the Stitch
 * mockup, but values stay locked/name-only for free users — an explicit
 * user decision to keep the existing freemium paywall rule in AGENTS.md
 * rather than adopt the mockup's "unlock real values for everyone").
 * Exists now only so `MainTabs`' "Micros" tab has a real component to
 * mount while the tab shell itself is being wired up.
 */
export function MicronutrientExplorerScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>Micronutrient Explorer — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { fontSize: 15 },
});
