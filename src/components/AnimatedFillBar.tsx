import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

interface AnimatedFillBarProps {
  /** 0-100 */
  percent: number;
  fillColor: string;
  trackColor: string;
  height?: number;
  duration?: number;
}

/**
 * A horizontal bar that fills to `percent` on mount — PRD §11.3: "progress
 * rings or bars filling in on load." A bar (rather than an SVG ring) keeps
 * this dependency-free; revisit with a ring if `react-native-svg` gets
 * added for other reasons later.
 */
export function AnimatedFillBar({ percent, fillColor, trackColor, height = 6, duration = 900 }: AnimatedFillBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        widthAnim.setValue(percent);
        return;
      }
      widthAnim.setValue(0);
      Animated.timing(widthAnim, { toValue: percent, duration, useNativeDriver: false }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [percent, duration, widthAnim]);

  const width = widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: fillColor, width, height, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
