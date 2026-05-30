import { getChaseBrief, getChaseReadiness, getStormTypeColor } from '@/lib/storm-intelligence';
import type { WeatherData } from '@/lib/weather';

function mockWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    temperature: 22,
    windSpeed: 30,
    precipitationProbability: 20,
    weatherCode: 2,
    weatherDescription: 'Partly cloudy',
    time: new Date().toISOString(),
    latitude: 35,
    longitude: -97,
    forecast: [],
    ...overrides,
  };
}

describe('getChaseReadiness', () => {
  it('returns calm for mild weather', () => {
    const result = getChaseReadiness(mockWeather());
    expect(result.level).toBe('calm');
    expect(result.score).toBeLessThan(26);
  });

  it('returns extreme for thunder and high wind', () => {
    const result = getChaseReadiness(
      mockWeather({
        weatherCode: 95,
        windSpeed: 75,
        precipitationProbability: 80,
      })
    );
    expect(result.level).toBe('extreme');
    expect(result.score).toBeGreaterThanOrEqual(76);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('returns at least storm watch for elevated shower and wind signals', () => {
    const result = getChaseReadiness(
      mockWeather({
        weatherCode: 82,
        windSpeed: 50,
        precipitationProbability: 50,
      })
    );
    expect(result.score).toBeGreaterThanOrEqual(26);
    expect(['watch', 'chase', 'extreme']).toContain(result.level);
  });
});

describe('getChaseBrief', () => {
  it('mentions safety for extreme readiness', () => {
    const weather = mockWeather({ weatherCode: 99, windSpeed: 80, precipitationProbability: 90 });
    const readiness = getChaseReadiness(weather);
    const brief = getChaseBrief(weather, readiness);
    expect(brief.toLowerCase()).toContain('safety');
  });
});

describe('getStormTypeColor', () => {
  it('maps tornado to accent red family', () => {
    expect(getStormTypeColor('Tornado')).toBe('#FF4D6D');
  });
});
