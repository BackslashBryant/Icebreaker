# Icebreaker MVP Readiness Review

**Date**: 2025-11-16  
**Author**: Codex (Senior Dev)  
**Scope**: Evaluate whether two people can install Icebreaker on separate laptops and complete the full flow without help.

---

## Executive Summary

The codebase is in strong shape: the backend exposes onboarding, safety, profile, and WebSocket chat services (`backend/src/index.js:1-55`), and the React client implements every vision-critical flow from onboarding to chat acceptance (`frontend/src/pages/Onboarding.tsx:1-200`, `frontend/src/hooks/useRadar.ts:1-104`, `frontend/src/hooks/useChat.ts:1-168`). Test suites exist for backend, frontend, and Playwright smoke/perf checks, and the CI pipeline enforces guardrails (`.github/workflows/ci.yml:1-210`). However, the repo still assumes a single developer workstation. There is no documented way for two laptops to share one backend, no HTTPS story (Geolocation requires it), and critical docs like `Docs/development/DEVELOPMENT.md` and `Docs/PRODUCTION_READINESS.md` remain template placeholders. Before handing this to real users, we must finish the “field test” playbook, align environment defaults, and close the documentation gaps highlighted below.

---

## The Good

- **Feature coverage matches the vision**: Express routes and WebSocket handlers cover onboarding, chat, safety, panic, cooldowns, and radar scoring in one place (`backend/src/index.js:1-55`, `backend/src/services/SessionManager.js:1-200`, `backend/src/websocket/handlers.js:1-220`). On the client, the onboarding funnel, radar subscription, chat UX, profile controls, and safety toggles are all wired through hooks and components (`frontend/src/pages/Onboarding.tsx:1-200`, `frontend/src/hooks/useRadar.ts:1-104`, `frontend/src/hooks/useChat.ts:1-168`, `frontend/src/hooks/useLocation.ts:1-158`).
- **Safety + moderation baked in**: Session objects track safety flags, panic cooldowns, declines, and blocked IDs (`backend/src/services/SessionManager.js:22-200`). The radar signal engine demotes reported sessions and honors panic exclusions (`backend/src/services/SignalEngine.js:1-170`). Rate limiting (`backend/src/lib/rate-limiter.js:1-80`) and cooldown logic (`backend/src/config/cooldown-config.js:1-41`) ensure spam protection.
- **Tooling + CI ready for teams**: The repo ships custom guard scripts, MCP helpers, and a CI workflow that runs lint, type, unit, and persona smoke suites across browsers (`package.json:5-83`, `.github/workflows/ci.yml:1-210`). Deployment guides already reference Vercel + Railway URLs and rollback commands (`Docs/deployment.md:1-170`), so infra patterns exist even if they need verification.
- **Documentation for ports and flows**: README and ConnectionGuide describe the stack, features, endpoints, and safety protocols (`README.md:1-120`, `Docs/ConnectionGuide.md:1-60`). Quickstart explains how to boot both services locally (`QUICKSTART.md:7-99`).

---

## The Bad (needs attention soon)

1. **Docs still contain template placeholders** – `Docs/development/DEVELOPMENT.md` and `Docs/PRODUCTION_READINESS.md` explicitly say “Template placeholder” and even mention pnpm commands we do not ship (`Docs/development/DEVELOPMENT.md:1-61`, `Docs/PRODUCTION_READINESS.md:1-48`). Anyone outside the core team will copy inaccurate instructions.
2. **Plan + launch signals out-of-date** – `Docs/Plan.md` still points to Issue #6 as the active goal and leaves every acceptance checkbox unchecked (`Docs/Plan.md:3-140`). `Docs/launch-checklist.md` claims cross-browser/AAA status is done but leaves hosting, SSL, Sentry DSNs, and manual QA unchecked (`Docs/launch-checklist.md:8-58`), conflicting with the deployment guide that says production is already live (`Docs/deployment.md:5-146`). We need a single source of truth.
3. **Environment defaults do not match reality** – `env.example` still defines “canonical” ports 3000/3001/3002 even though the backend runs on 8000 and WebSockets piggyback there (`env.example:10-13`, `Docs/ConnectionGuide.md:7-56`). Anyone wiring laptops together from the template will point the wrong ports.
4. **No packaged “two laptop” story** – README + Quickstart only describe running both services on one machine and “open another incognito window” when you want a second user (`QUICKSTART.md:67-88`). There is no LAN/remote recipe (host exposes backend on 0.0.0.0, guest sets `VITE_API_URL`, optional tunneling/HTTPS steps), so two real laptops cannot interact without ad-hoc guidance.
5. **API client assumes same-origin dev proxy** – `frontend/src/lib/api-client.js` builds URLs by concatenating `VITE_API_URL` with `/api/...` and defaults to `""` (`frontend/src/lib/api-client.js:1-19`). This works only when the frontend dev server proxies to `localhost:8000`. There is no documented build profile or `.env` example for “connect to hosted backend,” so testers will misconfigure requests.
6. **Geolocation requires HTTPS everywhere but we only document `http://localhost`** – The onboarding Location step always calls `navigator.geolocation.getCurrentPosition` (`frontend/src/hooks/useLocation.ts:77-120`). Browsers block that API on plain HTTP when served from another host, so two laptops on a LAN (http://192.168.x.x) will fail silently. We need instructions for `vite --https` or for pointing both laptops to a hosted HTTPS frontend.

---

## The Ugly (blocking two-person installs)

1. **Field-test infra missing**: There is no script/runbook for “Host laptop exposes backend for guest laptop.” We need: 
   - backend start command that binds to `0.0.0.0`, sets `CORS_ORIGIN=*` (or configured host), and documents firewall rules.
   - instructions for the guest to set `VITE_API_URL` (and `VITE_WS_URL` if we split) before `npm run dev` or `npm run build`.
   - fallback of deploying to the documented Railway instance + handing the Vercel URL to testers, then validating those URLs are still alive (`Docs/deployment.md:11-146`).
   Without this, “two laptops” means “two tabs on the same machine,” which is not what the brief asked.

2. **HTTPS + certificates unspecified**: Geolocation and Service Workers demand HTTPS on anything besides `localhost`. Neither Quickstart nor ConnectionGuide mention enabling HTTPS locally or using a tunnel like `ngrok` that issues a cert (`QUICKSTART.md:67-99`, `Docs/ConnectionGuide.md:5-56`). Real laptops will default to HTTP and immediately fail at the Location step.

3. **Status tracking drift**: Multiple docs disagree on what’s done (Plan says Issue #6 in progress; Launch checklist says tests done but hosting incomplete; Deployment claims production URLs exist). Until we reconcile this, we cannot answer “Is the MVP ready?” with confidence.

---

## Remaining Issues / Specs to Reach “Two Laptops” MVP

1. **Two-Device Field Test Runbook**  
   - Write `Docs/guides/two-laptop-field-test.md` (or similar) with step-by-step host/guest instructions: required ports, commands, environment overrides, `vite --host --https`, and `VITE_API_URL` / `VITE_WS_URL` settings.  
   - Add npm scripts (e.g., `npm run fieldtest:host`, `npm run fieldtest:guest`) that set `HOST=0.0.0.0`, `CORS_ORIGIN`, and point to the hosted backend automatically.

2. **HTTPS Story**  
   - Provide mkcert instructions or integrate `npm run dev -- --https` defaults.  
   - Document tunneling (ngrok/Cloudflare) for ad-hoc remote pairing and update `Docs/ConnectionGuide.md`.

3. **Environment Alignment**  
   - Update `env.example` and docs to match actual ports (`8000` backend, `3000` frontend) and include `VITE_API_URL` / `VITE_WS_URL` placeholders.  
   - Ensure Quickstart and README reference those env vars when explaining multi-device setups.

4. **Doc Refresh**  
   - Replace the template placeholders in `Docs/development/DEVELOPMENT.md` and `Docs/PRODUCTION_READINESS.md` with real instructions drawn from README/Quickstart/Deployment.  
   - Update `Docs/Plan.md` to reflect the current initiative (this review + upcoming fixes) and archive the Issue #6 checklist.  
   - Reconcile `Docs/launch-checklist.md` and `Docs/deployment.md` so status flags and checkboxes match reality.

5. **Verification Pass**  
   - Re-run backend/frontend unit suites and the Playwright smoke plan against the “two laptop” configuration once it exists. Export artifacts to `Docs/testing/` so we have a dated record backing the MVP claim.

6. **Production Endpoint Validation**  
   - Ping the published Vercel + Railway URLs weekly (or add uptime monitoring) to verify they still run the current `main`. If they’re stale, either redeploy or remove the claims from `Docs/deployment.md`.

---

## Recommendations (next actions)

1. **Create the two-laptop guide + scripts first** – This directly answers the user ask and exposes any hidden assumptions (firewalls, geolocation, token storage). Do this work on a dedicated issue so we can test it end-to-end.
2. **Align env + docs in the same PR** – Update `env.example`, README, Quickstart, ConnectionGuide, and the new guide simultaneously, then add a Smoke test that fails CI when those ports drift.
3. **Use this report as the new Plan checkpoint** – Add a summary section to `Docs/Plan.md` referencing this file, then log the follow-up issues (field test runbook, doc refresh, env alignment, HTTPS story). This keeps future agents from spinning up half-complete branches based on stale Issue #6 checklists.

Once those items ship (and we validate via an actual two-laptop dry run), we can confidently say the MVP is ready for real humans outside the repo.
