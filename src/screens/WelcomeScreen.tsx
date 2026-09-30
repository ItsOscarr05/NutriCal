import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../components/FadeInView';
import { Logo } from '../components/Logo';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { radii, spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const VALUE_PROPS: { icon: keyof typeof MaterialIcons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'insights',
    title: 'Built around you',
    body: 'Calories and macros tuned to your body, activity, and goal.',
  },
  {
    icon: 'science',
    title: 'Grounded in nutrition science',
    body: 'Established formulas, explained in plain language.',
  },
  {
    icon: 'lock-outline',
    title: 'Private by design',
    body: 'No account needed. Your info stays on this device.',
  },
];

/** Welcome/value-prop screen (PRD §9, step 1) — no login, straight into onboarding. */
export function WelcomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView duration={700} style={styles.hero}>
          <Logo size={180} />
        </FadeInView>

        <FadeInView delay={150}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>NutriCal</Text>
          <Text style={[styles.tagline, { color: theme.accent }]}>Know your numbers.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Personalized daily nutrition targets, calculated in about a minute.
          </Text>
        </FadeInView>

        <View style={styles.props}>
          {VALUE_PROPS.map((prop, i) => (
            <FadeInView key={prop.title} delay={300 + i * 100}>
              <View style={[styles.propRow, { backgroundColor: theme.surfaceContainerLow }]}>
                <MaterialIcons name={prop.icon} size={28} color={theme.accent} />

                <View style={styles.propText}>
                  <Text style={[styles.propTitle, { color: theme.textPrimary }]}>{prop.title}</Text>
                  <Text style={[styles.propBody, { color: theme.textSecondary }]}>{prop.body}</Text>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>
      </ScrollView>

      <FadeInView delay={650} style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton label="Get Started" onPress={() => navigation.navigate('Onboarding')} />
        <Text style={[styles.footnote, { color: theme.textSecondary }]}>Free to start · No sign-up required</Text>
      </FadeInView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  tagline: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs },
  subtitle: { fontSize: 15, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm },
  props: { marginTop: spacing.xl, gap: spacing.sm },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  propText: { flex: 1 },
  propTitle: { fontSize: 15, fontWeight: '700' },
  propBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  footnote: { fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
});
