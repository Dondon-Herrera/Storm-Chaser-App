import type { WeatherData } from '@/lib/weather';

export function formatRainChance(probability: number | null | undefined): string {
  return probability != null ? `${probability}%` : 'N/A';
}

export function normalizeWeatherData(raw: Partial<WeatherData> & Pick<WeatherData, 'temperature' | 'windSpeed' | 'weatherCode' | 'weatherDescription' | 'time' | 'latitude' | 'longitude'>): WeatherData {
  return {
    temperature: raw.temperature,
    windSpeed: raw.windSpeed,
    precipitation: raw.precipitation ?? null,
    precipitationProbability: raw.precipitationProbability ?? null,
    weatherCode: raw.weatherCode,
    weatherDescription: raw.weatherDescription,
    time: raw.time,
    latitude: raw.latitude,
    longitude: raw.longitude,
    forecast: raw.forecast ?? [],
    isCached: raw.isCached,
    isMock: raw.isMock,
  };
}
