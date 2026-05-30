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
    precipitationProbability: number | null;
    weatherCode: number;
    weatherDescription: string;
    time: string;
    latitude: number;
    longitude: number;
    forecast: ForecastDay[];
    isCached?: boolean;
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

function getWeatherDescription(code: number) {
    return weatherCodeDescriptions[code] ?? 'Unknown weather';
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
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
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

    const currentPrecip = Array.isArray(daily.precipitation_probability_max) ? daily.precipitation_probability_max[0] ?? null : null;

    const weather: WeatherData = {
        temperature: current.temperature,
        windSpeed: current.windspeed,
        precipitationProbability: currentPrecip,
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
        if (!cachedPayload) {
            throw error;
        }

        const cached = JSON.parse(cachedPayload) as WeatherData;
        return { ...cached, isCached: true };
    }
}

export async function getCachedWeatherData(): Promise<WeatherData | null> {
    const cachedPayload = await getCachedWeather();
    if (!cachedPayload) {
        return null;
    }

    const cached = JSON.parse(cachedPayload) as WeatherData;
    return { ...cached, isCached: true };
}
