import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, ThemeColors } from '../../theme';
import { BodyFatCategory, Sex } from '../../types/profile';
import { BODY_FAT_OPTIONS } from '../assessmentOptions';
import { BODY_FAT_IMAGES } from '../bodyFatImages';

/**
 * Compact, horizontally scrolling body fat picker for the Profile tab's
 * recalibrate form. `undefined` is "Not sure" (no estimate saved). The
 * onboarding page uses the full-size grid in `BodyFatScreen` instead.
 */
export function BodyFatPicker({
  theme,
  sex,
  value,
  onChange,
}: {
  theme: ThemeColors;
  sex: Sex;
  value: BodyFatCategory | undefined;
  onChange: (value: BodyFatCategory | undefined) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {BODY_FAT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}, about ${option.range[sex]}`}
            style={[styles.card, { borderColor: selected ? theme.accentFill : theme.border }]}
          >
            <Image source={BODY_FAT_IMAGES[sex][option.value]} style={styles.image} resizeMode="contain" />
            <Text style={[styles.label, { color: theme.textPrimary }]} numberOfLines={2}>
              {option.label}
            </Text>
            <Text style={[styles.caption, { color: theme.textSecondary }]}>~{option.range[sex]}</Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => onChange(undefined)}
        accessibilityRole="radio"
        accessibilityState={{ selected: value === undefined }}
        accessibilityLabel="Not sure"
        style={[styles.card, { borderColor: value === undefined ? theme.accentFill : theme.border }]}
      >
        <View style={[styles.unsureIcon, { backgroundColor: theme.surfaceContainer }]}>
          <MaterialIcons name="help-outline" size={28} color={theme.textSecondary} />
        </View>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Not sure</Text>
        <Text style={[styles.caption, { color: theme.textSecondary }]}>Uses total weight</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: 2 },
  card: {
    width: 104,
    borderWidth: 3,
    borderRadius: radii.md,
    padding: spacing.xs,
    alignItems: 'center',
  },
  image: { width: 72, height: 96, borderRadius: radii.sm },
  unsureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  label: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  caption: { fontSize: 11, textAlign: 'center' },
});
