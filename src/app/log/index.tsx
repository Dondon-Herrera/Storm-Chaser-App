import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { IconAction } from '@/components/ui/icon-action';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useTheme } from '@/hooks/use-theme';
import { navigateTo } from '@/lib/navigation';
import { getStormTypeColor } from '@/lib/storm-intelligence';
import { getStormReports, type StormReport } from '@/lib/storage';

export default function StormLogScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<StormReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { titleFontSize, subtitleFontSize } = useResponsiveLayout();
  const theme = useTheme();

  const reloadReports = useCallback(() => {
    setLoading(true);
    setError(null);

    void getStormReports()
      .then((saved) => setReports(saved))
      .catch((err) => {
        console.error(err);
        setError('Could not load storm reports. Pull to refresh or try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadReports();
    }, [reloadReports])
  );

  const summary = useMemo(() => {
    if (!reports.length) return null;
    const types = new Set(reports.map((r) => r.stormType));
    const strongest = reports.reduce((a, b) => (b.windSpeed > a.windSpeed ? b : a));
    return { total: reports.length, types: types.size, strongest };
  }, [reports]);

  return (
    <ScreenShell
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={reloadReports} tintColor={theme.accentSecondary} />
      }>
      <ScreenHeader
        eyebrow="Field archive"
        title="Storm Log"
        subtitle="Photo evidence, coordinates, and weather context for every intercept."
        titleSize={titleFontSize}
        subtitleSize={subtitleFontSize}
        actions={
          <>
            <IconAction
              label="New intercept"
              icon={Icons.add}
              variant="primary"
              onPress={() => navigateTo(router, '/log/new')}
            />
            <IconAction
              label="Refresh"
              icon={Icons.refresh}
              onPress={reloadReports}
              disabled={loading}
            />
          </>
        }
      />

      {summary ? (
        <View style={styles.statsRow}>
          <Card style={styles.stat}>
            <ThemedText type="small" themeColor="textMuted">
              Reports
            </ThemedText>
            <ThemedText style={styles.statNum}>{summary.total}</ThemedText>
          </Card>
          <Card style={styles.stat}>
            <ThemedText type="small" themeColor="textMuted">
              Types
            </ThemedText>
            <ThemedText style={styles.statNum}>{summary.types}</ThemedText>
          </Card>
          <Card style={styles.stat}>
            <ThemedText type="small" themeColor="textMuted">
              Peak wind
            </ThemedText>
            <ThemedText style={styles.statNum}>{summary.strongest.windSpeed.toFixed(0)}</ThemedText>
          </Card>
        </View>
      ) : null}

      {error ? (
        <Card style={styles.empty}>
          <ThemedText type="smallBold">Archive unavailable</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <Button title="Retry" onPress={reloadReports} />
        </Card>
      ) : loading ? (
        <Card style={styles.loading}>
          <ActivityIndicator color={theme.accentSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            Syncing field archive…
          </ThemedText>
        </Card>
      ) : reports.length === 0 ? (
        <Card style={styles.empty}>
          <ThemedText type="smallBold">Archive empty</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Capture lightning, hail, or wind events with GPS-tagged photos and auto weather metadata.
          </ThemedText>
          <Button title="Document first storm" size="lg" onPress={() => navigateTo(router, '/log/new')} />
        </Card>
      ) : (
        reports.map((report, index) => {
          const accent = getStormTypeColor(report.stormType);
          return (
            <Pressable
              key={report.id?.toString() ?? report.dateTime}
              onPress={() => report.id != null && navigateTo(router, `/log/${report.id}`)}>
              <Card style={[styles.reportCard, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
                <View style={styles.reportTop}>
                  <View>
                    <ThemedText type="small" themeColor="textMuted">
                      Intercept #{reports.length - index}
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ color: accent }}>
                      {report.stormType}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {new Date(report.dateTime).toLocaleDateString()}
                  </ThemedText>
                </View>
                <Image source={{ uri: report.photoUri }} style={styles.photo} contentFit="cover" />
                <ThemedText type="small" numberOfLines={2}>
                  {report.weatherCondition}
                </ThemedText>
                <View style={styles.metaRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {report.latitude.toFixed(2)}°, {report.longitude.toFixed(2)}°
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.accentSecondary }}>
                    {report.windSpeed.toFixed(0)} km/h · Rain {report.precipitationProbability ?? 0}%
                  </ThemedText>
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    padding: 14,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  empty: {
    gap: 12,
  },
  reportCard: {
    gap: 10,
    overflow: 'hidden',
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
});
