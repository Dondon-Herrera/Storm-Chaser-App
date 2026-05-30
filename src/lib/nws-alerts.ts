export type NwsAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  urgency: string;
  description: string;
};

const USER_AGENT = 'StormChaserApp/1.0 (educational assessment project)';

export async function fetchActiveNwsAlerts(latitude: number, longitude: number): Promise<NwsAlert[]> {
  const url = `https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`NWS alerts error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    features?: Array<{
      properties?: {
        id?: string;
        event?: string;
        headline?: string;
        severity?: string;
        urgency?: string;
        description?: string;
      };
    }>;
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
