import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radii, Spacing } from '@/constants/theme';
import type { NwsAlert } from '@/lib/nws-alerts';
import { useTheme } from '@/hooks/use-theme';

type NwsAlertsPanelProps = {
  alerts: NwsAlert[];
  loading?: boolean;
  error?: string | null;
};

function severityColor(severity: string, theme: ReturnType<typeof useTheme>) {
  const key = severity.toLowerCase();
  if (key.includes('extreme') || key.includes('severe')) return theme.danger;
  if (key.includes('moderate')) return theme.warning;
  return theme.accentSecondary;
}

export function NwsAlertsPanel({ alerts, loading, error }: NwsAlertsPanelProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card style={styles.card} accessibilityLabel="Loading official weather alerts">
        <ActivityIndicator color={theme.accentSecondary} />
        <ThemedText type="small" themeColor="textSecondary">
          Checking NWS active alerts…
        </ThemedText>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.card} accessibilityLabel="Weather alerts unavailable">
        <ThemedText type="smallBold">NWS feed offline</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      </Card>
    );
  }

  if (!alerts.length) {
    return (
      <Card style={styles.card} accessibilityLabel="No active government weather alerts">
        <ThemedText type="smallBold" style={{ color: theme.success }}>
          No active NWS alerts
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          No government-issued warnings for your coordinates right now.
        </ThemedText>
      </Card>
    );
  }

  return (
    <Card style={styles.card} accessibilityLabel={`${alerts.length} active NWS weather alerts`}>
      <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
        NWS active alerts ({alerts.length})
      </ThemedText>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[styles.alertRow, { borderLeftColor: severityColor(alert.severity, theme) }]}
          accessibilityRole="text"
          accessibilityLabel={`${alert.event}. ${alert.headline}. Severity ${alert.severity}`}>
          <ThemedText type="smallBold">{alert.event}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {alert.headline}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {alert.severity} · {alert.urgency}
          </ThemedText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  alertRow: {
    gap: 4,
    paddingLeft: Spacing.three,
    borderLeftWidth: 3,
    marginTop: Spacing.two,
  },
});
