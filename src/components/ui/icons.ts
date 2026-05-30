import type { SymbolViewProps } from 'expo-symbols';

export type StormIcon = SymbolViewProps['name'];

export const Icons = {
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  map: { ios: 'map.fill', android: 'map', web: 'map' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  add: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  wind: { ios: 'tornado', android: 'air', web: 'air' },
  rain: { ios: 'cloud.rain.fill', android: 'water_drop', web: 'water_drop' },
  location: { ios: 'location.fill', android: 'my_location', web: 'my_location' },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
} as const satisfies Record<string, StormIcon>;
