import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function WeatherScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    top: safeAreaInsets.top,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
    >
      <ThemedView style={styles.wrapper}>
        <ThemedText type="title" style={styles.title}>
          Storm Chaser Forecast
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
          Weather updates for the current location and important storm details at a glance.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <ThemedText type="strong">Current location weather</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
            Fetching live data next. The first release will include temperature, wind speed, and precipitation.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.highlightCard}>
          <ThemedText type="smallBold">Next update</ThemedText>
          <ThemedText type="large" style={styles.metric}>
            0.0°C · 0 km/h · 0% rain
          </ThemedText>
        </ThemedView>
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
  cardText: {
    marginTop: Spacing.one,
  },
  metric: {
    marginTop: Spacing.two,
  },
});
