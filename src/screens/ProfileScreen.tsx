import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../onboarding/assessmentOptions';
import { cmToFeetInches, kgToLb } from '../onboarding/unitConversion';
import { useProfile } from '../profile/ProfileContext';
import { useAppSettings } from '../settings/AppSettingsContext';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { ActivityLevel, Goal, Sex, UserProfile } from '../types/profile';

const SEX_LABEL: Record<Sex, string> = {
  female: 'Female',
  male: 'Male',
};

/**
 * Local "your stats" tab — not an account (no login, no cloud). Shows a
 * read-only summary of the saved `UserProfile`. Recalibration lives on
 * this same screen after the next navbar pass (the Assess form moves here).
 */
export function ProfileScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const { settings } = useAppSettings();

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const height = formatHeight(profile, settings.units);
  const weight = formatWeight(profile, settings.units);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Mascot size={72} />
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Your profile</Text>
        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Stored only on this device — no account, no cloud sync.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardEyebrow, { color: theme.textSecondary }]}>Saved stats</Text>
        <StatRow theme={theme} label="Sex" value={SEX_LABEL[profile.sex]} />
        <StatRow theme={theme} label="Age" value={`${profile.age} yrs`} />
        <StatRow theme={theme} label="Height" value={height} />
        <StatRow theme={theme} label="Weight" value={weight} />
        <StatRow theme={theme} label="Activity" value={activityLabel(profile.activityLevel)} />
        <StatRow theme={theme} label="Goal" value={goalLabel(profile.goal)} last />
      </View>
    </ScrollView>
  );
}

function StatRow({
  theme,
  label,
  value,
  last,
}: {
  theme: ThemeColors;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.statRow, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function formatHeight(profile: UserProfile, units: 'imperial' | 'metric'): string {
  if (units === 'metric') return `${Math.round(profile.heightCm)} cm`;
  const { feet, inches } = cmToFeetInches(profile.heightCm);
  return `${feet}'${inches}"`;
}

function formatWeight(profile: UserProfile, units: 'imperial' | 'metric'): string {
  if (units === 'metric') return `${Math.round(profile.weightKg)} kg`;
  return `${Math.round(kgToLb(profile.weightKg))} lb`;
}

function activityLabel(level: ActivityLevel): string {
  return ACTIVITY_OPTIONS.find((option) => option.value === level)?.label ?? level;
}

function goalLabel(goal: Goal): string {
  return GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  hero: { alignItems: 'center', marginBottom: spacing.sm },
  heroTitle: { fontSize: 24, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, marginTop: spacing.xs, textAlign: 'center', maxWidth: 280 },
  card: { borderRadius: radii.lg, padding: spacing.md },
  cardEyebrow: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
});
