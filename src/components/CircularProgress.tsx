import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GradientStop {
  offset: string;
  color: string;
}

interface CircularProgressProps {
  /** Outer rendered size (width == height), in dp. */
  size: number;
  strokeWidth: number;
  /** 0-100. */
  progress: number;
  trackColor: string;
  /** Solid arc color. Ignored if `gradientStops` is provided. */
  progressColor?: string;
  /** 2-3 stop diagonal gradient for the arc, e.g. the calorie dial's green sweep. */
  gradientStops?: GradientStop[];
  duration?: number;
  /** Rendered centered on top of the ring (e.g. the calorie/kcal score card). */
  children?: React.ReactNode;
}

/**
 * An SVG progress ring — PRD §11.3's "progress rings ... filling in on
 * load." Ported from the Stitch mockups' dial markup (calorie dial +
 * per-macro mini rings on the Targets Dashboard): a track circle plus a
 * rotated (-90deg, so it starts at 12 o'clock) arc circle whose
 * `strokeDashoffset` animates from "empty" to `progress`.
 *
 * `react-native-svg` doesn't support CSS drop-shadow filters (the mockup's
 * `softGlow`), so any glow/elevation is left to the wrapping card's normal
 * RN shadow/elevation style instead — cheaper and cross-platform-safe.
 *
 * Respects "reduce motion" like the other animation primitives in this
 * directory (`AnimatedNumber`, `AnimatedFillBar`): jumps straight to the
 * final ring position instead of animating.
 */
export function CircularProgress({
  size,
  strokeWidth,
  progress,
  trackColor,
  progressColor,
  gradientStops,
  duration = 900,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));

  const anim = useRef(new Animated.Value(0)).current;
  const gradientId = useRef(`circularProgressGradient-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        anim.setValue(clamped);
        return;
      }
      anim.setValue(0);
      Animated.timing(anim, { toValue: clamped, duration, useNativeDriver: false }).start();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped, duration]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const stroke = gradientStops ? `url(#${gradientId})` : progressColor ?? trackColor;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.rotated}>
        {gradientStops ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientStops.map((stop) => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </LinearGradient>
          </Defs>
        ) : null}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      {children ? <View style={StyleSheet.absoluteFill}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rotated: {
    transform: [{ rotate: '-90deg' }],
  },
});
