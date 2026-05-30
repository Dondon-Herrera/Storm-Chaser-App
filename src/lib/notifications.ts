import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ChaseReadiness } from '@/lib/storm-intelligence';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let lastAlertKey = '';
let lastAlertAt = 0;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function notifyChaseReadiness(readiness: ChaseReadiness) {
  if (Platform.OS === 'web') {
    return;
  }

  if (readiness.level !== 'chase' && readiness.level !== 'extreme') {
    return;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return;
  }

  const alertKey = `${readiness.level}-${readiness.score}`;
  const now = Date.now();
  if (alertKey === lastAlertKey && now - lastAlertAt < ALERT_COOLDOWN_MS) {
    return;
  }

  lastAlertKey = alertKey;
  lastAlertAt = now;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: readiness.level === 'extreme' ? 'Extreme chase conditions' : 'Chase window active',
      body: `${readiness.label} · Score ${readiness.score}/100. Open Storm Command for the full brief.`,
      sound: true,
      data: { level: readiness.level, score: readiness.score },
    },
    trigger: null,
  });
}
