import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radii, Spacing } from '@/constants/theme';
import type { FieldDashboard } from '@/hooks/use-field-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { getStormTypeColor } from '@/lib/storm-intelligence';

type FieldDashboardProps = {
  data: FieldDashboard;
  onOpenLog: () => void;
  onOpenMap: () => void;
  onOpenLatest?: () => void;
};

export function FieldDashboardCard({ data, onOpenLog, onOpenMap, onOpenLatest }: FieldDashboardProps) {
  const theme = useTheme();
  const latest = data.latestReport;
  const accent = latest ? getStormTypeColor(latest.stormType) : theme.accentSecondary;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
          Field operations
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {data.loading ? 'Syncing…' : `${data.reportCount} intercept${data.reportCount === 1 ? '' : 's'} logged`}
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <Pressable
          style={[styles.statBox, { borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundSelected }]}
          onPress={onOpenLog}>
          <ThemedText type="small" themeColor="textMuted">
            Archive
          </ThemedText>
          <ThemedText style={styles.statValue}>{data.reportCount}</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.statBox, { borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundSelected }]}
          onPress={onOpenMap}>
          <ThemedText type="small" themeColor="textMuted">
            Map
          </ThemedText>
          <ThemedText style={styles.statValue}>Live</ThemedText>
        </Pressable>
      </View>

      {latest ? (
        <Pressable
          onPress={onOpenLatest}
          style={[styles.latestRow, { borderColor: accent, backgroundColor: theme.backgroundSelected }]}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <View style={styles.latestText}>
            <ThemedText type="smallBold">{latest.stormType}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Latest · {new Date(latest.dateTime).toLocaleString()}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={{ color: accent }}>
            Open →
          </ThemedText>
        </Pressable>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          No intercepts yet — document your first storm cell.
        </ThemedText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radii.normal,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  latestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.normal,
    borderWidth: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  latestText: {
    flex: 1,
    gap: 2,
  },
});
