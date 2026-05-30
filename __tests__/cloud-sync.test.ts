import { getCloudProviderName, isCloudConfigured, syncStormReportsToCloud } from '@/lib/cloud-sync';

describe('cloud-sync stub', () => {
  it('reports not configured without env vars', () => {
    expect(isCloudConfigured()).toBe(false);
    expect(getCloudProviderName()).toBe('Not configured');
  });

  it('returns a safe message when syncing without configuration', async () => {
    const result = await syncStormReportsToCloud([]);
    expect(result.ok).toBe(false);
    expect(result.syncedCount).toBe(0);
    expect(result.message).toContain('not configured');
  });
});
