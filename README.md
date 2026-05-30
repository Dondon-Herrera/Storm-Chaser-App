# Storm Chaser App

**Author:** Dondon Reyes Herrera  
**Assessment:** Speer Technologies — Mobile Development (Storm Chaser)

A cross-platform mobile app for **storm-chasing hobbyists and weather enthusiasts**. It combines live meteorological data, photo-based field documentation, and local persistence so you can track conditions, log intercepts with evidence, and review past events on a map—all from one Expo app that runs on **iOS, Android, and web**.

---

## What this project is

Storm Chaser is a **take-home assessment** implementation: a production-style React Native app that demonstrates skills the client asked for—**fetching remote data**, **device geolocation**, **camera integration**, **local storage**, and **multi-screen navigation**—with optional senior-level extras (forecast, map, offline cache, theming, tests, and documentation).

### What you can do in the app

| Area | What it does |
|------|----------------|
| **Storm Command** (Weather tab) | Loads current weather for your GPS position via [Open-Meteo](https://open-meteo.com/), shows temperature, wind, precipitation, rain chance, chase-readiness score, 5-day outlook, and optional NOAA alerts. Shows a **Not Found** state if data cannot be loaded; can fall back to cached weather when offline. |
| **Storm Log** | Lists saved storm reports. Create a **New intercept**: take a photo (or pick from library), auto-fill or enter weather metadata, GPS coordinates, storm type, notes, and date/time—then save locally. |
| **Tactical Map** | Plots documented storm locations (and your last weather fix). Filter by storm type, open full report details, and **Navigate to cell** in Google/Apple Maps. |
| **Report dossier** | View one intercept: photo, classification, weather readings, notes, timeline, delete, or navigate to coordinates. |

### Who it is for

- **Reviewers** evaluating the Speer assessment (requirements, code quality, architecture, tests, disclosures).
- **Developers** cloning the repo to run, extend, or study an Expo Router + service-layer layout.

---

## How it works (high level)

1. **Weather** — `expo-location` gets coordinates → Open-Meteo returns current conditions + daily forecast → results cached on device for offline use.
2. **Storm reports** — `expo-image-picker` captures or selects a photo → form binds location, weather fields, and user notes → `StormReport` saved via **SQLite** (native) or **localStorage** (web).
3. **Map** — Reads stored reports + cached weather position → renders pins (OpenStreetMap embed on web, static map image on native) → external maps for navigation.
4. **UI** — Shared design system (`src/components/ui/*`), storm-themed layout over optional background video, tabs for Weather / Storm Log / Map.

```text
User → Tabs (Weather | Log | Map)
         ↓
       Services (weather, camera, storage, maps, intelligence)
         ↓
       Device (GPS, camera, SQLite / localStorage)
         ↓
       APIs (Open-Meteo; NWS on native only)
```

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Framework | [Expo SDK 56](https://docs.expo.dev/) + React Native + TypeScript |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes) |
| Weather API | [Open-Meteo](https://open-meteo.com/) (no API key required) |
| Alerts (bonus) | [weather.gov](https://api.weather.gov) — native devices; limited on web (CORS) |
| Persistence | `expo-sqlite` (iOS/Android), `localStorage` (web) |
| Camera / photos | `expo-image-picker` |
| Tests | Jest + `jest-expo` (22 unit tests) |

---

## Getting started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- [Expo Go](https://expo.dev/go) on a phone, or Android Studio / Xcode for simulators

### Install and run

```bash
git clone <your-repo-url>
cd storm-chaser-app
npm install
npx expo start
```

Then press:

- **w** — web browser  
- **i** — iOS simulator or device (Expo Go)  
- **a** — Android emulator or device (Expo Go)

### First-run permissions

Allow **location** (weather + report coordinates) and **camera / photos** when prompted on **New intercept**.

### Optional environment variables

Copy [`.env.example`](./.env.example) to `.env.local` (do **not** commit secrets):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_USE_MOCK_WEATHER=true` | Demo weather when the API or network is unavailable |
| `EXPO_PUBLIC_CLOUD_PROVIDER` | Label for cloud sync stub (e.g. `supabase`) |
| `EXPO_PUBLIC_CLOUD_SYNC_URL` | Endpoint placeholder for future upload integration |

### Native builds (camera permissions in `app.json`)

If you change permissions or plugins, rebuild the native app:

```bash
npx expo run:android
# or
npx expo run:ios
```

### Missing image assets

If tab icons or app icons are missing locally:

```bash
npm run generate-assets
```

---

## Project structure

```text
storm-chaser-app/
├── src/
│   ├── app/                 # Screens (Expo Router)
│   │   ├── index.tsx        # Storm Command (weather)
│   │   ├── map.tsx          # Tactical map
│   │   └── log/             # Storm log list, new report, detail
│   ├── components/ui/       # Reusable UI (Button, Card, Map, etc.)
│   ├── hooks/               # NWS alerts, field dashboard, theme
│   ├── lib/                 # Business logic & APIs
│   │   ├── weather.ts       # Open-Meteo + cache
│   │   ├── camera.ts        # Photo capture / library
│   │   ├── storage*.ts      # Storm reports persistence
│   │   ├── map-utils.ts     # Map URLs, distance, navigation
│   │   └── storm-intelligence.ts  # Chase scoring
│   └── constants/theme.ts   # Design tokens
├── __tests__/               # Unit tests
├── assets/video/            # Background video
├── AI-DISCLOSURE.md         # AI tools disclosure (required)
├── TIME_LOG.md              # Time spent log (required)
└── .maestro/smoke.yaml      # Optional E2E smoke test
```

---

## Architecture and design decisions

**Pattern:** layered architecture—**screens** call **hooks** and **services**; services talk to **APIs** and **storage**; UI components stay presentational where possible.

| Decision | Rationale |
|----------|-----------|
| **Expo + TypeScript** | Fast cross-platform delivery; strong typing for assessment quality. |
| **Open-Meteo** | Free, no API key, fits “use a free weather API” requirement. |
| **Platform-split storage** | SQLite on native for proper local DB; localStorage on web for Expo web support. |
| **`StormReport` model** | Single schema for photo URI, storm type, weather fields, coords, timestamps, notes. |
| **Service modules** | `loadWeatherForDevice()`, `captureStormPhotoAsync()`, etc. keep screens thin and testable. |
| **Not Found UX** | Explicit weather failure state per spec; route 404 uses `+not-found.tsx`. |
| **Cloud sync stub** | Integration point without committing API keys (senior bonus). |
| **AI disclosure + time log** | Separate markdown files per assessment instructions. |

---

## Assessment requirements (mapping)

### Required features

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | Weather view: location-based data, key met fields, Not Found | `src/app/index.tsx`, `src/lib/weather.ts`, `src/lib/load-weather.ts` |
| 2 | Storm documentation: camera + metadata | `src/app/log/new.tsx`, `src/lib/camera.ts` |
| 3 | Local persistence + data models | `src/lib/storage.ts`, `StormReport` type |
| 4 | Intuitive navigation | Tab bar + stack routes under `src/app/log/` |

### Senior bonus features

Forecast · Map visualization · Offline weather cache · Dark/light theme · Skeleton loaders · Pull-to-refresh · Cloud integration stub (no keys in repo).

### Grading deliverables

| Item | Location |
|------|----------|
| Unit tests (≥1) | `npm test` — 22 tests in `__tests__/` |
| README (this file) | Setup, architecture, requirements |
| Reusable components | `src/components/ui/*` |
| AI disclosure | [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) |
| Time log | [TIME_LOG.md](./TIME_LOG.md) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run lint` | ESLint via Expo |
| `npm run generate-assets` | Generate placeholder PNGs if missing |
| `maestro test .maestro/smoke.yaml` | Smoke test (requires [Maestro](https://maestro.mobile.dev)) |

---

## Testing

```bash
npm test
```

Covers chase scoring, map utilities, weather helpers, camera flow (mocked), cloud sync stub, and route param parsing. Type-check: `npx tsc --noEmit`.

---

## Notes for reviewers

- **Weather:** Deny location only after opening Weather once with cache—you may still see cached data. True **Not Found** when GPS and network both fail with no cache.
- **NWS alerts:** Best on **iOS/Android**; web may show an explanatory message (browser limits on `api.weather.gov`).
- **Photos:** Use **Take photo** on device; use **Choose from library** on simulators or web.
- **Cloud sync:** UI + `src/lib/cloud-sync.ts` stub only—wire your provider locally via env vars.
- **Transparency:** See [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) and [TIME_LOG.md](./TIME_LOG.md) (4.0 hours total).

---

## License

See [LICENSE](./LICENSE).
