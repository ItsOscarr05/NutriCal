import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingDraft } from '../../onboarding/OnboardingDraftContext';
import { OnboardingStep } from '../../onboarding/ui/OnboardingStep';
import { darkTheme, radii, spacing, useTheme } from '../../theme';
import { Sex } from '../../types/profile';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Sex'>;

// Conventional blue/pink sex colors, local to this page rather than theme
// tokens. `fill` is the light-mode border/icon color and the selected icon
// badge fill (carries a white icon); `dark` is the brighter border/icon
// color for the navy dark-mode background.
const SEX_COLORS: Record<Sex, { fill: string; dark: string }> = {
  male: { fill: '#2563EB', dark: '#93C5FD' },
  female: { fill: '#C2185B', dark: '#F9A8D4' },
};

const OPTIONS: { value: Sex; label: string; icon: 'gender-male' | 'gender-female' }[] = [
  { value: 'male', label: 'Male', icon: 'gender-male' },
  { value: 'female', label: 'Female', icon: 'gender-female' },
];

export function SexScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { draft, updateDraft } = useOnboardingDraft();
  const isDark = theme === darkTheme;

  return (
    <OnboardingStep
      step={1}
      title="What's your biological sex?"
      subtitle="Metabolism and nutrient needs differ by sex, so this shapes every number that follows."
      nextDisabled={draft.sex === null}
      centerBody
      onNext={() => navigation.navigate('Age')}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => {
          const selected = draft.sex === option.value;
          const colors = SEX_COLORS[option.value];
          const accent = isDark ? colors.dark : colors.fill;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateDraft({ sex: option.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              style={({ pressed }) => [styles.option, { borderColor: accent }, pressed && styles.pressed]}
            >
              {selected ? (
                <MaterialIcons name="check-circle" size={26} color={accent} style={styles.check} />
              ) : null}
              <View
                style={[styles.iconRing, { borderColor: accent, backgroundColor: selected ? colors.fill : 'transparent' }]}
              >
                <MaterialCommunityIcons name={option.icon} size={64} color={selected ? '#ffffff' : accent} />
              </View>
              <Text style={[styles.label, { color: theme.textPrimary }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  option: {
    flex: 1,
    minHeight: 240,
    borderRadius: radii.lg,
    borderWidth: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  check: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 22, fontWeight: '800' },
});
