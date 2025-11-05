# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
