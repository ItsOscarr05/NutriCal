import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  /** Starting vertical offset in px — settles to 0. Set to 0 to disable the slide and only fade. */
  translateYFrom?: number;
}

/**
 * Fades (and gently slides up) its children in on mount. A small,
 * dependency-free entrance primitive used for the "the results screen
 * should feel alive" moments in PRD §11.3, and reused on the welcome
 * screen's hero illustration for the same reason. Respects the OS
 * "reduce motion" accessibility setting (renders in its final state
 * immediately rather than animating).
 */
export function FadeInView({ children, delay = 0, duration = 500, style, translateYFrom = 12 }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYFrom)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration, delay, useNativeDriver: true }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
    // Intentionally only re-runs if the animation identity changes — this is
    // a one-shot mount animation, not something that should replay on every
    // prop change of the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
