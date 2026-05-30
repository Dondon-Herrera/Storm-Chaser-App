import { normalizeWeatherData } from '@/lib/format-weather';
import { getCachedWeather, saveCachedWeather } from '@/lib/storage';
import * as Location from 'expo-location';

export type ForecastDay = {
    date: string;
    maxTemperature: number;
    minTemperature: number;
    precipitationProbability: number | null;
    weatherCode: number;
    weatherDescription: string;
};

export type WeatherData = {
    temperature: number;
    windSpeed: number;
    precipitation: number | null;
    precipitationProbability: number | null;
    weatherCode: number;
    weatherDescription: string;
    time: string;
    latitude: number;
    longitude: number;
    forecast: ForecastDay[];
    isCached?: boolean;
    isMock?: boolean;
};

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const weatherCodeDescriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm with hail',
};

export function getWeatherDescription(code: number) {
    return weatherCodeDescriptions[code] ?? 'Unknown weather';
}

/** Mock data for reviewers when APIs or network are unavailable (set EXPO_PUBLIC_USE_MOCK_WEATHER=true). */
export function getMockWeatherData(latitude: number, longitude: number): WeatherData {
    const now = new Date().toISOString();
    return {
        temperature: 24,
        windSpeed: 52,
        precipitation: 2.4,
        precipitationProbability: 65,
        weatherCode: 95,
        weatherDescription: getWeatherDescription(95),
        time: now,
        latitude,
        longitude,
        forecast: [
            {
                date: now.slice(0, 10),
                maxTemperature: 28,
                minTemperature: 18,
                precipitationProbability: 70,
                weatherCode: 95,
                weatherDescription: getWeatherDescription(95),
            },
        ],
        isMock: true,
    };
}

function isMockWeatherEnabled() {
    return process.env.EXPO_PUBLIC_USE_MOCK_WEATHER === 'true';
}

export async function requestLocationPermissions() {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === Location.PermissionStatus.GRANTED;
}

export async function getCurrentLocation() {
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
}

async function fetchWeatherDataOnline(latitude: number, longitude: number): Promise<WeatherData> {
    const query = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current_weather: 'true',
        current: 'precipitation',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weathercode',
        timezone: 'auto',
        windspeed_unit: 'kmh',
    });

    const response = await fetch(`${OPEN_METEO_URL}?${query.toString()}`);
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current_weather;
    const daily = data.daily;

    if (!current || !daily) {
        throw new Error('Unexpected weather response');
    }

    const forecast = Array.isArray(daily.time)
        ? daily.time.map((date: string, index: number) => ({
            date,
            maxTemperature: daily.temperature_2m_max?.[index] ?? 0,
            minTemperature: daily.temperature_2m_min?.[index] ?? 0,
            precipitationProbability: daily.precipitation_probability_max?.[index] ?? null,
            weatherCode: daily.weathercode?.[index] ?? current.weathercode,
            weatherDescription: getWeatherDescription(daily.weathercode?.[index] ?? current.weathercode),
        }))
        : [];

    const currentPrecipProb = Array.isArray(daily.precipitation_probability_max)
        ? daily.precipitation_probability_max[0] ?? null
        : null;
    const currentPrecipMm =
        typeof data.current?.precipitation === 'number'
            ? data.current.precipitation
            : Array.isArray(daily.precipitation_sum)
              ? daily.precipitation_sum[0] ?? null
              : null;

    const weather: WeatherData = {
        temperature: current.temperature,
        windSpeed: current.windspeed,
        precipitation: currentPrecipMm,
        precipitationProbability: currentPrecipProb,
        weatherCode: current.weathercode,
        weatherDescription: getWeatherDescription(current.weathercode),
        time: current.time,
        latitude: data.latitude,
        longitude: data.longitude,
        forecast,
    };

    await saveCachedWeather(JSON.stringify(weather));
    return weather;
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    try {
        return await fetchWeatherDataOnline(latitude, longitude);
    } catch (error) {
        const cachedPayload = await getCachedWeather();
        if (cachedPayload) {
            const cached = normalizeWeatherData(JSON.parse(cachedPayload) as WeatherData);
            return { ...cached, isCached: true };
        }

        if (isMockWeatherEnabled()) {
            return getMockWeatherData(latitude, longitude);
        }

        throw error;
    }
}

export async function getCachedWeatherData(): Promise<WeatherData | null> {
    const cachedPayload = await getCachedWeather();
    if (!cachedPayload) {
        return null;
    }

    const cached = normalizeWeatherData(JSON.parse(cachedPayload) as WeatherData);
    return { ...cached, isCached: true };
}
