import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLegalDocument } from '../data/legal/legalDocuments';
import { RootStackParamList } from '../navigation/types';
import { spacing, useTheme } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LegalDocument'>;
type Route = RouteProp<RootStackParamList, 'LegalDocument'>;

/**
 * In-app Privacy Policy / Terms of Service (reached from Settings → About).
 * Copy lives in `src/data/legal/legalDocuments.ts` so it can be reviewed
 * independently of layout.
 */
export function LegalDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const theme = useTheme();
  const doc = getLegalDocument(params.kind);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{doc.title}</Text>
        <Text
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={[styles.doneLink, { color: theme.accentDeep }]}
        >
          Done
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.effective, { color: theme.textSecondary }]}>Effective {doc.effectiveDate}</Text>
        <Text style={[styles.body, { color: theme.textPrimary }]}>{doc.intro}</Text>
        {doc.sections.map((section, index) => (
          <View key={section.heading} style={styles.section}>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>
              {index + 1}. {section.heading}
            </Text>
            <Text style={[styles.body, { color: theme.textPrimary }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
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
    gap: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', flex: 1 },
  doneLink: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  effective: { fontSize: 13, marginBottom: spacing.md },
  section: { marginTop: spacing.md },
  heading: { fontSize: 15, fontWeight: '700', marginBottom: spacing.xs },
  body: { fontSize: 15, lineHeight: 24 },
});
