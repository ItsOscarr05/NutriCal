import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { FadeInView } from '../components/FadeInView';
import { Logo } from '../components/Logo';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

/** Welcome/value-prop screen (PRD §9, step 1) — no login, straight into onboarding. */
export function WelcomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <FadeInView duration={700}>
          <Logo size={220} style={styles.logo} />
        </FadeInView>
        <FadeInView delay={150}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>NutriCal</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Know your numbers. Personalized daily nutrient targets, built just for you.
          </Text>
        </FadeInView>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => navigation.navigate('Onboarding')} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  logo: { marginBottom: spacing.lg },
  title: { fontSize: 32, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  footer: { padding: spacing.lg },
});
