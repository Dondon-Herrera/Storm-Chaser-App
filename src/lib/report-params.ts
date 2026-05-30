export function parseReportIdParam(id: string | string[] | undefined): number | null {
  if (typeof id !== 'string') {
    return null;
  }
  const parsed = Number(id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
