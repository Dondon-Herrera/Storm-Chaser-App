# Time Log — Storm Chaser App

**Author:** Dondon Reyes Herrera  
**Assessment:** Speer Technologies Mobile Development — Storm Chaser App  
**Repository:** storm-chaser-app

This file satisfies the assessment requirement to **keep a log of time spent** and include it with the submission.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total time spent** | **4.0 hours** |
| **Primary stack** | Expo SDK 56, React Native, TypeScript |
| **Platforms tested** | Web, Android / iOS (Expo Go, as available) |
| **Working style** | Single focused build session; incremental tasks with Cursor for debugging and refactoring ([AI-DISCLOSURE.md](./AI-DISCLOSURE.md)) |

---

## Time log by phase

| Phase | Activity | Hours | Notes |
|-------|----------|-------|-------|
| 1 | Project setup — Expo Router, tabs, folder structure, dependencies | 0.25 | Baseline app shell and navigation |
| 2 | Weather screen — location, Open-Meteo, metrics, Not Found, cache | 0.75 | Core requirement #1 |
| 3 | Storm log — camera / library, metadata form, local persistence | 1.00 | Core requirements #2–3 |
| 4 | Map — storm pins, filters, map view, navigate to cell | 0.50 | Senior bonus + assessment map |
| 5 | UI & UX — theme, components, background video, responsive layout | 0.50 | Design system and polish |
| 6 | Senior extras — forecast, offline cache, pull-to-refresh, skeletons, NWS stub, cloud stub | 0.50 | Bonus features bundled |
| 7 | Quality — unit tests, lint/tsc, bug fixes (e.g. routing, refresh loop) | 0.25 | `npm test`, stabilization |
| 8 | Documentation & QA — README, disclosures, final run-through | 0.25 | Submission artifacts |
| | **Total** | **4.00** | |

---

## Time by assessment area

| Area | Hours | % of total | Deliverables |
|------|-------|------------|----------------|
| **Required features** — weather, storm log, persistence, navigation | **2.25** | 56% | `index.tsx`, `log/*`, `storage.*`, `app-tabs*` |
| **Senior bonus** — forecast, map UX, offline, theme, skeleton, refresh, cloud stub | **1.00** | 25% | `forecast-outlook`, `map.tsx`, `cloud-sync.ts`, cache, UI kit |
| **Grading & submission** — tests, README, AI disclosure, time log, QA | **0.75** | 19% | `__tests__/`, docs, verification |
| **Total** | **4.00** | 100% | |

---

## Time by work type

| Work type | Hours | Description |
|-----------|-------|-------------|
| **Design & implementation** (author-led) | 2.50 | Feature logic, data model, screen flows, integration choices |
| **UI / presentation** | 0.75 | Components, theme, layout, video background |
| **Debugging & refactoring** (incl. Cursor-assisted) | 0.50 | Routing, Jest, effect loops, camera/NWS edge cases |
| **Documentation & compliance** | 0.25 | README, `AI-DISCLOSURE.md`, `TIME_LOG.md` |
| **Total** | **4.00** | |

---

## AI-assisted time (cross-reference)

AI tooling time is **included in the phases above**, not added on top. See [AI-DISCLOSURE.md](./AI-DISCLOSURE.md).

| Category | Approx. share of the 4 hours |
|----------|------------------------------|
| Author-led design, coding, and decisions | ~65% |
| Cursor-assisted debugging, refactor, and doc drafts | ~35% |

---

## Submission checklist

- [x] Working app (Weather, Storm Log, Map)
- [x] README with setup and decisions
- [x] [AI-DISCLOSURE.md](./AI-DISCLOSURE.md)
- [x] [TIME_LOG.md](./TIME_LOG.md) (this file)
- [x] Unit tests (`npm test`)
- [x] No API keys or secrets in repository

---

*Recorded total: 4.0 hours · Last updated: May 2026*
