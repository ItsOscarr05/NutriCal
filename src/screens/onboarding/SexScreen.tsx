import { MaterialCommunityIcons } from '@expo/vector-icons';
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
// tokens. `fill` carries white text (>= 4.5:1); `lightText`/`darkText` are
// the unselected label colors on the light and navy backgrounds.
const SEX_COLORS: Record<Sex, { fill: string; lightText: string; darkText: string; tint: string }> = {
  male: { fill: '#2563EB', lightText: '#1D4ED8', darkText: '#93C5FD', tint: 'rgba(37, 99, 235, 0.12)' },
  female: { fill: '#C2185B', lightText: '#AD1457', darkText: '#F9A8D4', tint: 'rgba(194, 24, 91, 0.12)' },
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
          const fg = selected ? '#ffffff' : isDark ? colors.darkText : colors.lightText;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateDraft({ sex: option.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? colors.fill : colors.tint,
                  borderColor: selected ? colors.fill : 'transparent',
                },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name={option.icon} size={80} color={fg} />
              <Text style={[styles.label, { color: fg }]}>{option.label}</Text>
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: 22, fontWeight: '800' },
});
