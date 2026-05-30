import { ChaseRiskColors } from '@/constants/theme';
import { formatRainChance } from '@/lib/format-weather';
import type { WeatherData } from '@/lib/weather';

export type ChaseRiskLevel = 'calm' | 'watch' | 'chase' | 'extreme';

export type ChaseReadiness = {
  score: number;
  level: ChaseRiskLevel;
  label: string;
  color: string;
  factors: string[];
};

const THUNDER_CODES = new Set([95, 96, 99]);

export function getChaseReadiness(weather: WeatherData): ChaseReadiness {
  const factors: string[] = [];
  let score = 0;

  if (THUNDER_CODES.has(weather.weatherCode)) {
    score += 38;
    factors.push('Thunderstorm activity detected');
  } else if (weather.weatherCode >= 80) {
    score += 22;
    factors.push('Heavy shower potential');
  }

  if (weather.windSpeed >= 70) {
    score += 28;
    factors.push('Damaging wind field');
  } else if (weather.windSpeed >= 45) {
    score += 16;
    factors.push('Strong inflow winds');
  }

  const rain = weather.precipitationProbability;
  if (rain != null && rain >= 75) {
    score += 20;
    factors.push('High precipitation probability');
  } else if (rain != null && rain >= 45) {
    score += 10;
    factors.push('Moderate rain chance');
  }

  if (weather.weatherCode >= 61 && weather.weatherCode <= 67) {
    score += 8;
    factors.push('Active rainfall');
  }

  score = Math.min(100, Math.max(0, score));

  if (score >= 76) {
    return { score, level: 'extreme', label: 'Extreme Chase', color: ChaseRiskColors.extreme, factors };
  }
  if (score >= 51) {
    return { score, level: 'chase', label: 'Chase Mode', color: ChaseRiskColors.chase, factors };
  }
  if (score >= 26) {
    return { score, level: 'watch', label: 'Storm Watch', color: ChaseRiskColors.watch, factors };
  }

  if (!factors.length) {
    factors.push('Stable atmosphere — monitor trends');
  }

  return { score, level: 'calm', label: 'Calm Skies', color: ChaseRiskColors.calm, factors };
}

export function getChaseBrief(weather: WeatherData, readiness: ChaseReadiness): string {
  const rainText = formatRainChance(weather.precipitationProbability);
  const rainPhrase =
    rainText === 'N/A' ? 'precipitation data unavailable' : `${rainText} rain chance`;
  const base = `${weather.weatherDescription} at ${weather.temperature.toFixed(0)}°C with ${weather.windSpeed.toFixed(0)} km/h winds and ${rainPhrase}.`;

  switch (readiness.level) {
    case 'extreme':
      return `${base} Conditions favor active storm chasing — prioritize safety, escape routes, and live radar.`;
    case 'chase':
      return `${base} Favorable chase window — position southwest of the cell and document with the storm log.`;
    case 'watch':
      return `${base} Keep scanning the horizon and refresh data every 15 minutes for developing cells.`;
    default:
      return `${base} Low chase potential — use this time to review past reports and plan your next route.`;
  }
}

export function getWeatherSymbol(code: number) {
  if (THUNDER_CODES.has(code)) {
    return { ios: 'cloud.bolt.rain.fill', android: 'thunderstorm', web: 'thunderstorm' } as const;
  }
  if (code >= 71 && code <= 77) {
    return { ios: 'cloud.snow.fill', android: 'weather_snowy', web: 'weather_snowy' } as const;
  }
  if (code >= 61) {
    return { ios: 'cloud.rain.fill', android: 'rainy', web: 'rainy' } as const;
  }
  if (code >= 51) {
    return { ios: 'cloud.drizzle.fill', android: 'grain', web: 'grain' } as const;
  }
  if (code === 0 || code === 1) {
    return { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' } as const;
  }
  return { ios: 'cloud.fill', android: 'cloud', web: 'cloud' } as const;
}

export function getStormTypeColor(stormType: string): string {
  const key = stormType.toLowerCase();
  if (key.includes('tornado')) return '#FF4D6D';
  if (key.includes('hail')) return '#8B5CF6';
  if (key.includes('wind')) return '#22D3EE';
  if (key.includes('flood')) return '#3B82F6';
  return '#FBBF24';
}
