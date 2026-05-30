import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform } from 'react-native';

import { hapticLight } from '@/lib/haptics';

import type { StormReport } from '@/lib/storage';

export type MapViewport = {
  centerLat: number;
  centerLon: number;
  zoom: number;
};

function formatCoords(latitude: number, longitude: number) {
  return {
    lat: latitude.toFixed(6),
    lon: longitude.toFixed(6),
  };
}

function buildNavigationUrls(latitude: number, longitude: number, label: string) {
  const { lat, lon } = formatCoords(latitude, longitude);
  const encodedLabel = encodeURIComponent(label || 'Storm cell');

  return {
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`,
    googleSearch: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
    appleDirections: `http://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`,
    applePin: `http://maps.apple.com/?ll=${lat},${lon}&q=${encodedLabel}`,
    mapsAppIos: `maps://?daddr=${lat},${lon}&dirflg=d`,
    googleNavAndroid: `google.navigation:q=${lat},${lon}`,
    geoAndroid: `geo:${lat},${lon}?q=${lat},${lon}(${encodedLabel})`,
  };
}

async function tryOpenUrl(url: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      if (typeof globalThis !== 'undefined' && 'open' in globalThis) {
        globalThis.open(url, '_blank', 'noopener,noreferrer');
        return true;
      }
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch {
    // Try next URL in the chain.
  }

  return false;
}

/**
 * Opens turn-by-turn or pin navigation to a storm cell on every platform.
 */
export async function navigateToCell(
  latitude: number,
  longitude: number,
  label = 'Storm cell'
): Promise<boolean> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  const urls = buildNavigationUrls(latitude, longitude, label);

  const candidates = Platform.select({
    ios: [urls.mapsAppIos, urls.appleDirections, urls.googleDirections],
    android: [urls.googleNavAndroid, urls.geoAndroid, urls.googleDirections],
    web: [urls.googleDirections, urls.googleSearch],
    default: [urls.googleDirections, urls.googleSearch],
  })!;

  for (const url of candidates) {
    if (await tryOpenUrl(url)) {
      return true;
    }
  }

  try {
    if (Platform.OS === 'web') {
      return await tryOpenUrl(urls.googleDirections);
    }
    await WebBrowser.openBrowserAsync(urls.googleDirections);
    return true;
  } catch {
    return false;
  }
}

export async function navigateToCellWithFeedback(
  latitude: number,
  longitude: number,
  label = 'Storm cell'
) {
  void hapticLight();
  const opened = await navigateToCell(latitude, longitude, label);

  if (!opened) {
    Alert.alert(
      'Could not open maps',
      `Open your maps app manually:\n${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      [{ text: 'OK' }]
    );
  }

  return opened;
}

/** @deprecated Use navigateToCell */
export function openInMaps(latitude: number, longitude: number, label = 'Storm location') {
  void navigateToCellWithFeedback(latitude, longitude, label);
}

export function getMapViewport(
  reports: StormReport[],
  userLat?: number,
  userLon?: number
): MapViewport | null {
  const points = reports.map((r) => ({ lat: r.latitude, lon: r.longitude }));
  if (userLat != null && userLon != null) {
    points.push({ lat: userLat, lon: userLon });
  }

  if (!points.length) {
    return null;
  }

  const centerLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const centerLon = points.reduce((s, p) => s + p.lon, 0) / points.length;
  const latSpan = Math.max(...points.map((p) => p.lat)) - Math.min(...points.map((p) => p.lat));
  const lonSpan = Math.max(...points.map((p) => p.lon)) - Math.min(...points.map((p) => p.lon));
  const span = Math.max(latSpan, lonSpan, 0.05);

  let zoom = 11;
  if (span > 8) zoom = 4;
  else if (span > 3) zoom = 5;
  else if (span > 1) zoom = 7;
  else if (span > 0.3) zoom = 9;

  return { centerLat, centerLon, zoom };
}

function buildMarkerParam(reports: StormReport[], highlightId?: number) {
  return reports
    .slice(0, 15)
    .map((report) => {
      const isHighlight = highlightId != null && report.id === highlightId;
      const color = isHighlight ? 'lightblue' : 'red';
      return `${report.latitude.toFixed(6)},${report.longitude.toFixed(6)},${color}`;
    })
    .join('|');
}

/** Static map image (native + fallback). */
export function buildStormMapUrl(
  reports: StormReport[],
  options?: { width?: number; height?: number; highlightId?: number; userLat?: number; userLon?: number }
) {
  const viewport = getMapViewport(reports, options?.userLat, options?.userLon);
  if (!viewport) {
    return null;
  }

  const width = options?.width ?? 900;
  const height = options?.height ?? 520;
  const markers = buildMarkerParam(reports, options?.highlightId);

  const params = new URLSearchParams({
    center: `${viewport.centerLat.toFixed(6)},${viewport.centerLon.toFixed(6)}`,
    zoom: String(viewport.zoom),
    size: `${width}x${height}`,
    maptype: 'mapnik',
  });

  if (markers) {
    params.append('markers', markers);
  }

  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
}

/** Interactive embed for web. */
export function buildStormMapEmbedUrl(
  reports: StormReport[],
  options?: { userLat?: number; userLon?: number }
) {
  const viewport = getMapViewport(reports, options?.userLat, options?.userLon);
  if (!viewport) {
    return null;
  }

  const span = 0.45 / Math.max(viewport.zoom / 10, 1);
  const minLon = viewport.centerLon - span;
  const maxLon = viewport.centerLon + span;
  const minLat = viewport.centerLat - span * 0.7;
  const maxLat = viewport.centerLat + span * 0.7;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

  const primary = reports[0];
  const marker = primary
    ? `&marker=${primary.latitude.toFixed(6)}%2C${primary.longitude.toFixed(6)}`
    : options?.userLat != null && options?.userLon != null
      ? `&marker=${options.userLat.toFixed(6)}%2C${options.userLon.toFixed(6)}`
      : '';

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${marker}`;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getUniqueStormTypes(reports: StormReport[]) {
  return Array.from(new Set(reports.map((r) => r.stormType.trim()).filter(Boolean))).sort();
}
