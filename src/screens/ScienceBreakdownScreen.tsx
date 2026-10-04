import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { REFERENCES } from '../data/references';
import { calculateNutrientTargets } from '../engine';
import { MainTabParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { radii, spacing, ThemeColors, useTheme } from '../theme';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Science'>;

// Kilocalories per kilogram of body fat — a long-standing, widely-cited
// back-of-envelope conversion (≈3,500 kcal/lb) used only to illustrate a
// *rough* weekly pace below, not as an engine-level claim.
const KCAL_PER_KG_FAT = 7700;

/**
 * Presentational-only estimate of how "active calories" (everything above
 * BMR: TDEE minus BMR) roughly splits across NEAT, structured exercise,
 * and the thermic effect of food. `src/engine` has no such split — it
 * only models a single activity multiplier (PRD §10) — so this is
 * deliberately NOT exported from `src/engine` or unit-tested as a
 * calculation; it's a fixed, clearly-labeled illustrative ratio, the same
 * spirit as the Stitch mockup's own hardcoded example breakdown, just
 * computed from the user's real `tdee - bmr` instead of a fixed number.
 */
const ACTIVE_CALORIE_SPLIT = { neat: 0.45, exercise: 0.35, tef: 0.2 } as const;

const AUDIT_ITEMS = [
  'Deep, uninterrupted night sleep (>7h)',
  'Clear morning cognitive focus & energy',
  'Normal, stable appetite between meals',
];

/**
 * The "Science Breakdown" screen (v1.1 Stitch redesign) — explains the
 * Mifflin-St Jeor math behind the Targets dashboard's calorie number in
 * plain language: an energy-budget breakdown (BMR / NEAT / Exercise /
 * TEF, all real numbers from `calculateNutrientTargets` except the
 * NEAT/Exercise/TEF sub-split, which is presentational only — see
 * `ACTIVE_CALORIE_SPLIT`), a personalized-vs-crash-diet comparison, and a
 * lightweight self-check "audit" (local-only, resets on remount — this
 * app doesn't do historical logging in v1).
 */
export function ScienceBreakdownScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { profile } = useProfile();
  const [comparisonView, setComparisonView] = useState<'personalized' | 'crash'>('personalized');
  const [checked, setChecked] = useState<boolean[]>(AUDIT_ITEMS.map(() => true));

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>No profile found yet.</Text>
      </View>
    );
  }

  const targets = calculateNutrientTargets(profile);
  const activeCalories = Math.max(0, targets.tdee - targets.bmr);
  const neatCalories = Math.round(activeCalories * ACTIVE_CALORIE_SPLIT.neat);
  const exerciseCalories = Math.round(activeCalories * ACTIVE_CALORIE_SPLIT.exercise);
  const tefCalories = Math.max(0, activeCalories - neatCalories - exerciseCalories);

  const pct = (value: number) => Math.round((value / targets.calorieTarget) * 100);

  const delta = targets.calorieTarget - targets.tdee;
  const isDeficit = delta < -5;
  const isSurplus = delta > 5;
  const weeklyKg = Math.abs((delta * 7) / KCAL_PER_KG_FAT);

  const handleRecalibrate = () => navigation.navigate('Profile');

  const handleShare = () => {
    void Share.share({
      message: `My NutriCal daily target: ${targets.calorieTarget.toLocaleString()} kcal (BMR ${targets.bmr.toLocaleString()} kcal, TDEE ${targets.tdee.toLocaleString()} kcal) — calculated with the Mifflin-St Jeor equation.`,
    });
  };

  const toggleAudit = (index: number) => {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            The Science Behind {targets.calorieTarget.toLocaleString()} kcal
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Validated calculations, zero starvation guesswork.
          </Text>
        </View>
        <View style={[styles.headerIconBadge, { backgroundColor: theme.accentFixed }]}>
          <MaterialIcons name="biotech" size={26} color={theme.accent} />
        </View>
      </View>

      <View style={[styles.botCard, { backgroundColor: theme.surfaceContainerLow }]}>
        <Mascot size={56} />
        <View style={styles.botTextBlock}>
          <View style={styles.botHeaderRow}>
            <Text style={[styles.botName, { color: theme.accent }]}>NutriCal Science Bot</Text>
            <View style={[styles.botBadge, { backgroundColor: theme.accentFixed }]}>
              <Text style={[styles.botBadgeText, { color: theme.onAccentFixed }]}>WHO-referenced</Text>
            </View>
          </View>
          <Text style={[styles.botMessage, { color: theme.textPrimary }]}>
            We use the <Text style={styles.bold}>Mifflin-St Jeor</Text> equation, a formula widely regarded by
            dietitians as the most accurate general-population estimate. Here's exactly how your body spends
            energy — no mystery.
          </Text>
        </View>
      </View>

      <View style={[styles.energyCard, { backgroundColor: theme.surface }]}>
        <View style={styles.energyCardHeader}>
          <View>
            <Text style={[styles.energyEyebrow, { color: theme.textSecondary }]}>Daily Energy Budget</Text>
            <Text style={[styles.energyTotal, { color: theme.textPrimary }]}>
              Total: {targets.calorieTarget.toLocaleString()} kcal
            </Text>
          </View>
          <View style={[styles.tailoredPill, { backgroundColor: theme.accentFixed }]}>
            <MaterialIcons name="verified" size={14} color={theme.onAccentFixed} />
            <Text style={[styles.tailoredPillText, { color: theme.onAccentFixed }]}>100% Tailored</Text>
          </View>
        </View>

        <View style={[styles.proportionalBar, { backgroundColor: theme.surfaceContainerHigh }]}>
          <View style={{ flex: pct(targets.bmr), backgroundColor: theme.accentFill }} />
          <View style={{ flex: pct(neatCalories), backgroundColor: theme.accentFixed }} />
          <View style={{ flex: pct(exerciseCalories), backgroundColor: theme.secondaryFixed }} />
          <View style={{ flex: Math.max(1, pct(tefCalories)), backgroundColor: theme.secondaryContainer }} />
        </View>

        <View style={styles.breakdownRows}>
          <BreakdownRow
            theme={theme}
            icon="bedtime"
            iconColor={theme.accent}
            iconBg={theme.accentFixed}
            title={`${targets.bmr.toLocaleString()} kcal`}
            subtitle="Basal Metabolism (vital organs at rest)"
            percent={pct(targets.bmr)}
          />
          <BreakdownRow
            theme={theme}
            icon="directions-walk"
            iconColor={theme.accent}
            iconBg={theme.accentFixed}
            title={`${neatCalories.toLocaleString()} kcal`}
            subtitle="NEAT (walking, chores & fidgeting) — estimated"
            percent={pct(neatCalories)}
          />
          <BreakdownRow
            theme={theme}
            icon="fitness-center"
            iconColor={theme.secondary}
            iconBg={theme.secondaryFixed}
            title={`${exerciseCalories.toLocaleString()} kcal`}
            subtitle="Active workouts & cardio — estimated"
            percent={pct(exerciseCalories)}
          />
          <BreakdownRow
            theme={theme}
            icon="restaurant"
            iconColor={theme.secondary}
            iconBg={theme.secondaryFixed}
            title={`${tefCalories.toLocaleString()} kcal`}
            subtitle="TEF (thermic burn digesting food) — estimated"
            percent={pct(tefCalories)}
          />
          {(isDeficit || isSurplus) && (
            <View style={[styles.deficitRow, { backgroundColor: theme.tertiaryFixed }]}>
              <View style={styles.breakdownRowLeft}>
                <View style={[styles.breakdownIconBadge, { backgroundColor: theme.surface }]}>
                  <MaterialIcons name={isDeficit ? 'trending-down' : 'trending-up'} size={20} color={theme.tertiary} />
                </View>
                <View style={styles.breakdownTextBlock}>
                  <Text style={[styles.deficitTitle, { color: theme.tertiary }]}>
                    {isDeficit ? '-' : '+'}
                    {Math.abs(delta).toLocaleString()} kcal {isDeficit ? 'Deficit' : 'Surplus'}
                  </Text>
                  <Text style={[styles.breakdownSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    A gentle ~{weeklyKg.toFixed(1)} kg/wk pace
                  </Text>
                </View>
              </View>
              <View style={[styles.safeBadge, { backgroundColor: theme.tertiary }]}>
                <Text style={[styles.safeBadgeText, { color: theme.onAccent }]}>Gentle</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.comparisonCard, { backgroundColor: theme.surface }]}>
        <View style={styles.comparisonHeader}>
          <Text style={[styles.comparisonTitle, { color: theme.textPrimary }]}>NutriCal vs Generic Diets</Text>
          <View style={[styles.comparisonSwitch, { backgroundColor: theme.surfaceContainerHigh }]}>
            <Pressable
              onPress={() => setComparisonView('personalized')}
              style={[styles.comparisonSwitchOption, comparisonView === 'personalized' && { backgroundColor: theme.accentFill }]}
            >
              <Text
                style={[
                  styles.comparisonSwitchText,
                  { color: comparisonView === 'personalized' ? theme.onAccentFill : theme.textSecondary },
                ]}
              >
                Personalized
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setComparisonView('crash')}
              style={[styles.comparisonSwitchOption, comparisonView === 'crash' && { backgroundColor: theme.error }]}
            >
              <Text
                style={[
                  styles.comparisonSwitchText,
                  { color: comparisonView === 'crash' ? theme.onAccent : theme.textSecondary },
                ]}
              >
                Crash Diets
              </Text>
            </Pressable>
          </View>
        </View>

        {comparisonView === 'personalized' ? (
          <View style={styles.comparisonList}>
            <ComparisonRow
              theme={theme}
              tone="good"
              icon="sentiment-very-satisfied"
              title="Thyroid & leptin protected"
              body="A gentle, gradual calorie change avoids hormonal starvation flags, helping protect your metabolic rate over time."
            />
            <ComparisonRow
              theme={theme}
              tone="good"
              icon="battery-charging-full"
              title="No energy slump"
              body="Keeps day-to-day movement (NEAT) comfortable, without the sluggish afternoons a much lower number can cause."
            />
          </View>
        ) : (
          <View style={styles.comparisonList}>
            <ComparisonRow
              theme={theme}
              tone="warn"
              icon="warning"
              title="Very-low-calorie crash danger"
              body="Extremely low targets (e.g. a flat 1,200 kcal for everyone) can slow metabolic rate and lead to rapid rebound weight regain."
            />
            <ComparisonRow
              theme={theme}
              tone="warn"
              icon="sentiment-dissatisfied"
              title="Lean muscle loss risk"
              body="Overly aggressive cuts push your body to burn functional muscle tissue, not just stored fat."
            />
          </View>
        )}
      </View>

      <View style={[styles.auditCard, { backgroundColor: theme.surface }]}>
        <View style={styles.auditHeader}>
          <View>
            <Text style={[styles.auditTitle, { color: theme.textPrimary }]}>Audit your metabolism</Text>
            <Text style={[styles.auditSubtitle, { color: theme.textSecondary }]}>
              Tap daily signals to confirm your target still fits.
            </Text>
          </View>
          <MaterialIcons name="fact-check" size={22} color={theme.accent} />
        </View>
        <View style={styles.auditList}>
          {AUDIT_ITEMS.map((label, index) => (
            <Pressable
              key={label}
              onPress={() => toggleAudit(index)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checked[index] }}
              style={[styles.auditRow, { backgroundColor: theme.surfaceContainerLow }, !checked[index] && styles.auditRowUnchecked]}
            >
              <View style={styles.auditRowLeft}>
                <View
                  style={[
                    styles.auditCheckIcon,
                    { backgroundColor: checked[index] ? theme.accentFill : theme.surfaceContainerHigh },
                  ]}
                >
                  <MaterialIcons
                    name={checked[index] ? 'check' : 'remove'}
                    size={16}
                    color={checked[index] ? theme.onAccentFill : theme.textSecondary}
                  />
                </View>
                <Text style={[styles.auditLabel, { color: theme.textPrimary }]}>{label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.auditCard, { backgroundColor: theme.surface }]}>
        <View style={styles.auditHeader}>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.auditTitle, { color: theme.textPrimary }]}>Sources & references</Text>
            <Text style={[styles.referencesNote, { color: theme.textSecondary }]}>
              Every formula and default in NutriCal comes from published research or official guidelines. Tap a
              source to read it. Your targets are estimates for healthy adults, not medical advice.
            </Text>
          </View>
          <MaterialIcons name="menu-book" size={22} color={theme.accent} />
        </View>
        <View style={styles.auditList}>
          {REFERENCES.map((ref) => (
            <Pressable
              key={ref.url}
              onPress={() => void Linking.openURL(ref.url)}
              accessibilityRole="link"
              accessibilityLabel={`${ref.title}, ${ref.source}`}
              style={[styles.referenceRow, { backgroundColor: theme.surfaceContainerLow }]}
            >
              <View style={styles.referenceTextBlock}>
                <Text style={[styles.referenceTitle, { color: theme.textPrimary }]}>{ref.title}</Text>
                <Text style={[styles.referenceSource, { color: theme.textSecondary }]}>
                  {ref.source}
                  {ref.year ? ` (${ref.year})` : ''}
                </Text>
                <Text style={[styles.referenceUsedFor, { color: theme.accent }]}>{ref.usedFor}</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Share Target Card" onPress={handleShare} />
        <Pressable onPress={handleRecalibrate} style={[styles.secondaryButton, { backgroundColor: theme.surfaceContainerHigh }]}>
          <MaterialIcons name="tune" size={18} color={theme.textSecondary} />
          <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>Re-calibrate anytime</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function BreakdownRow({
  theme,
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  percent,
}: {
  theme: ThemeColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  percent: number;
}) {
  return (
    <View style={[styles.breakdownRow, { backgroundColor: theme.surfaceContainerLow }]}>
      <View style={styles.breakdownRowLeft}>
        <View style={[styles.breakdownIconBadge, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.breakdownTextBlock}>
          <Text style={[styles.breakdownTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.breakdownSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={[styles.percentBadge, { backgroundColor: theme.surfaceContainer }]}>
        <Text style={[styles.percentBadgeText, { color: theme.textSecondary }]}>{percent}%</Text>
      </View>
    </View>
  );
}

function ComparisonRow({
  theme,
  tone,
  icon,
  title,
  body,
}: {
  theme: ThemeColors;
  tone: 'good' | 'warn';
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
}) {
  const bg = tone === 'good' ? theme.accentFixed : theme.surfaceContainerLow;
  const iconColor = tone === 'good' ? theme.accent : theme.error;
  return (
    <View style={[styles.comparisonRow, { backgroundColor: bg }]}>
      <MaterialIcons name={icon} size={22} color={iconColor} style={styles.comparisonRowIcon} />
      <View style={styles.comparisonRowTextBlock}>
        <Text style={[styles.comparisonRowTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.comparisonRowBody, { color: theme.textSecondary }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerTextBlock: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerIconBadge: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },

  botCard: { flexDirection: 'row', gap: spacing.sm, borderRadius: radii.lg, padding: spacing.md },
  botTextBlock: { flex: 1, minWidth: 0 },
  botHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2, flexWrap: 'wrap' },
  botName: { fontSize: 13, fontWeight: '800' },
  botBadge: { paddingHorizontal: spacing.xs, paddingVertical: 1, borderRadius: radii.pill },
  botBadgeText: { fontSize: 10, fontWeight: '700' },
  botMessage: { fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '800' },

  energyCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md },
  energyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  energyEyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  energyTotal: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  tailoredPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  tailoredPillText: { fontSize: 12, fontWeight: '700' },
  proportionalBar: { flexDirection: 'row', height: 10, borderRadius: radii.pill, overflow: 'hidden' },
  breakdownRows: { gap: spacing.xs },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.md, padding: spacing.sm },
  breakdownRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
  breakdownIconBadge: { width: 38, height: 38, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  breakdownTextBlock: { flex: 1, minWidth: 0 },
  breakdownTitle: { fontSize: 15, fontWeight: '700' },
  breakdownSubtitle: { fontSize: 11, marginTop: 1 },
  percentBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill },
  percentBadgeText: { fontSize: 11, fontWeight: '700' },
  deficitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.md, padding: spacing.sm },
  deficitTitle: { fontSize: 15, fontWeight: '800' },
  safeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill },
  safeBadgeText: { fontSize: 11, fontWeight: '700' },

  comparisonCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md },
  comparisonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  comparisonTitle: { fontSize: 16, fontWeight: '700' },
  comparisonSwitch: { flexDirection: 'row', borderRadius: radii.pill, padding: 3, gap: 2 },
  comparisonSwitchOption: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  comparisonSwitchText: { fontSize: 11, fontWeight: '700' },
  comparisonList: { gap: spacing.sm },
  comparisonRow: { flexDirection: 'row', gap: spacing.sm, borderRadius: radii.md, padding: spacing.sm },
  comparisonRowIcon: { marginTop: 2 },
  comparisonRowTextBlock: { flex: 1, minWidth: 0 },
  comparisonRowTitle: { fontSize: 13, fontWeight: '700' },
  comparisonRowBody: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  auditCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditTitle: { fontSize: 16, fontWeight: '700' },
  auditSubtitle: { fontSize: 12, marginTop: 2, maxWidth: 240 },
  auditList: { gap: spacing.xs },
  auditRow: { borderRadius: radii.md, padding: spacing.sm },
  auditRowUnchecked: { opacity: 0.6 },
  auditRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  auditCheckIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  auditLabel: { fontSize: 13, fontWeight: '500', flexShrink: 1 },

  referencesNote: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  referenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radii.md, padding: spacing.sm },
  referenceTextBlock: { flex: 1, minWidth: 0, gap: 2 },
  referenceTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  referenceSource: { fontSize: 11 },
  referenceUsedFor: { fontSize: 11, fontWeight: '600' },

  actions: { gap: spacing.sm, marginTop: spacing.xs },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radii.pill, paddingVertical: spacing.sm },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
});
