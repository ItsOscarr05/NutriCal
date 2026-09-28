import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface MascotProps {
  size?: number;
}

/**
 * NutriCal's mascot — a round, chubby sprout/carrot character, ported from
 * the Stitch mockups' inline SVG (kept faithful to its exact paths/colors
 * rather than re-drawn) into `react-native-svg`. Matches the illustration
 * style guide in AGENTS.md: friendly rounded flat-vector "kawaii" look,
 * simple dot eyes, a smile, thick clean outlines, soft flat shading, brand
 * green as the dominant color, no text/clinical iconography.
 *
 * Only two of the mockup's several CSS `@keyframes` are ported to RN
 * `Animated` (a gentle continuous float/bob, and a periodic blink) — the
 * rest (leaf wiggle, blush pulse, sparkle bob) are kept as static art to
 * avoid over-animating a small header illustration. Both animations
 * respect "reduce motion" like every other primitive in this directory,
 * skipping straight to a static resting pose when it's on.
 */
export function Mascot({ size = 80 }: MascotProps) {
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    let bobLoop: Animated.CompositeAnimation | undefined;
    let blinkLoop: Animated.CompositeAnimation | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;

      bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ]),
      );
      bobLoop.start();

      blinkLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(3800),
          Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: false }),
          Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: false }),
        ]),
      );
      blinkLoop.start();
    });

    return () => {
      cancelled = true;
      bobLoop?.stop();
      blinkLoop?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const eyeRy = Animated.multiply(blink, 6);

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="mascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#15803D" />
          </LinearGradient>
          <LinearGradient id="mascotLeafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#16A34A" />
            <Stop offset="100%" stopColor="#4ADE80" />
          </LinearGradient>
        </Defs>

        {/* Ambient shadow ground circle */}
        <Ellipse cx="100" cy="180" rx="42" ry="7" fill="#E2E8F0" opacity={0.6} />

        {/* Leaves sprouting on top */}
        <Path d="M100 58 C92 34, 95 18, 100 12 C105 18, 108 34, 100 58 Z" fill="url(#mascotLeafGrad)" />
        <Path d="M96 56 C78 40, 68 28, 62 25 C64 36, 78 50, 93 59 Z" fill="#86EFAC" />
        <Path d="M104 56 C122 40, 132 28, 138 25 C136 36, 122 50, 107 59 Z" fill="#4ADE80" />
        <Ellipse cx="100" cy="58" rx="8" ry="3.5" fill="#15803D" opacity={0.4} />

        {/* Round chubby body */}
        <Path
          d="M100 56 C128 56, 148 78, 148 114 C148 148, 126 172, 100 172 C74 172, 52 148, 52 114 C52 78, 72 56, 100 56 Z"
          fill="url(#mascotBodyGrad)"
        />
        {/* Belly patch */}
        <Path
          d="M100 85 C118 85, 132 102, 132 128 C132 153, 118 165, 100 165 C82 165, 68 153, 68 128 C68 102, 82 85, 100 85 Z"
          fill="#DCFCE7"
        />

        {/* Eyes (blink by animating ry directly — more reliable across react-native-svg
            versions than an SVG-element `style.transform`, and mirrors the same
            "animate a numeric SVG attribute via AnimatedComponent" idiom used for
            `strokeDashoffset` in `CircularProgress`). */}
        <AnimatedEllipse cx="86" cy="116" rx="4.5" ry={eyeRy} fill="#0F172A" />
        <Circle cx="84.5" cy="114" r="2" fill="#FFFFFF" />
        <AnimatedEllipse cx="114" cy="116" rx="4.5" ry={eyeRy} fill="#0F172A" />
        <Circle cx="112.5" cy="114" r="2" fill="#FFFFFF" />

        {/* Smile */}
        <Path d="M94 125 Q100 131 106 125" fill="none" stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" />

        {/* Blush */}
        <Ellipse cx="76" cy="124" rx="5" ry="3.5" fill="#F43F5E" opacity={0.65} />
        <Ellipse cx="124" cy="124" rx="5" ry="3.5" fill="#F43F5E" opacity={0.65} />

        {/* Body highlight */}
        <Path d="M68 85 C62 98, 60 115, 62 130" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.4} />

        {/* Sparkle stars */}
        <Path d="M148 48 Q152 48 152 44 Q152 48 156 48 Q152 48 152 52 Q152 48 148 48 Z" fill="#F59E0B" />
        <Circle cx="52" cy="72" r="3" fill="#FBBF24" opacity={0.9} />
      </Svg>
    </Animated.View>
  );
}
