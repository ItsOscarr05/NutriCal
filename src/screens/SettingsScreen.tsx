import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import appJson from '../../app.json';
import { Logo } from '../components/Logo';
import { UnitToggle } from '../components/UnitToggle';
import { RootStackParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { Appearance, Units } from '../settings/appSettings';
import { useAppSettings } from '../settings/AppSettingsContext';
import { clearDismissedNudgeTimestamp } from '../storage/nudgeStorage';
import { palette, radii, spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const UNIT_OPTIONS: { value: Units; label: string }[] = [
  { value: 'imperial', label: 'Imperial' },
  { value: 'metric', label: 'Metric' },
];

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

/**
 * v1 Settings screen — a modal reached from the gear icon on
 * `ResultsScreen` (same `presentation: 'modal'` pattern as
 * `MacroDetailScreen`). Covers exactly the sections confirmed with the
 * user: Preferences (units/appearance), Profile (edit shortcut), Data &
 * Privacy (delete-my-data), About (version + placeholder legal rows).
 * Explicitly excludes a restore-purchases stub and a contact/feedback
 * link — no subscription or support system exists yet (revisit alongside
 * milestone 5's paywall work).
 */
export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { settings, setUnits, setAppearance } = useAppSettings();
  const { profile, clearProfile } = useProfile();

  // Same destination as `ResultsScreen`'s recalibrate CTA — the `Profile`
  // tab. Settings is a root-level modal, so this uses the nested-navigator
  // params form rather than a plain sibling `navigate('Profile')`.
  const handleEditProfile = () => {
    if (!profile) return;
    navigation.navigate('Main', { screen: 'Profile' });
  };

  // Irreversible (no accounts/backend to recover from, PRD §13) — confirmed
  // via a native alert. Clears the profile and its nudge-dismissal state
  // only; units/appearance preferences aren't "your data" in the sensitive
  // body-metric sense, so they're deliberately left alone (see
  // `src/settings/appSettings.ts`).
  const handleDeleteData = () => {
    Alert.alert(
      'Delete my data?',
      "This permanently removes your profile from this device. There's no account or backup to restore it from — you'll need to go through setup again.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearProfile();
            await clearDismissedNudgeTimestamp();
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Logo size={32} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        </View>
        <Text
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={[styles.doneLink, { color: theme.accentDeep }]}
        >
          Done
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle theme={theme}>Preferences</SectionTitle>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Units</Text>
          <UnitToggle options={UNIT_OPTIONS} value={settings.units} onChange={setUnits} />
          <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Appearance</Text>
          <UnitToggle options={APPEARANCE_OPTIONS} value={settings.appearance} onChange={setAppearance} />
        </View>

        <SectionTitle theme={theme}>Profile</SectionTitle>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Pressable onPress={handleEditProfile} accessibilityRole="button" style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Edit profile</Text>
            <Text style={[styles.chevron, { color: theme.textSecondary }]}>{'\u203A'}</Text>
          </Pressable>
        </View>

        <SectionTitle theme={theme}>Data &amp; privacy</SectionTitle>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.explanation, { color: theme.textSecondary }]}>
            NutriCal stores your profile only on this device. There's no account and nothing is sent to a server.
          </Text>
          <Pressable onPress={handleDeleteData} accessibilityRole="button" style={styles.row}>
            <Text style={styles.deleteLabel}>Delete my data</Text>
          </Pressable>
        </View>

        <SectionTitle theme={theme}>About</SectionTitle>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={[styles.row, styles.rowStatic]}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Version</Text>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{appJson.expo.version}</Text>
          </View>
          <View style={[styles.row, styles.rowStatic, styles.rowDisabled]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Privacy Policy</Text>
            <Text style={[styles.comingSoon, { color: theme.textSecondary }]}>Coming soon</Text>
          </View>
          <View style={[styles.row, styles.rowStatic, styles.rowDisabled]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Terms of Service</Text>
            <Text style={[styles.comingSoon, { color: theme.textSecondary }]}>Coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ children, theme }: { children: string; theme: ReturnType<typeof useTheme> }) {
  return <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 24, fontWeight: '800' },
  doneLink: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  content: { padding: spacing.lg, paddingTop: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.xs },
  card: { borderRadius: radii.md, padding: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowStatic: {},
  rowDisabled: { opacity: 0.6 },
  rowLabel: { fontSize: 15, fontWeight: '600', marginBottom: spacing.xs },
  rowValue: { fontSize: 14 },
  chevron: { fontSize: 18 },
  explanation: { fontSize: 13, lineHeight: 18, marginBottom: spacing.sm },
  // Bold + 18px clears the WCAG "large text" bar (>=18.66px bold), keeping
  // `errorNeutral` AA-safe in dark mode too (3.59:1) — see the contrast
  // notes at the top of `src/theme/colors.ts`. Deliberately not red — PRD
  // §11.1 avoids alarm-color framing even for a destructive action.
  deleteLabel: { fontSize: 18, fontWeight: '700', color: palette.errorNeutral },
  comingSoon: { fontSize: 12, fontStyle: 'italic' },
});
