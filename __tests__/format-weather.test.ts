import { formatRainChance, normalizeWeatherData } from '@/lib/format-weather';

describe('formatRainChance', () => {
  it('formats known probability', () => {
    expect(formatRainChance(65)).toBe('65%');
  });

  it('returns N/A when unknown', () => {
    expect(formatRainChance(null)).toBe('N/A');
    expect(formatRainChance(undefined)).toBe('N/A');
  });
});

describe('normalizeWeatherData', () => {
  it('fills missing optional fields', () => {
    const normalized = normalizeWeatherData({
      temperature: 20,
      windSpeed: 30,
      weatherCode: 0,
      weatherDescription: 'Clear sky',
      time: '2026-01-01T12:00',
      latitude: 1,
      longitude: 2,
    });

    expect(normalized.precipitation).toBeNull();
    expect(normalized.precipitationProbability).toBeNull();
    expect(normalized.forecast).toEqual([]);
  });
});
