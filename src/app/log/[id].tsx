import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { useTheme } from '@/hooks/use-theme';
import { navigateToCellWithFeedback } from '@/lib/map-utils';
import { navigateTo } from '@/lib/navigation';
import { getStormTypeColor } from '@/lib/storm-intelligence';
import { deleteStormReport, getStormReportById, type StormReport } from '@/lib/storage';

export default function StormReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<StormReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (typeof id !== 'string') {
      return;
    }

    let cancelled = false;
    const reportId = Number(id);

    void getStormReportById(reportId)
      .then((stored) => {
        if (!cancelled && stored) {
          setReport(stored);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleDeleteReport() {
    const reportId = report?.id;
    if (reportId == null) {
      return;
    }

    Alert.alert('Delete intercept', 'Remove this storm report from the field archive?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteStormReport(reportId)
            .then(() => navigateTo(router, '/log'))
            .catch((error) => console.error(error));
        },
      },
    ]);
  }

  const accent = report ? getStormTypeColor(report.stormType) : theme.accent;

  function handleNavigateToCell() {
    if (!report) {
      return;
    }

    void navigateToCellWithFeedback(report.latitude, report.longitude, report.stormType);
  }

  return (
    <ScreenShell>
      <ScreenHeader
        eyebrow="Intercept dossier"
        title={report?.stormType ?? 'Storm report'}
        subtitle="Full metadata, evidence, and navigation for this documented cell."
      />

      {loading ? (
        <Card style={styles.loading}>
          <ActivityIndicator color={theme.accentSecondary} />
          <ThemedText type="small">Loading dossier…</ThemedText>
        </Card>
      ) : report ? (
        <>
          <Image source={{ uri: report.photoUri }} style={[styles.image, { borderColor: accent }]} contentFit="cover" />

          <Card style={[styles.heroMeta, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {report.stormType}
            </ThemedText>
            <ThemedText type="small">{report.weatherCondition}</ThemedText>
            <View style={styles.metricRow}>
              <ThemedText type="smallBold">{report.temperature.toFixed(1)}°C</ThemedText>
              <ThemedText type="smallBold">{report.windSpeed.toFixed(0)} km/h</ThemedText>
              <ThemedText type="smallBold">Rain {report.precipitationProbability ?? 0}%</ThemedText>
            </View>
          </Card>

          <Card>
            <ThemedText type="smallBold">Field notes</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {report.notes || 'No additional notes recorded.'}
            </ThemedText>
          </Card>

          <Card>
            <ThemedText type="smallBold">Timeline</ThemedText>
            <ThemedText type="small">Observed: {new Date(report.dateTime).toLocaleString()}</ThemedText>
            <ThemedText type="small">Archived: {new Date(report.createdAt).toLocaleString()}</ThemedText>
            <ThemedText type="small" style={{ color: theme.accentSecondary }}>
              {report.latitude.toFixed(4)}°, {report.longitude.toFixed(4)}°
            </ThemedText>
          </Card>

          <View style={styles.actions}>
            <Button title="Navigate to cell" size="lg" onPress={handleNavigateToCell} />
            <Button title="Back to archive" variant="outline" size="lg" onPress={() => navigateTo(router, '/log')} />
            <Button title="Delete intercept" variant="ghost" onPress={handleDeleteReport} />
          </View>
        </>
      ) : (
        <Card>
          <ThemedText type="smallBold">Report not found</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            This intercept may have been removed.
          </ThemedText>
          <Button title="Back to archive" onPress={() => navigateTo(router, '/log')} />
        </Card>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
  },
  heroMeta: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  actions: {
    gap: 10,
  },
});
