# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### MVP Onboarding Flow (Issue #1)
- Welcome screen with retro logo, brand moment ("Real world. Real time. Real connections."), and CTAs
- 4-step onboarding flow: What We Are/Not → 18+ Consent → Location Explainer → Vibe & Tags
- Backend onboarding API endpoint (`POST /api/onboarding`) with session management
- In-memory session storage with TTL (1 hour default)
- Anonymous handle generation from vibe + tags (e.g., "ChillWit42")
- React Router setup with routes: `/welcome`, `/onboarding`, `/radar`
- shadcn/ui components (Button, Checkbox) with Icebreaker brand styling
- Tailwind CSS with Icebreaker brand colors (deep navy, neon teal)
- Unit tests for onboarding components (≥80% coverage target)
- E2E test for complete onboarding flow with accessibility checks

### Technical Details
- Frontend: React + Vite + React Router + shadcn/ui (Radix UI)
- Backend: Express.js with session management (in-memory Map with TTL cleanup)
- Session tokens: Signed tokens (MVP), JWT for production
- Location: Browser Geolocation API (approximate only, skip option available)
- Accessibility: WCAG AA compliance via Radix UI primitives
- Testing: Vitest for unit tests, Playwright for E2E tests

### Verified
- ✅ Welcome screen displays brand moment and CTAs
- ✅ All 4 onboarding steps render and function correctly
- ✅ Form validation prevents submission without required fields
- ✅ Keyboard navigation works throughout (WCAG AA)
- ✅ Screen reader support (ARIA labels)
- ✅ Geolocation API integration works (with skip option)
- ✅ Handle generation from vibe + tags
- ✅ API integration: Success navigates to Radar, errors displayed
- ✅ `POST /api/onboarding` accepts valid request and returns session
- ✅ Session storage works (in-memory Map with TTL)
- ✅ TTL cleanup removes expired sessions
- ✅ Error handling: 400 for invalid data, 500 for server errors
- ✅ All tests passing: Backend (15/15), Frontend (35/35), E2E (8/8)
- ✅ Code coverage: 94.74% average for onboarding components (target: ≥80%)
- ✅ WCAG AA compliance: Verified via Playwright axe checks

### Test Results
- **Backend unit tests**: 15/15 passing (health, SessionManager, onboarding API)
- **Frontend unit tests**: 35/35 passing (Welcome, Onboarding, all step components)
- **E2E tests**: 8/8 passing (complete flow, accessibility, keyboard nav, error handling)
- **Code coverage**: Onboarding components average 94.74% (above 80% target)
- **Accessibility**: WCAG AA compliance verified (axe checks pass)

See `.notes/features/onboarding-flow/gap-analysis.md` for complete DoD verification.

## [0.1.0] - 2025-01-27

### Added

#### Bootstrap Web Health MVP
- Backend health endpoint (`GET /api/health`) returning `{ status: "ok" }`
- Frontend health status component displaying API response
- Test suite: 7 tests (2 backend unit, 2 frontend unit, 3 E2E)
- Express.js backend on port 8000 with CORS enabled
- React + Vite frontend on port 3000 with API proxy
- Vitest configuration for unit tests
- Playwright configuration for E2E tests

### Technical Details
- Backend: Express.js server with health route
- Frontend: React component with fetch API integration
- Testing: Vitest for unit tests, Playwright for E2E
- Ports: Backend 8000, Frontend 3000 (documented in `docs/ConnectionGuide.md`)

### Verified
- ✅ Health API returns JSON `{ status: "ok" }`
- ✅ Frontend renders health status with passing tests
- ✅ Playwright smoke test covers API + UI

See `.notes/features/bootstrap-web-health-mvp/progress.md` for full test results and implementation details.
