import { getCachedWeatherData, fetchWeatherData, getCurrentLocation, requestLocationPermissions, type WeatherData } from '@/lib/weather';

export type WeatherLoadResult =
  | { status: 'ready'; weather: WeatherData; message: string }
  | { status: 'not-found'; message: string };

export async function loadWeatherForDevice(): Promise<WeatherLoadResult> {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    const cachedWeather = await getCachedWeatherData();
    if (cachedWeather) {
      return { status: 'ready', weather: cachedWeather, message: 'Location off — showing cached intelligence.' };
    }
    return { status: 'not-found', message: 'Enable location for live storm intelligence.' };
  }

  const location = await getCurrentLocation();
  if (!location?.coords) {
    const cachedWeather = await getCachedWeatherData();
    if (cachedWeather) {
      return { status: 'ready', weather: cachedWeather, message: 'GPS unavailable — cached data loaded.' };
    }
    return { status: 'not-found', message: 'Could not resolve your chase coordinates.' };
  }

  try {
    const weatherData = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
    return { status: 'ready', weather: weatherData, message: '' };
  } catch (error) {
    console.error(error);
    const cachedWeather = await getCachedWeatherData();
    if (cachedWeather) {
      return {
        status: 'ready',
        weather: cachedWeather,
        message: 'Network unavailable — showing cached weather.',
      };
    }
    return {
      status: 'not-found',
      message: 'Weather data could not be retrieved. Check location and network, then pull to refresh.',
    };
  }
}
