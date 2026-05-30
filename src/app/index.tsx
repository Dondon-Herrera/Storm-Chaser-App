import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

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
import { useFieldDashboard } from '@/hooks/use-field-dashboard';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useTheme } from '@/hooks/use-theme';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';
import { getChaseBrief, getChaseReadiness } from '@/lib/storm-intelligence';
import {
  fetchWeatherData,
  getCachedWeatherData,
  getCurrentLocation,
  requestLocationPermissions,
  type WeatherData,
} from '@/lib/weather';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export default function WeatherScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [message, setMessage] = useState('Scanning atmosphere near your position…');
  const [refreshing, setRefreshing] = useState(false);
  const fieldDashboard = useFieldDashboard();
  const nwsAlerts = useNwsAlerts();
  const { titleFontSize, subtitleFontSize, metricMinWidth } = useResponsiveLayout();
  const theme = useTheme();

  const refreshWeather = useCallback(async () => {
    setRefreshing(true);
    setStatus('loading');
    setMessage('Scanning atmosphere near your position…');

    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        const cachedWeather = await getCachedWeatherData();
        if (cachedWeather) {
          setWeather(cachedWeather);
          setStatus('ready');
          setMessage('Location off — showing cached intelligence.');
          return;
        }
        setStatus('not-found');
        setMessage('Enable location for live storm intelligence.');
        return;
      }

      const location = await getCurrentLocation();
      if (!location?.coords) {
        const cachedWeather = await getCachedWeatherData();
        if (cachedWeather) {
          setWeather(cachedWeather);
          setStatus('ready');
          setMessage('GPS unavailable — cached data loaded.');
          return;
        }
        setStatus('not-found');
        setMessage('Could not resolve your chase coordinates.');
        return;
      }

      const weatherData = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      setWeather(weatherData);
      setStatus('ready');
      void hapticSuccess();
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Forecast uplink failed. Pull to refresh.');
      void hapticWarning();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const readiness = useMemo(() => (weather ? getChaseReadiness(weather) : null), [weather]);

  const chaseBrief = useMemo(
    () => (weather && readiness ? getChaseBrief(weather, readiness) : null),
    [weather, readiness]
  );

  useEffect(() => {
    if (status !== 'ready' || !weather) {
      return;
    }

    const currentReadiness = getChaseReadiness(weather);
    void notifyChaseReadiness(currentReadiness);
    void nwsAlerts.loadAlerts(weather.latitude, weather.longitude);
  }, [weather, status, nwsAlerts.loadAlerts]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
          const cachedWeather = await getCachedWeatherData();
          if (!cancelled && cachedWeather) {
            setWeather(cachedWeather);
            setStatus('ready');
            setMessage('Location off — showing cached intelligence.');
          } else if (!cancelled) {
            setStatus('not-found');
            setMessage('Enable location for live storm intelligence.');
          }
          return;
        }

        const location = await getCurrentLocation();
        if (!location?.coords) {
          const cachedWeather = await getCachedWeatherData();
          if (!cancelled && cachedWeather) {
            setWeather(cachedWeather);
            setStatus('ready');
            setMessage('GPS unavailable — cached data loaded.');
          } else if (!cancelled) {
            setStatus('not-found');
            setMessage('Could not resolve your chase coordinates.');
          }
          return;
        }

        const weatherData = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
        if (!cancelled) {
          setWeather(weatherData);
          setStatus('ready');
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus('error');
          setMessage('Forecast uplink failed. Pull to refresh.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        <Card style={styles.statusCard}>
          <ActivityIndicator color={theme.accentSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
        </Card>
      ) : null}

      {(status === 'not-found' || status === 'error') && !weather ? (
        <Card style={styles.statusCard}>
          <ThemedText type="smallBold">Signal lost</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
          <Button title="Reconnect" onPress={refreshWeather} size="lg" />
        </Card>
      ) : null}

      {weather?.isCached && status === 'ready' ? (
        <Card style={styles.offlineBanner}>
          <ThemedText type="smallBold" style={{ color: theme.warning }}>
            Offline mode
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Last successful uplink stored on device.
          </ThemedText>
        </Card>
      ) : null}

      {weather && readiness && status === 'ready' ? (
        <>
          <ChaseAlertBanner readiness={readiness} />
          <NwsAlertsPanel alerts={nwsAlerts.alerts} loading={nwsAlerts.loading} error={nwsAlerts.error} />
          <ChaseScoreCard weather={weather} readiness={readiness} />

          <View style={styles.metricsGrid}>
            <MetricTile label="Wind" value={`${weather.windSpeed.toFixed(0)} km/h`} icon={Icons.wind} minWidth={metricMinWidth} />
            <MetricTile
              label="Rain chance"
              value={weather.precipitationProbability != null ? `${weather.precipitationProbability}%` : '—'}
              icon={Icons.rain}
              minWidth={metricMinWidth}
              accentColor={theme.accent}
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#FBBF24',
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
