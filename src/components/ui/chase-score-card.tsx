import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/ui/gradient-surface';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { ChaseReadiness } from '@/lib/storm-intelligence';
import { getWeatherSymbol } from '@/lib/storm-intelligence';
import type { WeatherData } from '@/lib/weather';

type ChaseScoreCardProps = {
  weather: WeatherData;
  readiness: ChaseReadiness;
};

export function ChaseScoreCard({ weather, readiness }: ChaseScoreCardProps) {
  const symbol = getWeatherSymbol(weather.weatherCode);

  return (
    <GradientSurface
      variant="hero"
      style={styles.hero}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Chase readiness ${readiness.score} out of 100. ${readiness.label}. ${weather.temperature.toFixed(0)} degrees. ${weather.weatherDescription}`}>
      <View style={styles.row}>
        <View style={styles.tempBlock}>
          <SymbolView name={symbol} size={36} tintColor="#fff" />
          <ThemedText style={styles.temp}>{weather.temperature.toFixed(0)}°</ThemedText>
          <ThemedText type="small" style={styles.condition}>
            {weather.weatherDescription}
          </ThemedText>
        </View>
        <View style={[styles.scoreRing, { borderColor: readiness.color }]}>
          <ThemedText style={[styles.scoreValue, { color: readiness.color }]}>{readiness.score}</ThemedText>
          <ThemedText type="small" style={styles.scoreLabel}>
            CHASE
          </ThemedText>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: `${readiness.color}33`, borderColor: readiness.color }]}>
        <ThemedText type="smallBold" style={{ color: readiness.color }}>
          {readiness.label}
        </ThemedText>
      </View>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  tempBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  temp: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 60,
  },
  condition: {
    color: 'rgba(255,255,255,0.82)',
  },
  scoreRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  badge: {
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
});
