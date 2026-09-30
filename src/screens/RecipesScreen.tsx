import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, useTheme } from '../theme';

/**
 * Recipes / recommendations tab — placeholder only (PRD §6 lists meal
 * planning as a v1 non-goal). No fake recipes, no food API, no engine
 * leakage. Content will be filled in a later pass.
 */
export function RecipesScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.iconBadge, { backgroundColor: theme.accentFixed }]}>
        <MaterialIcons name="restaurant" size={32} color={theme.accent} />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Recipes</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        Personalized meal ideas and recommendations will live here. Nothing to cook yet — this tab is a placeholder.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  iconBadge: { width: 64, height: 64, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 320 },
});
