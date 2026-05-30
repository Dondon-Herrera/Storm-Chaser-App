import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getStormReports, type StormReport } from '@/lib/storage';

export type FieldDashboard = {
  reportCount: number;
  latestReport: StormReport | null;
  loading: boolean;
};

export function useFieldDashboard() {
  const [data, setData] = useState<FieldDashboard>({
    reportCount: 0,
    latestReport: null,
    loading: true,
  });

  const reload = useCallback(() => {
    setData((prev) => ({ ...prev, loading: true }));

    void getStormReports()
      .then((reports) => {
        setData({
          reportCount: reports.length,
          latestReport: reports[0] ?? null,
          loading: false,
        });
      })
      .catch(() => {
        setData({
          reportCount: 0,
          latestReport: null,
          loading: false,
        });
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { ...data, reload };
}
