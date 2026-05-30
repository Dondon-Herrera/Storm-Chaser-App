import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Icons } from '@/components/ui/icons';
import { IconAction } from '@/components/ui/icon-action';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { StormMapView } from '@/components/ui/storm-map-view';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useTheme } from '@/hooks/use-theme';
import { getUniqueStormTypes, haversineKm, navigateToCellWithFeedback } from '@/lib/map-utils';
import { navigateTo } from '@/lib/navigation';
import { getStormTypeColor } from '@/lib/storm-intelligence';
import { getStormReports, type StormReport } from '@/lib/storage';
import { getCachedWeatherData } from '@/lib/weather';

export default function MapScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<StormReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const { titleFontSize, subtitleFontSize } = useResponsiveLayout();
  const theme = useTheme();

  const reloadMap = useCallback(() => {
    setLoading(true);

    void Promise.all([getStormReports(), getCachedWeatherData()])
      .then(([stored, weather]) => {
        setReports(stored);
        if (weather) {
          setUserCoords({ lat: weather.latitude, lon: weather.longitude });
        }
        if (stored[0]?.id != null) {
          setSelectedId(stored[0].id);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      void Promise.all([getStormReports(), getCachedWeatherData()])
        .then(([stored, weather]) => {
          if (cancelled) return;
          setReports(stored);
          if (weather) {
            setUserCoords({ lat: weather.latitude, lon: weather.longitude });
          }
          if (stored[0]?.id != null) {
            setSelectedId(stored[0].id);
          }
        })
        .catch((error) => console.error(error))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const stormTypes = useMemo(() => ['All', ...getUniqueStormTypes(reports)], [reports]);

  const filteredReports = useMemo(() => {
    if (filter === 'All') return reports;
    return reports.filter((r) => r.stormType === filter);
  }, [reports, filter]);

  const selectedReport = useMemo(
    () => filteredReports.find((r) => r.id === selectedId) ?? filteredReports[0],
    [filteredReports, selectedId]
  );

  const stats = useMemo(() => {
    if (!reports.length) return null;
    const avgWind = reports.reduce((s, r) => s + r.windSpeed, 0) / reports.length;
    const latest = reports.reduce((a, b) => (a.dateTime > b.dateTime ? a : b));
    return { count: reports.length, avgWind, latest };
  }, [reports]);

  const canShowMap = reports.length > 0 || userCoords != null;

  return (
    <ScreenShell>
      <ScreenHeader
        eyebrow="Tactical view"
        title="Storm Radar Map"
        subtitle="Pin every documented cell, filter by classification, and launch navigation."
        titleSize={titleFontSize}
        subtitleSize={subtitleFontSize}
        actions={
          <>
            <IconAction label="New report" icon={Icons.add} variant="primary" onPress={() => navigateTo(router, '/log/new')} />
            <IconAction label="Refresh" icon={Icons.refresh} onPress={reloadMap} disabled={loading} />
          </>
        }
      />

      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={theme.accentSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            Plotting storm coordinates…
          </ThemedText>
        </Card>
      ) : !canShowMap ? (
        <Card style={styles.emptyCard}>
          <ThemedText type="smallBold">No coordinates yet</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Open Weather first to load your position, or log an intercept to unlock the tactical map.
          </ThemedText>
          <Button title="Go to Weather" size="lg" onPress={() => navigateTo(router, '/')} />
          <Button title="Log intercept" variant="outline" size="lg" onPress={() => navigateTo(router, '/log/new')} />
        </Card>
      ) : (
        <>
          {stats ? (
            <View style={styles.statsRow}>
              <Card style={styles.statTile}>
                <ThemedText type="small" themeColor="textMuted">
                  Events
                </ThemedText>
                <ThemedText type="title" style={styles.statValue}>
                  {stats.count}
                </ThemedText>
              </Card>
              <Card style={styles.statTile}>
                <ThemedText type="small" themeColor="textMuted">
                  Avg wind
                </ThemedText>
                <ThemedText type="title" style={styles.statValue}>
                  {stats.avgWind.toFixed(0)}
                </ThemedText>
              </Card>
              <Card style={styles.statTile}>
                <ThemedText type="small" themeColor="textMuted">
                  Latest
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {new Date(stats.latest.dateTime).toLocaleDateString()}
                </ThemedText>
              </Card>
            </View>
          ) : userCoords ? (
            <Card>
              <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
                Weather fix plotted
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                No intercepts yet — showing your last known position from Weather.
              </ThemedText>
            </Card>
          ) : null}

          {reports.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {stormTypes.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={filter === type}
                  onPress={() => setFilter(type)}
                  color={type === 'All' ? theme.accentSecondary : getStormTypeColor(type)}
                />
              ))}
            </ScrollView>
          ) : null}

          <Pressable
            onPress={() => {
              if (selectedReport) {
                void navigateToCellWithFeedback(
                  selectedReport.latitude,
                  selectedReport.longitude,
                  selectedReport.stormType
                );
              } else if (userCoords) {
                void navigateToCellWithFeedback(userCoords.lat, userCoords.lon, 'Weather fix');
              }
            }}>
            <StormMapView
              reports={filteredReports.length ? filteredReports : reports}
              highlightId={selectedReport?.id}
              userLat={userCoords?.lat}
              userLon={userCoords?.lon}
              selectedLabel={selectedReport?.stormType ?? 'Your weather fix'}
            />
          </Pressable>

          {selectedReport && userCoords ? (
            <Card>
              <ThemedText type="small" themeColor="textMuted">
                Distance from last weather fix
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
                {haversineKm(userCoords.lat, userCoords.lon, selectedReport.latitude, selectedReport.longitude).toFixed(1)} km
              </ThemedText>
            </Card>
          ) : null}

          {filteredReports.length > 0 ? (
            <Card style={styles.listCard}>
              <ThemedText type="smallBold">Field intercepts ({filteredReports.length})</ThemedText>
              {filteredReports.map((report) => {
                const isSelected = report.id === selectedReport?.id;
                const accent = getStormTypeColor(report.stormType);
                const distance =
                  userCoords != null
                    ? haversineKm(userCoords.lat, userCoords.lon, report.latitude, report.longitude)
                    : null;

                return (
                  <View
                    key={report.id?.toString() ?? report.dateTime}
                    style={[
                      styles.reportRow,
                      {
                        borderColor: isSelected ? accent : theme.surfaceBorder,
                        backgroundColor: isSelected ? `${accent}22` : 'transparent',
                      },
                    ]}>
                    <Pressable
                      style={styles.reportTap}
                      onPress={() => report.id != null && setSelectedId(report.id)}>
                      <View style={[styles.typeDot, { backgroundColor: accent }]} />
                      <View style={styles.reportBody}>
                        <ThemedText type="smallBold">{report.stormType}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {new Date(report.dateTime).toLocaleString()} · {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
                        </ThemedText>
                        {distance != null ? (
                          <ThemedText type="small" style={{ color: theme.accentSecondary }}>
                            {distance.toFixed(1)} km from fix
                          </ThemedText>
                        ) : null}
                      </View>
                    </Pressable>
                    <Button title="Brief" variant="outline" onPress={() => navigateTo(router, `/log/${report.id}`)} />
                  </View>
                );
              })}
            </Card>
          ) : null}

          {selectedReport ? (
            <View style={styles.footerActions}>
              <Button
                title="Navigate"
                size="lg"
                onPress={() =>
                  void navigateToCellWithFeedback(
                    selectedReport.latitude,
                    selectedReport.longitude,
                    selectedReport.stormType
                  )
                }
              />
              <Button title="Full dossier" variant="secondary" size="lg" onPress={() => navigateTo(router, `/log/${selectedReport.id}`)} />
            </View>
          ) : userCoords ? (
            <Button
              title="Navigate to weather fix"
              size="lg"
              onPress={() => void navigateToCellWithFeedback(userCoords.lat, userCoords.lon, 'Weather fix')}
            />
          ) : null}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyCard: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  chipRow: {
    gap: 10,
    paddingVertical: 2,
  },
  listCard: {
    gap: 10,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  reportTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportBody: {
    flex: 1,
    gap: 4,
  },
  footerActions: {
    gap: 10,
  },
});
