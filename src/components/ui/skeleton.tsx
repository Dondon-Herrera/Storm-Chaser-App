import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/card';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
};

export function SkeletonBlock({ width = '100%', height = 14, style, borderRadius = Radii.small }: SkeletonBlockProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSelected,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ children }: { children?: React.ReactNode }) {
  return (
    <Card style={styles.card}>
      {children ?? (
        <>
          <SkeletonBlock width="40%" height={12} />
          <SkeletonBlock width="70%" height={20} />
          <SkeletonBlock height={48} borderRadius={Radii.normal} />
        </>
      )}
    </Card>
  );
}

export function SkeletonWeatherHero() {
  return (
    <SkeletonCard>
      <View style={styles.heroRow}>
        <View style={styles.heroLeft}>
          <SkeletonBlock width={80} height={36} />
          <SkeletonBlock width={120} height={14} />
        </View>
        <SkeletonBlock width={72} height={72} borderRadius={36} />
      </View>
      <SkeletonBlock width="50%" height={28} borderRadius={Radii.pill} />
    </SkeletonCard>
  );
}

export function SkeletonMetricGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.metricGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <SkeletonBlock width="50%" height={10} />
          <SkeletonBlock width="65%" height={22} />
        </SkeletonCard>
      ))}
    </View>
  );
}

export function SkeletonReportList({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <SkeletonBlock width="35%" height={12} />
          <SkeletonBlock height={160} borderRadius={Radii.large} />
          <SkeletonBlock width="90%" height={12} />
          <SkeletonBlock width="60%" height={12} />
        </SkeletonCard>
      ))}
    </>
  );
}

export function SkeletonMapPanel() {
  return (
    <SkeletonCard>
      <SkeletonBlock width="45%" height={14} />
      <SkeletonBlock height={220} borderRadius={Radii.large} />
      <SkeletonBlock width="80%" height={12} />
    </SkeletonCard>
  );
}

const styles = StyleSheet.create({
  block: {},
  card: {
    gap: Spacing.three,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    gap: Spacing.two,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
