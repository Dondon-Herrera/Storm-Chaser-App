# Storm Chaser App

**Author:** Dondon Reyes Herrera  
**Assessment:** Speer Technologies Mobile Development — Storm Chaser App

A cross-platform storm-chasing companion built with **Expo SDK 56** and **React Native**. Track live weather, official NWS alerts, chase readiness scoring, field intercepts, and navigation to storm cells.

## Features

| Screen | Capabilities |
|--------|----------------|
| **Storm Command** | Live weather, chase score, NWS alerts, push alerts (native), 5-day outlook, field dashboard |
| **Storm Log** | Photo + GPS reports, SQLite (native) / localStorage (web), pull-to-refresh |
| **Tactical Map** | Interactive OSM map (web), static map (native), filters, navigate to cell |
| **Report dossier** | Full metadata + **Navigate to cell** (Google/Apple Maps) |

## Production-grade additions

- **Unit tests** — Jest coverage for chase scoring and map utilities (`npm test`)
- **NWS alerts** — Live [weather.gov](https://api.weather.gov) active alerts for your coordinates
- **Push notifications** — Local alerts when chase readiness is high or extreme (iOS/Android)
- **Accessibility** — Labels on buttons, chase score card, and scroll regions
- **E2E smoke flow** — Maestro script in `.maestro/smoke.yaml`

## Tech stack

- Expo Router · Open-Meteo · NOAA NWS API · expo-notifications · expo-sqlite · expo-haptics
- Background video: `assets/video/default.mp4`

## Get started

```bash
npm install
npx expo start
```

Press **w** (web), **i** (iOS), or **a** (Android).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm test` | Run unit tests |
| `npm run lint` | ESLint |
| `maestro test .maestro/smoke.yaml` | E2E smoke (requires [Maestro](https://maestro.mobile.dev)) |

## Project structure

```
src/app/              Screens (index, map, log/*)
src/components/ui/    Design system
src/lib/              Weather, NWS, notifications, maps, intelligence
__tests__/            Unit tests
.maestro/             E2E smoke flow
```

## Notes for reviewers

- Grant **location** for live weather and NWS alerts.
- **Notifications** require permission on a physical device or simulator (not on web).
- Storm reports need a **photo** and valid coordinates before saving.
