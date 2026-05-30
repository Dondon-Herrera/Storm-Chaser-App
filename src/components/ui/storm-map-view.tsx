import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildStormMapEmbedUrl, buildStormMapUrl } from '@/lib/map-utils';
import type { StormReport } from '@/lib/storage';

type StormMapViewProps = {
  reports: StormReport[];
  highlightId?: number;
  userLat?: number;
  userLon?: number;
  selectedLabel?: string;
};

export function StormMapView({ reports, highlightId, userLat, userLon, selectedLabel }: StormMapViewProps) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const mapImageUrl = useMemo(
    () => buildStormMapUrl(reports, { highlightId, userLat, userLon, height: 480 }),
    [reports, highlightId, userLat, userLon]
  );
  const embedUrl = useMemo(
    () => buildStormMapEmbedUrl(reports, { userLat, userLon }),
    [reports, userLat, userLon]
  );

  if (!reports.length && userLat == null) {
    return (
      <View style={[styles.fallback, { borderColor: theme.surfaceBorder }]}>
        <ThemedText type="smallBold">Map preview unavailable</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Log a storm intercept or refresh weather to plot coordinates.
        </ThemedText>
      </View>
    );
  }

  if (Platform.OS === 'web' && embedUrl) {
    return (
      <View style={[styles.frame, { borderColor: theme.surfaceBorder }]}>
        <iframe
          title="Storm tactical map"
          src={embedUrl}
          style={{ width: '100%', height: 320, border: 'none' }}
          loading="lazy"
        />
        <View style={[styles.caption, { backgroundColor: theme.backgroundElevated }]}>
          <ThemedText type="smallBold">{selectedLabel ?? 'Storm map'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Interactive OpenStreetMap · {reports.length} plotted intercept{reports.length === 1 ? '' : 's'}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (!mapImageUrl || imageFailed) {
    const preview = reports[0];
    return (
      <View style={[styles.fallback, { borderColor: theme.surfaceBorder }]}>
        <ThemedText type="smallBold">Coordinate plot</ThemedText>
        {preview ? (
          <>
            <ThemedText type="small" style={{ color: theme.accentSecondary }}>
              {preview.latitude.toFixed(4)}°, {preview.longitude.toFixed(4)}°
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {preview.stormType} · {new Date(preview.dateTime).toLocaleString()}
            </ThemedText>
          </>
        ) : userLat != null && userLon != null ? (
          <ThemedText type="small" style={{ color: theme.accentSecondary }}>
            Weather fix: {userLat.toFixed(4)}°, {userLon.toFixed(4)}°
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textMuted">
          Live tiles unavailable — use Navigate to open maps.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.frame, { borderColor: theme.surfaceBorder }]}>
      <Image
        source={{ uri: mapImageUrl }}
        style={styles.image}
        contentFit="cover"
        onError={() => setImageFailed(true)}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <View style={styles.loadingBadge}>
        <ActivityIndicator color={theme.accentSecondary} size="small" />
      </View>
      <View style={[styles.caption, { backgroundColor: theme.backgroundElevated }]}>
        <ThemedText type="smallBold">{selectedLabel ?? 'Storm map'}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {reports.length} intercept{reports.length === 1 ? '' : 's'} on map
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: Radii.large,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#0f172a',
  },
  caption: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  fallback: {
    padding: 20,
    borderRadius: Radii.large,
    borderWidth: 1,
    gap: 8,
    minHeight: 160,
    justifyContent: 'center',
  },
  loadingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
