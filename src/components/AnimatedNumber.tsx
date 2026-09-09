import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleProp, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  suffix?: string;
}

/**
 * Counts up from 0 to `value` on mount — PRD §11.3: "calorie/macro numbers
 * animating up as they calculate ... these moments are what make the
 * 'reveal your numbers' experience feel rewarding." Built on the built-in
 * `Animated` API (no extra dependency) — `useNativeDriver: false` is
 * required here since we're reading the raw numeric value each frame to
 * render text, not just driving a transform/opacity style.
 *
 * Respects the OS "reduce motion" accessibility setting by jumping
 * straight to the final value instead of animating.
 */
export function AnimatedNumber({ value, duration = 900, style, suffix = '' }: AnimatedNumberProps) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let listenerId: string | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        setDisplay(value);
        return;
      }
      animated.setValue(0);
      listenerId = animated.addListener(({ value: v }) => setDisplay(Math.round(v)));
      Animated.timing(animated, { toValue: value, duration, useNativeDriver: false }).start();
    });

    return () => {
      cancelled = true;
      if (listenerId !== undefined) {
        animated.removeListener(listenerId);
      }
    };
  }, [value, duration, animated]);

  return (
    <Text style={style}>
      {display}
      {suffix}
    </Text>
  );
}
