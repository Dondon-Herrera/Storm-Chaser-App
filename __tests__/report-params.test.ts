import { parseReportIdParam } from '@/lib/report-params';

describe('parseReportIdParam', () => {
  it('parses valid numeric id', () => {
    expect(parseReportIdParam('42')).toBe(42);
  });

  it('rejects invalid values', () => {
    expect(parseReportIdParam(undefined)).toBeNull();
    expect(parseReportIdParam(['1', '2'])).toBeNull();
    expect(parseReportIdParam('abc')).toBeNull();
    expect(parseReportIdParam('0')).toBeNull();
  });
});
