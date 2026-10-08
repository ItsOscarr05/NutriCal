import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export interface ArcSegment {
  value: number;
  color: string;
}

const VIEWBOX = 120;
const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** The gauge is a 270° horseshoe, open at the bottom. */
const ARC_LENGTH = CIRCUMFERENCE * 0.75;
const SEGMENT_GAP = 2;

/**
 * A segmented 270° "horseshoe" gauge (v2 Stitch Targets/Home mockups):
 * each segment's arc length is proportional to its share of the summed
 * values, drawn on a track. Static, so there's nothing to skip for
 * reduce-motion.
 */
export function EnergyArcGauge({
  size,
  strokeWidth = 9,
  segments,
  trackColor,
  children,
}: {
  size: number;
  strokeWidth?: number;
  segments: ArcSegment[];
  trackColor: string;
  children?: ReactNode;
}) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  let offset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
        <G transform={`rotate(135 ${VIEWBOX / 2} ${VIEWBOX / 2})`}>
          <Circle
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={RADIUS}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          />
          {total > 0 &&
            segments.map((segment, i) => {
              const length = (Math.max(0, segment.value) / total) * ARC_LENGTH;
              const start = offset;
              offset += length;
              const drawn = Math.max(0, length - (i < segments.length - 1 ? SEGMENT_GAP : 0));
              return (
                <Circle
                  key={i}
                  cx={VIEWBOX / 2}
                  cy={VIEWBOX / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${drawn} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-start}
                />
              );
            })}
        </G>
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});
