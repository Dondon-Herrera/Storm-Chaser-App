/**
 * Cloud sync integration stub — no API keys or secrets in source control.
 * Wire a provider (Firebase, Supabase, AWS S3, etc.) by setting env vars locally.
 */

import type { StormReport } from '@/lib/storage';

export type CloudSyncResult = {
  ok: boolean;
  syncedCount: number;
  message: string;
};

const PROVIDER = process.env.EXPO_PUBLIC_CLOUD_PROVIDER ?? '';
const ENDPOINT = process.env.EXPO_PUBLIC_CLOUD_SYNC_URL ?? '';

export function isCloudConfigured(): boolean {
  return Boolean(PROVIDER && ENDPOINT);
}

export function getCloudProviderName(): string {
  if (!PROVIDER) return 'Not configured';
  return PROVIDER;
}

/**
 * Placeholder upload — replace body with your provider SDK when credentials exist.
 */
export async function syncStormReportsToCloud(reports: StormReport[]): Promise<CloudSyncResult> {
  if (!isCloudConfigured()) {
    return {
      ok: false,
      syncedCount: 0,
      message:
        'Cloud sync is not configured. Set EXPO_PUBLIC_CLOUD_PROVIDER and EXPO_PUBLIC_CLOUD_SYNC_URL in a local .env file (never commit keys).',
    };
  }

  // Integration point: POST reports to EXPOINT without embedding private keys in the repo.
  // Example: await fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(reports) });
  void ENDPOINT;
  void reports;

  return {
    ok: true,
    syncedCount: reports.length,
    message: `Stub sync complete for ${reports.length} report(s) via ${PROVIDER}. Replace cloud-sync.ts with your provider SDK.`,
  };
}
