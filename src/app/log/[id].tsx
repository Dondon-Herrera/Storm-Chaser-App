import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { formatRainChance } from '@/lib/format-weather';
import { navigateToCellWithFeedback } from '@/lib/map-utils';
import { navigateTo } from '@/lib/navigation';
import { parseReportIdParam } from '@/lib/report-params';
import { getStormTypeColor } from '@/lib/storm-intelligence';
import { deleteStormReport, getStormReportById, type StormReport } from '@/lib/storage';

export default function StormReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<StormReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const reportId = parseReportIdParam(id);

  useEffect(() => {
    if (reportId == null) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const stored = await getStormReportById(reportId);
        if (!cancelled) {
          setReport(stored);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Could not load this intercept. Try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  function handleDeleteReport() {
    const deleteId = report?.id;
    if (deleteId == null) {
      return;
    }

    Alert.alert('Delete intercept', 'Remove this storm report from the field archive?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteStormReport(deleteId)
            .then(() => navigateTo(router, '/log'))
            .catch(() => {
              Alert.alert('Delete failed', 'Could not remove this report. Please try again.');
            });
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

      {reportId == null ? (
        <Card style={styles.cardGap}>
          <ThemedText type="title" accessibilityRole="header">
            Not Found
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            This intercept may have been removed or the link is invalid.
          </ThemedText>
          <Button title="Back to archive" onPress={() => navigateTo(router, '/log')} />
        </Card>
      ) : loading ? (
        <SkeletonCard>
          <ThemedText type="small" themeColor="textSecondary">
            Loading dossier…
          </ThemedText>
        </SkeletonCard>
      ) : error ? (
        <Card style={styles.cardGap}>
          <ThemedText type="smallBold">Dossier unavailable</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <Button title="Back to archive" onPress={() => navigateTo(router, '/log')} />
        </Card>
      ) : report ? (
        <>
          {photoFailed ? (
            <Card style={styles.cardGap}>
              <ThemedText type="smallBold">Photo unavailable</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                The image file could not be loaded from device storage.
              </ThemedText>
            </Card>
          ) : (
            <Image
              source={{ uri: report.photoUri }}
              style={[styles.image, { borderColor: accent }]}
              contentFit="cover"
              accessibilityLabel={`Storm photo for ${report.stormType}`}
              onError={() => setPhotoFailed(true)}
            />
          )}

          <Card style={[styles.heroMeta, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {report.stormType}
            </ThemedText>
            <ThemedText type="small">{report.weatherCondition}</ThemedText>
            <View style={styles.metricRow}>
              <ThemedText type="smallBold">{report.temperature.toFixed(1)}°C</ThemedText>
              <ThemedText type="smallBold">{report.windSpeed.toFixed(0)} km/h</ThemedText>
              <ThemedText type="smallBold">Rain {formatRainChance(report.precipitationProbability)}</ThemedText>
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
        <Card style={styles.cardGap}>
          <ThemedText type="smallBold">Report not found</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            This intercept may have been removed from the field archive.
          </ThemedText>
          <Button title="Back to archive" onPress={() => navigateTo(router, '/log')} />
        </Card>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardGap: {
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
