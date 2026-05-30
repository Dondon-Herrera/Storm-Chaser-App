import { useCallback, useState } from 'react';

import { fetchActiveNwsAlerts, type NwsAlert } from '@/lib/nws-alerts';

export function useNwsAlerts() {
  const [alerts, setAlerts] = useState<NwsAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const active = await fetchActiveNwsAlerts(latitude, longitude);
      setAlerts(active);
    } catch (err) {
      console.error(err);
      setAlerts([]);
      setError('Official NWS alerts could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { alerts, loading, error, loadAlerts };
}
