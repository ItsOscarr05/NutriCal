import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { getMacroExplanation } from '../data/education/macroExplanations';
import { calculateProteinPerMeal } from '../engine';
import { RootStackParamList } from '../navigation/types';
import { useProfile } from '../profile/ProfileContext';
import { radii, spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MacroDetail'>;
type Route = RouteProp<RootStackParamList, 'MacroDetail'>;

/**
 * Plain-language macro explanation modal (PRD §8.4, §8.5). Reached by
 * tapping a macro card on `ResultsScreen`. Takes the already-calculated
 * grams/percent/goal as params rather than recomputing them, so the number
 * shown here can never drift from what's on the results dashboard.
 */
export function MacroDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const theme = useTheme();
  const explanation = getMacroExplanation(params.macro);
  const { profile } = useProfile();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{explanation.displayName}</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>
          {params.grams}g · {params.percent}% of your daily calories
        </Text>

        <Section title="What it does" body={explanation.what} theme={theme} />
        <Section title="Why your number is what it is" body={explanation.whyByGoal[params.goal]} theme={theme} />
        {params.macro === 'protein' && profile ? (
          <Section
            title="Spread it out"
            body={`Your muscles use protein best in portions of about ${calculateProteinPerMeal(profile.weightKg)}g per meal, spread across 3 to 4 meals, rather than all at once.`}
            theme={theme}
          />
        ) : null}
        <Section title="If you get too little" body={explanation.tooLittle} theme={theme} />
        <Section title="If you get too much" body={explanation.tooMuch} theme={theme} />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Got it" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

function Section({ title, body, theme }: { title: string; body: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 28, fontWeight: '800' },
  value: { fontSize: 15, marginTop: spacing.xs, marginBottom: spacing.lg },
  section: { borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.xs },
  sectionBody: { fontSize: 14, lineHeight: 20 },
  footer: { padding: spacing.lg },
});
