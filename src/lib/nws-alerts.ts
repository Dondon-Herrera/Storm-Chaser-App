import { Platform } from 'react-native';

export type NwsAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  urgency: string;
  description: string;
};

const USER_AGENT = 'StormChaserApp/1.0 (educational assessment project)';

export function getNwsFetchBlockedReason(): string | null {
  if (Platform.OS === 'web') {
    return 'NWS alerts load on iOS/Android. Expo web cannot call api.weather.gov directly (browser network/CORS limits).';
  }
  return null;
}

export async function fetchActiveNwsAlerts(latitude: number, longitude: number): Promise<NwsAlert[]> {
  const blocked = getNwsFetchBlockedReason();
  if (blocked) {
    throw new Error(blocked);
  }

  const url = `https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/geo+json',
        'User-Agent': USER_AGENT,
      },
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Failed to fetch';
    throw new Error(
      message === 'Failed to fetch'
        ? 'Could not reach api.weather.gov. Check your internet connection or try again on a device (not web).'
        : message
    );
  }

  if (!response.ok) {
    throw new Error(`NWS alerts error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    features?: {
      properties?: {
        id?: string;
        event?: string;
        headline?: string;
        severity?: string;
        urgency?: string;
        description?: string;
      };
    }[];
  };

  return (payload.features ?? [])
    .map((feature) => {
      const props = feature.properties;
      if (!props?.event) {
        return null;
      }

      return {
        id: props.id ?? props.event,
        event: props.event,
        headline: props.headline ?? props.event,
        severity: props.severity ?? 'Unknown',
        urgency: props.urgency ?? 'Unknown',
        description: props.description ?? '',
      } satisfies NwsAlert;
    })
    .filter((alert): alert is NwsAlert => alert != null)
    .slice(0, 5);
}
