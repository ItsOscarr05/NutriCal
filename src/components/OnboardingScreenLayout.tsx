import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme';

interface OnboardingScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared shell (title, optional subtitle, scrollable body, pinned footer button) for every onboarding step. */
export function OnboardingScreenLayout({ title, subtitle, children, footer }: OnboardingScreenLayoutProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
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
