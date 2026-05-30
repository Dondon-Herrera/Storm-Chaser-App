import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getWeatherSymbol } from '@/lib/storm-intelligence';
import type { ForecastDay } from '@/lib/weather';

type ForecastOutlookProps = {
  days: ForecastDay[];
};

export function ForecastOutlook({ days }: ForecastOutlookProps) {
  const theme = useTheme();
  const outlook = days.slice(0, 5);
  const maxRain = Math.max(...outlook.map((d) => d.precipitationProbability ?? 0), 1);
  const globalHigh = Math.max(...outlook.map((d) => d.maxTemperature));
  const globalLow = Math.min(...outlook.map((d) => d.minTemperature));
  const tempSpan = Math.max(globalHigh - globalLow, 1);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
            5-day outlook
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            Hourly-resolution daily guidance
          </ThemedText>
        </View>
        <View style={[styles.rangePill, { borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">
            {globalLow.toFixed(0)}° – {globalHigh.toFixed(0)}°
          </ThemedText>
        </View>
      </View>

      <View style={styles.strip}>
        {outlook.map((day, index) => {
          const rain = day.precipitationProbability ?? 0;
          const rainHeight = Math.max(12, (rain / maxRain) * 56);
          const lowOffset = ((day.minTemperature - globalLow) / tempSpan) * 48;
          const highOffset = ((day.maxTemperature - globalLow) / tempSpan) * 48;
          const barTop = 48 - highOffset;
          const barHeight = Math.max(8, highOffset - lowOffset);
          const isToday = index === 0;
          const symbol = getWeatherSymbol(day.weatherCode);

          return (
            <View
              key={day.date}
              style={[
                styles.dayColumn,
                {
                  borderColor: isToday ? theme.accentSecondary : theme.surfaceBorder,
                  backgroundColor: isToday ? 'rgba(34, 211, 238, 0.1)' : theme.backgroundSelected,
                },
              ]}>
              <ThemedText type="smallBold" style={isToday ? { color: theme.accentSecondary } : undefined}>
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted" style={styles.dateLabel}>
                {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </ThemedText>

              <SymbolView name={symbol} size={22} tintColor={isToday ? theme.accentSecondary : theme.text} />

              <View style={styles.tempTrack}>
                <View
                  style={[
                    styles.tempBar,
                    {
                      top: barTop,
                      height: barHeight,
                      backgroundColor: isToday ? theme.accentSecondary : theme.accent,
                    },
                  ]}
                />
              </View>

              <ThemedText type="smallBold">{day.maxTemperature.toFixed(0)}°</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {day.minTemperature.toFixed(0)}°
              </ThemedText>

              <View style={styles.rainTrack}>
                <View style={[styles.rainFill, { height: rainHeight, backgroundColor: `${theme.accentSecondary}88` }]} />
              </View>
              <ThemedText type="small" style={{ color: theme.accentSecondary }}>
                {rain}%
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.condition}>
                {day.weatherDescription}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  rangePill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  strip: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.three,
    paddingHorizontal: 6,
    borderRadius: Radii.normal,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 11,
    marginTop: -4,
  },
  tempTrack: {
    width: 10,
    height: 52,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginVertical: 4,
  },
  tempBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 6,
  },
  rainTrack: {
    width: '80%',
    height: 56,
    justifyContent: 'flex-end',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  rainFill: {
    width: '100%',
    borderRadius: 6,
  },
  condition: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    minHeight: 28,
  },
});
