import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { palette, radii, spacing } from '../theme';

interface CelebrationBannerProps {
  message: string;
  onDone: () => void;
  /** How long the banner stays fully visible before fading out, in ms. */
  visibleDuration?: number;
}

/**
 * A brief, self-dismissing celebratory banner — PRD §11.3: "a small
 * celebratory animation when onboarding completes." Shown once, driven by
 * `ResultsScreen` reading a `justCompleted` nav param set only when the
 * user just finished first-time onboarding (not when saving edits from
 * the Assess tab) — never on a routine app open. Calls `onDone` once fully faded out so the
 * parent can unmount it.
 *
 * Uses the pale-green "fixed" tint + dark-green "on" text pairing from the
 * Stitch palette (`primaryFixed` / `onPrimaryFixed`, ~13.3:1, well past AA
 * — see `src/theme/colors.ts`) for a pastel, celebratory-badge look
 * distinct from `PrimaryButton`'s solid CTA fill.
 */
export function CelebrationBanner({ message, onDone, visibleDuration = 1600 }: CelebrationBannerProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      const animInDuration = reduced ? 0 : 300;
      const animOutDuration = reduced ? 0 : 300;

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: animInDuration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: animInDuration, useNativeDriver: true }),
      ]).start(() => {
        if (cancelled) return;
        timeoutId = setTimeout(() => {
          if (cancelled) return;
          Animated.timing(opacity, { toValue: 0, duration: animOutDuration, useNativeDriver: true }).start(({ finished }) => {
            if (finished) onDone();
          });
        }, visibleDuration);
      });
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View pointerEvents="none" style={[styles.banner, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primaryFixed,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 10,
    elevation: 4,
  },
  emoji: { fontSize: 16, marginRight: spacing.xs },
  message: { color: palette.onPrimaryFixed, fontWeight: '700', fontSize: 14 },
});
