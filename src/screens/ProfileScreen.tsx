import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import appJson from '../../app.json';
import { AppHeader } from '../components/AppHeader';
import { FadeInView } from '../components/FadeInView';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { UnitToggle } from '../components/UnitToggle';
import { calculateNutrientTargets } from '../engine';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { ACTIVITY_OPTIONS, BODY_FAT_OPTIONS, GOAL_OPTIONS } from '../onboarding/assessmentOptions';
import { AssessmentEditor } from '../onboarding/ui/AssessmentEditor';
import { getBmi } from '../onboarding/ui/AssessmentFields';
import { cmToFeetInches, kgToLb } from '../onboarding/unitConversion';
import { daysSince } from '../profile/nudge';
import { useProfile } from '../profile/ProfileContext';
import { Appearance, Units } from '../settings/appSettings';
import { useAppSettings } from '../settings/AppSettingsContext';
import { radii, spacing, ThemeColors, useTheme } from '../theme';
import { Sex, UserProfile } from '../types/profile';

const SEX_LABEL: Record<Sex, string> = {
  female: 'Female',
  male: 'Male',
};

const UNIT_OPTIONS: { value: Units; label: string }[] = [
  { value: 'imperial', label: 'Imperial' },
  { value: 'metric', label: 'Metric' },
];

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Navy' },
  { value: 'system', label: 'System' },
];

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/**
 * Local "your stats" tab — not an account (no login, no cloud). The v2
 * Stitch profile mockup's overview (biological baseline, units/theme,
 * science & privacy) with a "Re-Calibrate" action that swaps the tab into
 * `AssessmentEditor`.
 *
 * Omitted from the mockup because nothing backs them: name/avatar, diet &
 * sensitivity tags, Apple Health / Google Fit sync, data export, and the
 * "encrypted" footnote (AsyncStorage isn't encrypted).
 */
export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { profile } = useProfile();
  const { settings, setUnits, setAppearance } = useAppSettings();
  const { params } = useRoute<RouteProp<MainTabParamList, 'Profile'>>();
  const [editing, setEditing] = useState(!!params?.edit);

  // `edit` is a one-shot request from a "Recalibrate" shortcut elsewhere;
  // clear it so a later plain visit to the tab shows the overview.
  useEffect(() => {
    if (params?.edit) {
      setEditing(true);
      navigation.setParams({ edit: undefined });
    }
  }, [params?.edit, navigation]);

  const targets = useMemo(() => (profile ? calculateNutrientTargets(profile) : null), [profile]);

  if (!profile || !targets) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  if (editing) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <AppHeader />
        <AssessmentEditor
          onSaved={() => {
            setEditing(false);
            navigation.navigate('Targets');
          }}
          header={
            <View style={styles.editHeader}>
              <Pressable
                onPress={() => setEditing(false)}
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
              >
                <MaterialIcons name="arrow-back" size={18} color={theme.accent} />
                <Text style={[styles.backText, { color: theme.accent }]}>Back to profile</Text>
              </Pressable>
              <Text style={[styles.recalibrateHeading, { color: theme.textPrimary }]}>Re-calibrate</Text>
              <Text style={[styles.recalibrateSub, { color: theme.textSecondary }]}>
                Adjust anything below and save to update your daily targets.
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  const units = settings.units;
  const calibratedDays = Math.max(0, Math.floor(daysSince(profile.updatedAt)));
  const { bmi, bmiLabel } = getBmi(profile.heightCm, profile.weightKg);
  const activity = ACTIVITY_OPTIONS.find((o) => o.value === profile.activityLevel);
  const goal = GOAL_OPTIONS.find((o) => o.value === profile.goal);
  const bodyFat = profile.bodyFat ? BODY_FAT_OPTIONS.find((o) => o.value === profile.bodyFat) : undefined;
  const delta = targets.calorieTarget - targets.tdee;
  const deltaText =
    delta === 0
      ? 'Eating at maintenance'
      : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toLocaleString()} kcal/day ${delta > 0 ? 'above' : 'below'} maintenance`;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={[styles.hero, { backgroundColor: theme.surface }]}>
            <View style={[styles.heroGlow, { backgroundColor: theme.accentFixed }]} />
            <View style={[styles.avatarRing, { borderColor: theme.accentFixed, backgroundColor: theme.surfaceContainer }]}>
              <Mascot size={64} />
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Your profile</Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              {calibratedDays === 0
                ? 'Targets calibrated today'
                : `Targets calibrated ${calibratedDays} day${calibratedDays === 1 ? '' : 's'} ago`}
            </Text>
            <View style={[styles.trustBadge, { backgroundColor: theme.surfaceContainer }]}>
              <MaterialIcons name="verified-user" size={14} color={theme.accent} />
              <Text style={[styles.trustText, { color: theme.textSecondary }]}>100% on-device data • No account, no cloud</Text>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={80}>
          <Section
            theme={theme}
            icon="monitor-heart"
            title="Biological baseline"
            action={
              <Pressable
                onPress={() => setEditing(true)}
                accessibilityRole="button"
                accessibilityLabel="Edit biological baseline"
                style={({ pressed }) => [styles.editChip, { backgroundColor: theme.surfaceContainerHigh }, pressed && styles.pressed]}
              >
                <Text style={[styles.editChipText, { color: theme.accent }]}>Edit</Text>
              </Pressable>
            }
          >
            <View style={styles.tileRow}>
              <View style={[styles.tile, { backgroundColor: theme.surfaceContainer }]}>
                <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>Sex & age</Text>
                <Text style={[styles.tileValue, { color: theme.textPrimary }]}>
                  {SEX_LABEL[profile.sex]}, {profile.age}
                  <Text style={[styles.tileUnit, { color: theme.textSecondary }]}> yrs</Text>
                </Text>
              </View>
              <View style={[styles.tile, { backgroundColor: theme.surfaceContainer }]}>
                <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>Body dimensions</Text>
                <Text style={[styles.tileValueSmall, { color: theme.textPrimary }]}>
                  {formatHeight(profile, units)}
                  <Text style={[styles.tileUnit, { color: theme.textSecondary }]}> ({formatHeight(profile, otherUnit(units))})</Text>
                </Text>
                <Text style={[styles.tileValueSmall, { color: theme.textPrimary }]}>
                  {formatWeight(profile, units)}
                  <Text style={[styles.tileUnit, { color: theme.textSecondary }]}> ({formatWeight(profile, otherUnit(units))})</Text>
                </Text>
              </View>
            </View>

            <View style={[styles.bmiRow, { backgroundColor: theme.surfaceContainer }]}>
              <View style={styles.bmiLeft}>
                <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.bmiValue, { color: theme.textPrimary }]}>BMI {bmi.toFixed(1)}</Text>
              </View>
              <View style={[styles.bmiChip, { backgroundColor: theme.surfaceContainerHigh }]}>
                <Text style={[styles.bmiChipText, { color: theme.textPrimary }]}>{bmiLabel}</Text>
              </View>
            </View>
            <Text style={[styles.footnote, { color: theme.textSecondary }]}>
              BMI is a rough screening number — it can't tell muscle from fat, so your targets don't use it.
            </Text>

            <DetailRow
              theme={theme}
              icon={<MaterialCommunityIcons name={activity?.icon ?? 'walk'} size={20} color={theme.accent} />}
              eyebrow="Activity profile"
              value={activity ? `${activity.label} (${activity.description})` : profile.activityLevel}
            />
            <DetailRow
              theme={theme}
              icon={<MaterialIcons name="auto-graph" size={20} color={theme.accent} />}
              eyebrow="Primary target"
              value={goal?.label ?? profile.goal}
              detail={deltaText}
            />
            {bodyFat && (
              <DetailRow
                theme={theme}
                icon={<MaterialIcons name="accessibility-new" size={20} color={theme.accent} />}
                eyebrow="Body fat estimate"
                value={`${bodyFat.label} (${bodyFat.range[profile.sex]})`}
              />
            )}
          </Section>
        </FadeInView>

        <FadeInView delay={160}>
          <Section theme={theme} icon="tune" title="Units & appearance">
            <PreferenceRow theme={theme} label="Measurement units" hint="Used for height and weight everywhere">
              <UnitToggle options={UNIT_OPTIONS} value={units} onChange={setUnits} />
            </PreferenceRow>
            <PreferenceRow theme={theme} label="Interface theme" hint="Sunlit white or deep navy">
              <UnitToggle options={APPEARANCE_OPTIONS} value={settings.appearance} onChange={setAppearance} />
            </PreferenceRow>
          </Section>
        </FadeInView>

        <FadeInView delay={240}>
          <Section theme={theme} icon="verified" title="Science & privacy">
            <View style={[styles.formulaCard, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>Formula protocol</Text>
              <Text style={[styles.formulaText, { color: theme.textPrimary }]}>
                Mifflin-St Jeor BMR × an activity factor, plus a fixed goal adjustment. Protein and fat come from your body
                weight; carbs fill the rest. No black-box algorithms.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Science')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
              >
                <Text style={[styles.linkText, { color: theme.accent }]}>See the math and sources</Text>
                <MaterialIcons name="arrow-forward" size={16} color={theme.accent} />
              </Pressable>
            </View>

            <PrimaryButton label="Re-calibrate assessment" onPress={() => setEditing(true)} />

            <Pressable
              onPress={() => navigation.navigate('Settings')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, { backgroundColor: theme.surfaceContainerHigh }, pressed && styles.pressed]}
            >
              <MaterialIcons name="settings" size={18} color={theme.textPrimary} />
              <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>Settings & delete my data</Text>
            </Pressable>

            <Text style={[styles.footnote, styles.centerText, { color: theme.textSecondary }]}>
              NutriCal v{appJson.expo.version} • Stored only on this device
            </Text>
          </Section>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

function Section({
  theme,
  icon,
  title,
  action,
  children,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.accentFixed }]}>
            <MaterialIcons name={icon} size={18} color={theme.onAccentFixed} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

function DetailRow({
  theme,
  icon,
  eyebrow,
  value,
  detail,
}: {
  theme: ThemeColors;
  icon: ReactNode;
  eyebrow: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={[styles.detailRow, { backgroundColor: theme.surfaceContainer }]}>
      {icon}
      <View style={styles.flexShrink}>
        <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>{eyebrow}</Text>
        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text>
        {detail && <Text style={[styles.detailSub, { color: theme.textSecondary }]}>{detail}</Text>}
      </View>
    </View>
  );
}

function PreferenceRow({ theme, label, hint, children }: { theme: ThemeColors; label: string; hint: string; children: ReactNode }) {
  return (
    <View style={[styles.preferenceRow, { backgroundColor: theme.surfaceContainer }]}>
      <Text style={[styles.preferenceLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.preferenceHint, { color: theme.textSecondary }]}>{hint}</Text>
      <View style={styles.preferenceControl}>{children}</View>
    </View>
  );
}

function otherUnit(units: Units): Units {
  return units === 'metric' ? 'imperial' : 'metric';
}

function formatHeight(profile: UserProfile, units: Units): string {
  if (units === 'metric') return `${Math.round(profile.heightCm)} cm`;
  const { feet, inches } = cmToFeetInches(profile.heightCm);
  return `${feet}'${inches}"`;
}

function formatWeight(profile: UserProfile, units: Units): string {
  if (units === 'metric') return `${Math.round(profile.weightKg)} kg`;
  return `${Math.round(kgToLb(profile.weightKg))} lb`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md + 4, gap: spacing.md, paddingBottom: spacing.xl },
  flexShrink: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.75 },
  centerText: { textAlign: 'center' },

  hero: { borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, opacity: 0.5 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', marginTop: spacing.sm, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 13, marginTop: 2 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm + 4, paddingHorizontal: spacing.sm + 4, paddingVertical: 6, borderRadius: radii.pill },
  trustText: { fontSize: 11, fontWeight: '700' },

  section: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm + 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  editChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill },
  editChipText: { fontSize: 13, fontWeight: '800' },

  tileRow: { flexDirection: 'row', gap: spacing.sm },
  tile: { flex: 1, borderRadius: radii.md, padding: spacing.sm + 4, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  tileValue: { fontSize: 20, fontWeight: '800' },
  tileValueSmall: { fontSize: 16, fontWeight: '800' },
  tileUnit: { fontSize: 12, fontWeight: '600' },

  bmiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.md, paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm + 2 },
  bmiLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bmiValue: { fontSize: 15, fontWeight: '800' },
  bmiChip: { paddingHorizontal: spacing.sm + 4, paddingVertical: 4, borderRadius: radii.pill },
  bmiChipText: { fontSize: 12, fontWeight: '700' },
  footnote: { fontSize: 11, lineHeight: 16 },

  detailRow: { flexDirection: 'row', gap: spacing.sm + 4, borderRadius: radii.md, padding: spacing.sm + 4, alignItems: 'flex-start' },
  detailValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  detailSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  preferenceRow: { borderRadius: radii.md, padding: spacing.sm + 4 },
  preferenceLabel: { fontSize: 14, fontWeight: '800' },
  preferenceHint: { fontSize: 11, marginTop: 2 },
  preferenceControl: { marginTop: spacing.sm, marginBottom: -spacing.md },

  formulaCard: { borderRadius: radii.md, padding: spacing.sm + 4, gap: 6 },
  formulaText: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  linkText: { fontSize: 13, fontWeight: '800' },

  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 50, borderRadius: radii.pill },
  secondaryText: { fontSize: 14, fontWeight: '700' },

  editHeader: { gap: spacing.xs },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: spacing.xs },
  backText: { fontSize: 14, fontWeight: '700' },
  recalibrateHeading: { fontSize: 22, fontWeight: '800' },
  recalibrateSub: { fontSize: 13 },
});
