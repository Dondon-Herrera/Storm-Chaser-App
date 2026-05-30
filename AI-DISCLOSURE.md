# AI-Assisted Development Disclosure

**Project:** Storm Chaser App  
**Author:** Dondon Reyes Herrera  
**Context:** Speer Technologies — Mobile Development Assessment

---

## 1. Purpose

This document fulfills the assessment requirement to disclose the use of AI tools during development. It describes the **scope**, **governance**, and **division of responsibility** between human engineering judgment and AI-assisted output.

---

## 2. Executive summary

I am the **primary architect and engineer** for this application. I defined the product workflow, technical approach, data model, integrations, and acceptance criteria alignment with the assessment brief.

**Cursor** (Claude / Composer agents) was used as a **development accelerator**—primarily for debugging, refactoring, requirement traceability, test scaffolding, and documentation drafting. It was **not** used to delegate end-to-end ownership of design or implementation.

All AI-suggested changes were subject to **review, validation, and manual revision** before inclusion in the repository. Final accountability for behavior, structure, and submission quality remains with me.

---

## 3. Tools and references

| Resource | Role in this project |
|----------|----------------------|
| **Cursor (Claude / Composer)** | Directed assistance: error analysis, targeted refactors, spec gap analysis, Jest configuration, README/disclosure drafting |
| **[Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/)** | Authoritative reference for API usage; used to validate agent recommendations |
| **Open-Meteo / NOAA NWS public APIs** | Integrated per assessment requirements; behavior and failure modes defined by me |

---

## 4. Scope of AI use

### 4.1 In scope (under explicit direction)

- Diagnosing runtime and build errors (e.g. routing conflicts, Jest module resolution, React effect dependency loops)
- Refactoring for separation of concerns (`load-weather.ts`, `camera.ts`, storage abstractions)
- Cross-checking implementation against written requirements
- Generating initial test boilerplate and mock configurations
- Drafting and restructuring project documentation

### 4.2 Out of scope

- Autonomous product definition or feature prioritization
- Unreviewed commits of generated code
- Substitution for manual QA on target platforms
- Inclusion of credentials, API keys, or proprietary third-party secrets

---

## 5. Developer ownership (authoritative decisions)

The following were **defined and directed by me** prior to or independent of AI assistance:

| Domain | Decisions owned |
|--------|-----------------|
| **Product** | Storm-chaser workflow: live weather → field capture → local archive → map-based review |
| **Navigation** | Tab model (Weather, Storm Log, Map); Expo Router stack under `/log` |
| **Data** | `StormReport` schema; SQLite (native) / `localStorage` (web); weather cache strategy |
| **Integrations** | Open-Meteo (weather), `expo-image-picker` (evidence capture), optional NWS alerts |
| **Business rules** | Chase readiness scoring, map filtering, Not Found semantics, offline fallback behavior |
| **UX** | Screen content, pull-to-refresh, skeleton loading states, camera vs library capture paths |
| **Compliance** | Requirement mapping (core vs senior bonus); `TIME_LOG.md`; cloud sync stub without secrets |
| **Process** | Incremental, task-scoped prompts aligned to a pre-existing implementation plan |

---

## 6. AI-assisted work and human oversight

| Workstream | AI contribution | Human oversight |
|------------|-----------------|-----------------|
| Debugging & stabilization | Root-cause hypotheses, patch proposals | I selected fixes and verified in Expo (web / native) |
| Refactoring | Service extraction, deduplication | I approved module boundaries and naming |
| Requirements alignment | Gap analysis vs assessment brief | I scoped and accepted each change set |
| Unit tests | Jest setup, sample tests, mocks | I ran `npm test` and adjusted cases to reflect real behavior |
| Documentation | Structural drafts for README and disclosures | I edited for accuracy, tone, and factual alignment |
| UI implementation | Component and token patterns | I tuned layout, copy, and interaction to match intended UX |

**Policy:** AI output is treated as **provisional**—equivalent to a junior draft or stack-overflow snippet—until it passes the quality gates below.

---

## 7. Quality gates (standard practice)

Before accepting AI-influenced code, I applied:

1. **Code review** — Read diffs for correctness, scope, and architectural fit  
2. **Static analysis** — `npm run lint`, `npx tsc --noEmit`  
3. **Automated tests** — `npm test` (22 unit tests at time of submission)  
4. **Runtime validation** — Manual exercise of affected flows on web and/or device  
5. **Scope control** — Rejection or simplification of over-broad or out-of-spec suggestions  

Representative corrections applied after AI suggestions (developer-led):

- Resolved Expo Router conflict between `log.tsx` and `log/` stack routes  
- Prevented weather UI regression during pull-to-refresh  
- Hardened photo capture (camera + library) and permission configuration  
- Eliminated NWS fetch infinite re-render (`useEffect` dependency discipline)  
- Calibrated disclosure and README language to reflect actual engineering process  

---

## 8. Attribution summary

| Layer | Primary author |
|-------|----------------|
| Product & UX intent | Dondon Reyes Herrera |
| System architecture & module design | Dondon Reyes Herrera |
| Core logic, APIs, and persistence | Dondon Reyes Herrera |
| AI-assisted drafts & diagnostics | Cursor (under directed prompts) |
| Final integration, QA, and submission | Dondon Reyes Herrera |

**Conclusion:** This codebase reflects **senior-led design and implementation**, with AI used to **increase throughput** on well-bounded tasks—not to replace engineering judgment or ownership.

---

## 9. Related artifacts

- [README.md](./README.md) — Project overview, setup, and requirement traceability  
- [TIME_LOG.md](./TIME_LOG.md) — Time investment log  

---

## 10. Contact

I welcome questions from reviewers regarding authorship, specific files, or the development process. I can articulate which decisions were made upfront versus which emerged during AI-assisted iteration.

**Dondon Reyes Herrera**
