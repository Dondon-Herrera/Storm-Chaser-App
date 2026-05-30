import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChaseAlertBanner } from '@/components/ui/chase-alert-banner';
import { ChaseScoreCard } from '@/components/ui/chase-score-card';
import { FieldDashboardCard } from '@/components/ui/field-dashboard';
import { Icons } from '@/components/ui/icons';
import { ForecastOutlook } from '@/components/ui/forecast-outlook';
import { IconAction } from '@/components/ui/icon-action';
import { NwsAlertsPanel } from '@/components/ui/nws-alerts-panel';
import { useNwsAlerts } from '@/hooks/use-nws-alerts';
import { navigateTo } from '@/lib/navigation';
import { notifyChaseReadiness } from '@/lib/notifications';
import { MetricTile } from '@/components/ui/metric-tile';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SkeletonMetricGrid, SkeletonWeatherHero } from '@/components/ui/skeleton';
import { useFieldDashboard } from '@/hooks/use-field-dashboard';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useTheme } from '@/hooks/use-theme';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';
import { loadWeatherForDevice } from '@/lib/load-weather';
import { getChaseBrief, getChaseReadiness } from '@/lib/storm-intelligence';
import type { WeatherData } from '@/lib/weather';

type LoadState = 'loading' | 'ready' | 'not-found';

export default function WeatherScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [message, setMessage] = useState('Scanning atmosphere near your position…');
  const [refreshing, setRefreshing] = useState(false);
  const fieldDashboard = useFieldDashboard();
  const nwsAlerts = useNwsAlerts();
  const nwsCoordsKeyRef = useRef<string | null>(null);
  const { titleFontSize, subtitleFontSize, metricMinWidth } = useResponsiveLayout();
  const theme = useTheme();

  const applyWeatherResult = useCallback(
    (result: Awaited<ReturnType<typeof loadWeatherForDevice>>, options?: { hapticOnSuccess?: boolean }) => {
      if (result.status === 'ready') {
        setWeather(result.weather);
        setStatus('ready');
        if (result.message) {
          setMessage(result.message);
        }
        if (options?.hapticOnSuccess) {
          void hapticSuccess();
        }
        return;
      }

      setWeather(null);
      setStatus('not-found');
      setMessage(result.message);
      if (options?.hapticOnSuccess) {
        void hapticWarning();
      }
    },
    []
  );

  const refreshWeather = useCallback(async () => {
    setRefreshing(true);
    if (!weather) {
      setStatus('loading');
      setMessage('Scanning atmosphere near your position…');
    }

    const result = await loadWeatherForDevice();
    applyWeatherResult(result, { hapticOnSuccess: true });
    setRefreshing(false);
  }, [applyWeatherResult, weather]);

  const readiness = useMemo(() => (weather ? getChaseReadiness(weather) : null), [weather]);

  const chaseBrief = useMemo(
    () => (weather && readiness ? getChaseBrief(weather, readiness) : null),
    [weather, readiness]
  );

  const showDashboard = weather != null && readiness != null && status !== 'not-found';

  useEffect(() => {
    if (!showDashboard || !weather) {
      nwsCoordsKeyRef.current = null;
      return;
    }

    const coordsKey = `${weather.latitude},${weather.longitude}`;
    if (nwsCoordsKeyRef.current === coordsKey) {
      return;
    }
    nwsCoordsKeyRef.current = coordsKey;

    const currentReadiness = getChaseReadiness(weather);
    void notifyChaseReadiness(currentReadiness);
    void nwsAlerts.loadAlerts(weather.latitude, weather.longitude);
    // Only stable primitives + loadAlerts — never the whole `nwsAlerts` object (new reference each render → infinite loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- weather lat/lon covered above
  }, [weather?.latitude, weather?.longitude, showDashboard, nwsAlerts.loadAlerts]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loadWeatherForDevice();
      if (!cancelled) {
        applyWeatherResult(result);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyWeatherResult]);

  return (
    <ScreenShell
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshWeather} tintColor={theme.accentSecondary} />
      }>
      <ScreenHeader
        eyebrow="Live intelligence"
        title="Storm Command"
        subtitle="Real-time chase readiness, field metrics, and tactical forecast."
        titleSize={titleFontSize}
        subtitleSize={subtitleFontSize}
        actions={
          <>
            <IconAction
              label="Refresh"
              icon={Icons.refresh}
              variant="primary"
              onPress={refreshWeather}
              disabled={refreshing}
            />
            <IconAction label="Live map" icon={Icons.map} onPress={() => navigateTo(router, '/map')} />
            <IconAction label="Log storm" icon={Icons.camera} onPress={() => navigateTo(router, '/log/new')} />
          </>
        }
      />

      <FieldDashboardCard
        data={fieldDashboard}
        onOpenLog={() => navigateTo(router, '/log')}
        onOpenMap={() => navigateTo(router, '/map')}
        onOpenLatest={
          fieldDashboard.latestReport?.id != null
            ? () => navigateTo(router, `/log/${fieldDashboard.latestReport!.id}`)
            : undefined
        }
      />

      {status === 'loading' && !weather ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
          <SkeletonWeatherHero />
          <SkeletonMetricGrid />
        </>
      ) : null}

      {status === 'not-found' && !weather ? (
        <Card style={styles.statusCard} accessibilityRole="alert">
          <ThemedText type="title" accessibilityRole="header">
            Not Found
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
          <Button title="Try again" onPress={refreshWeather} size="lg" />
        </Card>
      ) : null}

      {weather?.isMock && showDashboard ? (
        <Card style={styles.mockBanner}>
          <ThemedText type="smallBold" style={{ color: theme.warning }}>
            Mock weather data
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            EXPO_PUBLIC_USE_MOCK_WEATHER is enabled for assessment demos.
          </ThemedText>
        </Card>
      ) : null}

      {weather?.isCached && showDashboard ? (
        <Card style={styles.offlineBanner}>
          <ThemedText type="smallBold" style={{ color: theme.warning }}>
            Offline mode
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Last successful uplink stored on device.
          </ThemedText>
        </Card>
      ) : null}

      {showDashboard && weather && readiness ? (
        <>
          <ChaseAlertBanner readiness={readiness} />
          <NwsAlertsPanel alerts={nwsAlerts.alerts} loading={nwsAlerts.loading} error={nwsAlerts.error} />
          <ChaseScoreCard weather={weather} readiness={readiness} />

          <View style={styles.metricsGrid}>
            <MetricTile label="Wind" value={`${weather.windSpeed.toFixed(0)} km/h`} icon={Icons.wind} minWidth={metricMinWidth} />
            <MetricTile
              label="Precipitation"
              value={weather.precipitation != null ? `${weather.precipitation.toFixed(1)} mm` : '—'}
              icon={Icons.rain}
              minWidth={metricMinWidth}
              accentColor={theme.accent}
            />
            <MetricTile
              label="Rain chance"
              value={weather.precipitationProbability != null ? `${weather.precipitationProbability}%` : '—'}
              icon={Icons.rain}
              minWidth={metricMinWidth}
            />
            <MetricTile
              label="Coordinates"
              value={`${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°`}
              icon={Icons.location}
              minWidth={metricMinWidth}
            />
            <MetricTile
              label="Updated"
              value={new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              icon={Icons.clock}
              minWidth={metricMinWidth}
            />
          </View>

          <Card>
            <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
              Chase brief
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {chaseBrief}
            </ThemedText>
            {readiness.factors.map((factor) => (
              <View key={factor} style={[styles.factorRow, { borderColor: theme.surfaceBorder }]}>
                <View style={[styles.factorDot, { backgroundColor: readiness.color }]} />
                <ThemedText type="small">{factor}</ThemedText>
              </View>
            ))}
          </Card>

          {weather.forecast?.length ? <ForecastOutlook days={weather.forecast} /> : null}

          <View style={styles.ctaRow}>
            <Button title="Open tactical map" size="lg" onPress={() => navigateTo(router, '/map')} />
            <Button title="Document storm" variant="outline" size="lg" onPress={() => navigateTo(router, '/log/new')} />
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#FBBF24',
  },
  mockBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  statusCard: {
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ctaRow: {
    gap: 12,
    marginTop: 4,
  },
});
