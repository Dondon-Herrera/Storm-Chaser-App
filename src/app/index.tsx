import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchWeatherData, getCachedWeatherData, getCurrentLocation, requestLocationPermissions, type WeatherData } from '@/lib/weather';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [message, setMessage] = useState('Checking location and weather data…');
  const [refreshing, setRefreshing] = useState(false);
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    top: safeAreaInsets.top,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  useEffect(() => {
    refreshWeather();
  }, []);

  async function refreshWeather() {
    setRefreshing(true);
    setStatus('loading');
    setMessage('Checking location and weather data…');

    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        const cachedWeather = await getCachedWeatherData();
        if (cachedWeather) {
          setWeather(cachedWeather);
          setStatus('ready');
          setMessage('Location access denied: showing last cached weather data.');
          return;
        }

        setStatus('not-found');
        setMessage('Location access is required to fetch storm-ready weather data.');
        return;
      }

      const location = await getCurrentLocation();
      if (!location?.coords) {
        const cachedWeather = await getCachedWeatherData();
        if (cachedWeather) {
          setWeather(cachedWeather);
          setStatus('ready');
          setMessage('Unable to access location: showing last cached weather data.');
          return;
        }

        setStatus('not-found');
        setMessage('Unable to determine your current location.');
        return;
      }

      const weatherData = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      setWeather(weatherData);
      setStatus('ready');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Weather information could not be retrieved. Try again later.');
    } finally {
      setRefreshing(false);
    }
  }

  const renderStatusBanner = () => {
    if (status === 'loading') {
      return (
        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.loadingText}>
              {message}
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (status === 'not-found' || status === 'error') {
      return (
        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <ThemedText type="smallBold">Weather not found</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
            {message}
          </ThemedText>
          <Pressable style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshButtonPressed]} onPress={refreshWeather}>
            <ThemedText type="link">Try again</ThemedText>
          </Pressable>
        </ThemedView>
      );
    }

    return null;
  };

  const renderCacheBanner = () => {
    if (!weather?.isCached || status !== 'ready') {
      return null;
    }

    return (
      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <ThemedText type="smallBold">Offline weather</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
          Showing the last successful forecast stored locally.
        </ThemedText>
      </ThemedView>
    );
  };

  const renderWeatherSection = () => {
    if (!weather || status !== 'ready') {
      return null;
    }

    const precipitationLabel = weather.precipitationProbability !== null ? `${weather.precipitationProbability}%` : 'N/A';
    const locationLabel = `${weather.latitude.toFixed(2)}, ${weather.longitude.toFixed(2)}`;

    return (
      <>
        <ThemedView type="backgroundElement" style={styles.highlightCard}>
          <ThemedText type="smallBold">Live conditions</ThemedText>
          <ThemedText type="title" style={styles.temperatureText}>
            {weather.temperature.toFixed(1)}°C
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {weather.weatherDescription}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <ThemedText type="smallBold">Wind</ThemedText>
            <ThemedText type="default">{weather.windSpeed.toFixed(0)} km/h</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="smallBold">Chance of rain</ThemedText>
            <ThemedText type="default">{precipitationLabel}</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="smallBold">Location</ThemedText>
            <ThemedText type="default">{locationLabel}</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="smallBold">As of</ThemedText>
            <ThemedText type="default">{new Date(weather.time).toLocaleTimeString()}</ThemedText>
          </View>
        </ThemedView>
      </>
    );
  };

  const renderForecastSection = () => {
    if (!weather?.forecast?.length || status !== 'ready') {
      return null;
    }

    return (
      <ThemedView type="backgroundElement" style={styles.forecastCard}>
        <ThemedText type="smallBold">5-day forecast</ThemedText>
        <View style={styles.forecastGrid}>
          {weather.forecast.slice(0, 5).map((day) => (
            <ThemedView key={day.date} type="backgroundElement" style={styles.forecastDay}>
              <ThemedText type="smallBold">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {day.weatherDescription}
              </ThemedText>
              <ThemedText type="default">
                {day.minTemperature.toFixed(0)}° / {day.maxTemperature.toFixed(0)}°
              </ThemedText>
              <ThemedText type="small">Rain {day.precipitationProbability ?? 0}%</ThemedText>
            </ThemedView>
          ))}
        </View>
      </ThemedView>
    );
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshWeather} tintColor={theme.text} />}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
    >
      <ThemedView style={styles.wrapper}>
        <ThemedText type="title" style={styles.title}>
          Storm Chaser Forecast
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
          Weather updates for the current location and important storm details at a glance.
        </ThemedText>

        {renderStatusBanner()}
        {renderCacheBanner()}
        {renderWeatherSection()}
        {renderForecastSection()}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    maxWidth: 560,
  },
  statusCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  highlightCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
  },
  metricItem: {
    minWidth: '45%',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardText: {
    marginTop: Spacing.one,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    marginLeft: Spacing.two,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  refreshButtonPressed: {
    opacity: 0.75,
  },
  temperatureText: {
    marginTop: Spacing.one,
  },
  forecastCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  forecastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
  },
  forecastDay: {
    width: '48%',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
