jest.mock('@/lib/storage', () => ({
  getCachedWeather: jest.fn(),
  saveCachedWeather: jest.fn(),
}));

import { getMockWeatherData, getWeatherDescription } from '@/lib/weather';

describe('getWeatherDescription', () => {
  it('returns thunderstorm label for code 95', () => {
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('returns Unknown weather for unrecognized codes', () => {
    expect(getWeatherDescription(9999)).toBe('Unknown weather');
  });
});

describe('getMockWeatherData', () => {
  it('provides storm-chaser relevant fields', () => {
    const mock = getMockWeatherData(35.5, -97.5);
    expect(mock.isMock).toBe(true);
    expect(mock.temperature).toBeGreaterThan(0);
    expect(mock.windSpeed).toBeGreaterThan(0);
    expect(mock.precipitation).not.toBeNull();
    expect(mock.forecast.length).toBeGreaterThan(0);
  });
});
