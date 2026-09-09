import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, useTheme } from '../theme';

interface ChangeNudgeCardProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * The "has anything changed?" prompt (PRD §8.1) — a soft, dismissible card
 * rather than a push notification or red/yellow alert banner, matching the
 * non-judgmental tone rule (PRD §11.1). Purely presentational; visibility
 * and dismissal persistence are handled by `useChangeNudge`.
 */
export function ChangeNudgeCard({ onUpdate, onDismiss }: ChangeNudgeCardProps) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textPrimary }]}>Has anything changed since you set this up?</Text>
      <View style={styles.actions}>
        <Pressable onPress={onUpdate} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.updateLabel, { color: theme.accentDeep }]}>Update my info</Text>
        </Pressable>
        <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss">
          <Text style={[styles.dismissLabel, { color: theme.textSecondary }]}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  text: { fontSize: 14, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg },
  updateLabel: { fontSize: 14, fontWeight: '700' },
  dismissLabel: { fontSize: 14, fontWeight: '600' },
});
