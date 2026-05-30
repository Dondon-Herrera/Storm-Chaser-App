import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCloudProviderName, isCloudConfigured, syncStormReportsToCloud } from '@/lib/cloud-sync';
import type { StormReport } from '@/lib/storage';

type CloudSyncPanelProps = {
  reports: StormReport[];
};

export function CloudSyncPanel({ reports }: CloudSyncPanelProps) {
  const theme = useTheme();
  const [status, setStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const configured = isCloudConfigured();

  async function handleSync() {
    setSyncing(true);
    setStatus(null);
    try {
      const result = await syncStormReportsToCloud(reports);
      setStatus(result.message);
    } catch (error) {
      console.error(error);
      setStatus('Cloud sync failed. Check your integration stub.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">Cloud backup (integration stub)</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Provider: {getCloudProviderName()}. No API keys are stored in this repository — configure{' '}
        <ThemedText type="small" style={{ color: theme.accentSecondary }}>
          EXPO_PUBLIC_CLOUD_PROVIDER
        </ThemedText>{' '}
        and{' '}
        <ThemedText type="small" style={{ color: theme.accentSecondary }}>
          EXPO_PUBLIC_CLOUD_SYNC_URL
        </ThemedText>{' '}
        locally to enable a real upload.
      </ThemedText>
      <View style={styles.row}>
        <Button
          title={syncing ? 'Syncing…' : configured ? 'Sync to cloud' : 'Run stub sync'}
          variant={configured ? 'primary' : 'outline'}
          onPress={handleSync}
          disabled={syncing || reports.length === 0}
        />
        <ThemedText type="small" themeColor="textMuted">
          {reports.length === 0
            ? 'Log at least one intercept before cloud sync.'
            : `${reports.length} report(s) on device`}
        </ThemedText>
      </View>
      {status ? (
        <ThemedText type="small" themeColor="textSecondary">
          {status}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.two,
  },
});
