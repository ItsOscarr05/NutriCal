import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

interface OnboardingScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared shell (title, optional subtitle, scrollable body, pinned footer
 * button) for every onboarding step. Wrapped in `KeyboardAvoidingView` so
 * the footer's Continue button — and the focused `TextInput` on
 * Age/Height/Weight — stay above the on-screen keyboard instead of being
 * covered by it. This is needed on Android too, not just iOS: Expo's
 * default `android.softwareKeyboardLayoutMode` is `resize`, but combined
 * with the default translucent status bar (`androidStatusBar.translucent`,
 * also defaulted `true`), Expo's own docs note this combination "may cause
 * unexpected keyboard behavior" and call out `KeyboardAvoidingView` as the
 * fix — see https://docs.expo.dev/versions/v57.0.0/config/app/#translucent.
 */
export function OnboardingScreenLayout({ title, subtitle, children, footer }: OnboardingScreenLayoutProps) {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 26, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: 15, marginBottom: spacing.lg },
  body: { flex: 1 },
  footer: { padding: spacing.lg },
});
