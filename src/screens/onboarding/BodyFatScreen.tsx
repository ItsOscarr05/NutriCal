import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingStackParamList } from '../../navigation/types';
import { BODY_FAT_OPTIONS } from '../../onboarding/assessmentOptions';
import { BODY_FAT_IMAGES } from '../../onboarding/bodyFatImages';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { radii, spacing, useTheme } from '../../theme';
import { BodyFatCategory } from '../../types/profile';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BodyFat'>;

type Choice = BodyFatCategory | 'unsure';

/**
 * Optional body fat self-estimate from illustrated cards. One neutral
 * border color for every card (not a cool-to-warm scale) so no category
 * reads as "good" or "bad" (PRD §11.1).
 */
export function BodyFatScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();
  const sex = draft.sex ?? 'female';

  const cells: { value: Choice; label: string; caption: string }[] = [
    ...BODY_FAT_OPTIONS.map((o) => ({ value: o.value as Choice, label: o.label, caption: `~${o.range[sex]}` })),
    { value: 'unsure', label: 'Not sure', caption: 'Skip this one' },
  ];
  const rows = [cells.slice(0, 2), cells.slice(2, 4), cells.slice(4, 6)];

  return (
    <OnboardingStep
      step={4}
      title="Body fat estimate"
      subtitle="Pick the look closest to yours. A rough guess is fine, and it helps tune your protein."
      centerBody
      nextDisabled={draft.bodyFatChoice === null}
      onNext={() => navigation.navigate('DailyMotion')}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.grid} accessibilityRole="radiogroup">
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell) => {
              const selected = draft.bodyFatChoice === cell.value;
              const borderColor = selected ? theme.accentFill : theme.border;
              return (
                <Pressable
                  key={cell.value}
                  onPress={() => updateDraft({ bodyFatChoice: cell.value })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${cell.label}, ${cell.caption}`}
                  style={({ pressed }) => [styles.card, { borderColor }, pressed && styles.pressed]}
                >
                  {selected ? (
                    <MaterialIcons name="check-circle" size={22} color={theme.accent} style={styles.check} />
                  ) : null}
                  {cell.value === 'unsure' ? (
                    <View style={[styles.unsureIcon, { backgroundColor: theme.surfaceContainer }]}>
                      <MaterialIcons name="help-outline" size={40} color={theme.textSecondary} />
                    </View>
                  ) : (
                    <Image
                      source={BODY_FAT_IMAGES[sex][cell.value]}
                      style={styles.image}
                      resizeMode="contain"
                      accessibilityIgnoresInvertColors
                    />
                  )}
                  <Text style={[styles.label, { color: theme.textPrimary }]} numberOfLines={1}>
                    {cell.label}
                  </Text>
                  <Text style={[styles.caption, { color: theme.textSecondary }]}>{cell.caption}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  grid: { flex: 1, gap: spacing.sm },
  row: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    minHeight: 150,
    borderRadius: radii.lg,
    borderWidth: 4,
    backgroundColor: 'transparent',
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  check: { position: 'absolute', top: spacing.xs, right: spacing.xs, zIndex: 1 },
  image: { width: '100%', flex: 1, minHeight: 80, borderRadius: radii.sm },
  unsureIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  label: { fontSize: 14, fontWeight: '800', marginTop: spacing.xs, textAlign: 'center' },
  caption: { fontSize: 12, marginTop: 1, textAlign: 'center' },
});
