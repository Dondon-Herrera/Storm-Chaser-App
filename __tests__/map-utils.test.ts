import { buildStormMapUrl, getMapViewport, haversineKm } from '@/lib/map-utils';
import type { StormReport } from '@/lib/storage';

function mockReport(overrides: Partial<StormReport> = {}): StormReport {
  return {
    id: 1,
    photoUri: 'file://photo.jpg',
    stormType: 'Supercell',
    weatherCondition: 'Thunderstorm',
    notes: '',
    latitude: 35.4676,
    longitude: -97.5164,
    dateTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    temperature: 20,
    windSpeed: 40,
    precipitationProbability: 60,
    ...overrides,
  };
}

describe('getMapViewport', () => {
  it('returns null without points', () => {
    expect(getMapViewport([])).toBeNull();
  });

  it('centers on report cluster', () => {
    const viewport = getMapViewport([mockReport({ latitude: 35, longitude: -97 })]);
    expect(viewport?.centerLat).toBeCloseTo(35, 1);
    expect(viewport?.centerLon).toBeCloseTo(-97, 1);
    expect(viewport?.zoom).toBeGreaterThan(0);
  });
});

describe('buildStormMapUrl', () => {
  it('builds static map URL with markers', () => {
    const url = buildStormMapUrl([mockReport()]);
    expect(url).toContain('staticmap.openstreetmap.de');
    expect(url).toContain('markers');
  });
});

describe('haversineKm', () => {
  it('returns zero for identical coordinates', () => {
    expect(haversineKm(35, -97, 35, -97)).toBeCloseTo(0, 3);
  });

  it('returns positive distance for separated points', () => {
    const distance = haversineKm(35, -97, 36, -96);
    expect(distance).toBeGreaterThan(100);
  });
});
