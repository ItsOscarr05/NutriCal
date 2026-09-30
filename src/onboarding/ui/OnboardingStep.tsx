import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { radii, spacing, useTheme } from '../../theme';

export const ONBOARDING_STEP_COUNT = 6;

/**
 * Shared layout for each onboarding page: back button, progress segments,
 * title/subtitle, scrollable content, and a pinned primary button. The
 * keyboard-avoiding wrapper keeps that button visible above the iOS
 * number pad on the age page (which has no return key).
 */
export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  nextLabel = 'Next',
  nextDisabled = false,
  onNext,
  onBack,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
        </Pressable>
        <View
          style={styles.progressRow}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${ONBOARDING_STEP_COUNT}`}
        >
          {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, i) => (
            <View
              key={i}
              style={[styles.progressSegment, { backgroundColor: i < step ? theme.accent : theme.surfaceContainerHigh }]}
            />
          ))}
        </View>
        <Text style={[styles.stepCount, { color: theme.textSecondary }]}>
          {step}/{ONBOARDING_STEP_COUNT}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <PrimaryButton label={nextLabel} onPress={onNext} disabled={nextDisabled} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flex: 1, flexDirection: 'row', gap: 4 },
  progressSegment: { flex: 1, height: 6, borderRadius: radii.pill },
  stepCount: { fontSize: 13, fontWeight: '700', minWidth: 28, textAlign: 'right' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginTop: spacing.xs, lineHeight: 21 },
  body: { marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});
