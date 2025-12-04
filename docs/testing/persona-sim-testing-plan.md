# Persona-Simulated User Testing Plan

Status: Draft v1
Owner: QA/DevX
Scope: Frontend + Tests + Mocked backend transport

## Purpose

Create realistic, persona-driven, automated user testing without a live user base. This plan layers deterministic multi-user simulation, geolocation realism, visual checks, and telemetry so each run yields credible UX feedback and catches regressions in look-and-feel.

## High-Impact Priorities

1) WebSocket mock + multi-user harness for Radar presence and matching
2) Geolocation realism (permissions + coordinates) per persona
3) UX telemetry capture and automatic feedback summaries
4) Visual regression for key screens across device viewports
5) Stable selectors via `data-testid` mapping

## Multi-User Simulation (WebSocket Mock)

### Overview

Inject a Playwright-controlled mock transport that emulates backend WebSocket presence, tags, vibes, proximity, and visibility. Toggle with `PLAYWRIGHT_WS_MOCK=1` to run without real backend.

### Mock Interface (TypeScript)

```ts
// tests/mocks/websocket-mock.ts
export type PersonaPresence = {
  sessionId: string;
  handle: string;
  vibe: 'thinking' | 'intros' | 'banter' | 'surprise';
  tags: string[];
  visible: boolean;
  geo?: { lat: number; lon: number; floor?: number };
};

export type PresenceScript = {
  venue: string; // e.g., 'campus-library', 'coworking-downtown'
  personas: PersonaPresence[];
};

export class WsMock {
  private script: PresenceScript;
  private connections: Map<string, (msg: any) => void> = new Map();

  constructor(script: PresenceScript) {
    this.script = script;
  }

  // Called by the app’s WS shim when connecting
  connect(sessionId: string, onMessage: (msg: any) => void) {
    this.connections.set(sessionId, onMessage);
    this.broadcastPresence();
  }

  disconnect(sessionId: string) {
    this.connections.delete(sessionId);
  }

  setVisibility(sessionId: string, visible: boolean) {
    const p = this.script.personas.find(p => p.sessionId === sessionId);
    if (p) p.visible = visible;
    this.broadcastPresence();
  }

  updateGeo(sessionId: string, lat: number, lon: number, floor?: number) {
    const p = this.script.personas.find(p => p.sessionId === sessionId);
    if (p) p.geo = { lat, lon, floor };
    this.broadcastPresence();
  }

  private broadcastPresence() {
    const visible = this.script.personas.filter(p => p.visible !== false);
    const payload = {
      type: 'presence:update',
      personas: visible,
    };
    for (const send of this.connections.values()) send(payload);
  }
}
```

### App Integration (Shim)

Add a small runtime shim so the app uses mock WS when `PLAYWRIGHT_WS_MOCK=1`.

```ts
// frontend (example) pseudo-code: src/lib/ws.ts
declare const PLAYWRIGHT_WS_MOCK: string | undefined;
let ws: WebSocket | { send: (m: any) => void; close: () => void };

export function connect(sessionId: string, onMsg: (msg: any) => void) {
  if (process.env.PLAYWRIGHT_WS_MOCK === '1') {
    // Expose global in tests: (global as any).__WS_MOCK__
    const mock = (window as any).__WS_MOCK__ as import('../../tests/mocks/websocket-mock').WsMock;
    mock.connect(sessionId, onMsg);
    return () => mock.disconnect(sessionId);
  }
  // else real WebSocket
  ws = new WebSocket(`${location.origin.replace('http', 'ws')}/ws`);
  ws.onmessage = (e) => onMsg(JSON.parse(e.data));
  return () => ws.close();
}
```

### Playwright Usage

```ts
// tests/e2e/fixtures/ws-mock.setup.ts
import { test as base } from '@playwright/test';
import { WsMock } from '../mocks/websocket-mock';
import script from '../fixtures/persona-presence/campus-library.json';

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(({ script }) => {
      // Attach mock to window before app boots
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      (window as any).__WS_MOCK__ = new (require('../mocks/websocket-mock').WsMock)(script);
    }, { script });
    await use(context);
  },
});
export const expect = test.expect;
```

## Persona Presence Scripts

### Persona Presence Loader (source of truth)

- Location: `tests/fixtures/persona-presence/loader.ts`
- Exports:
  - `loadFixture(venue: string): PersonaPresenceScript`
  - `getAvailableVenues(): string[]`
  - `hasFixture(venue: string): boolean`
- Fixtures available: `campus-library`, `coworking-downtown`, `gallery-opening`, `chat-performance-test`
- When to use: prefer loader for tests and mocks to keep fixture names aligned; direct JSON imports still work for backward compatibility.

#### Playwright example (WS mock setup)
```ts
// tests/e2e/fixtures/ws-mock.setup.ts
import { test as base } from '@playwright/test';
import { loadFixture } from '../fixtures/persona-presence/loader';
import { WsMock } from '../mocks/websocket-mock';

export const test = base.extend({
  context: async ({ context }, use) => {
    const script = loadFixture('campus-library');
    await context.addInitScript(({ script }) => {
      (window as any).__WS_MOCK__ = new (require('../mocks/websocket-mock').WsMock)(script);
    }, { script });
    await use(context);
  },
});
export const expect = test.expect;
```

#### Backend/Vitest example
```js
// backend/tests/persona-loader.test.js
import { loadFixture, getAvailableVenues, hasFixture } from '../../tests/fixtures/persona-presence/loader.ts';
import { describe, it, expect } from 'vitest';

describe('Persona Presence Fixture Loader (Backend)', () => {
  it('loads fixture by venue', () => {
    const script = loadFixture('campus-library');
    expect(script.venue).toBe('campus-library');
    expect(script.personas.length).toBeGreaterThan(0);
  });

  it('lists venues and validates presence', () => {
    const venues = getAvailableVenues();
    expect(venues).toContain('gallery-opening');
    expect(hasFixture('non-existent')).toBe(false);
  });
});
```

#### Compatibility and temporary notes
- Direct JSON imports remain supported; loader is the canonical path for shared tests/mocks.
- Current E2E gating: Firefox/WebKit/msedge skips and axe filters are documented in the plan file; loader usage is unaffected and stable on chromium path.

### Schema

```ts
// tests/fixtures/persona-presence/schema.d.ts
export interface PersonaPresenceScript {
  venue: string;
  personas: Array<{
    sessionId: string;
    handle: string;
    vibe: string;
    tags: string[];
    visible?: boolean;
    geo?: { lat: number; lon: number; floor?: number };
  }>;
}
```

### Example

```json
// tests/fixtures/persona-presence/campus-library.json
{
  "venue": "campus-library",
  "personas": [
    {
      "sessionId": "maya-session",
      "handle": "QuietThinker42",
      "vibe": "thinking",
      "tags": ["Quietly Curious", "Overthinking Things"],
      "visible": true,
      "geo": { "lat": 37.8716, "lon": -122.2727, "floor": 2 }
    },
    {
      "sessionId": "zoe-session",
      "handle": "MellowWildcard56",
      "vibe": "surprise",
      "tags": ["Overthinking Things", "Lo-fi head"],
      "visible": true,
      "geo": { "lat": 37.8716, "lon": -122.2727, "floor": 3 }
    }
  ]
}
```

## Geolocation Helper

```ts
// tests/utils/geolocation.ts
import { BrowserContext } from '@playwright/test';

export async function setPersonaGeo(
  context: BrowserContext,
  geo: { lat: number; lon: number },
) {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: geo.lat, longitude: geo.lon });
}
```

Usage in persona tests:

```ts
import { setPersonaGeo } from '../../utils/geolocation';
import script from '../../fixtures/persona-presence/campus-library.json';

test('Maya sees Zoe with boosted score', async ({ browser }) => {
  const maya = await browser.newContext();
  const zoe = await browser.newContext();

  await setPersonaGeo(maya, script.personas[0].geo!);
  await setPersonaGeo(zoe, script.personas[1].geo!);

  const pageA = await maya.newPage();
  const pageB = await zoe.newPage();
  await pageA.goto('/radar');
  await pageB.goto('/radar');

  await expect(pageA.getByText(/MellowWildcard56/)).toBeVisible();
  await expect(pageB.getByText(/QuietThinker42/)).toBeVisible();
});
```

## Telemetry Writer

### Per-Run Metrics

```ts
// tests/utils/telemetry.ts
import fs from 'fs';
import path from 'path';

export type PersonaRun = {
  name: string; sessionId: string;
  timings: { bootMs?: number; onboardingMs?: number };
  errors: string[];
  a11yViolations?: number;
};

export function writePersonaRun(run: PersonaRun) {
  const dir = path.join(process.cwd(), 'artifacts', 'persona-runs');
  fs.mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(path.join(dir, `${run.name}-${ts}.json`), JSON.stringify(run, null, 2));
}
```

### Aggregation (optional)

```ts
// tools/summarize-persona-runs.mjs
import fs from 'fs';
import path from 'path';

const dir = path.resolve('artifacts/persona-runs');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : [];
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const topIssues = new Map();
for (const r of runs) for (const e of r.errors || []) topIssues.set(e, (topIssues.get(e) || 0) + 1);

console.log('Persona Runs:', runs.length);
console.log('Top Issues:', [...topIssues.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5));
```

## Visual Regression

- Enable Playwright snapshots: `expect(page).toHaveScreenshot('welcome-mobile.png')`
- Capture for Welcome, Onboarding steps, Radar (empty/with users), Chat start/end, Panic, Profile.
- Run across viewports: mobile (375x812, 414x896), tablet (768x1024), desktop (1440x900).
- Store under `artifacts/visual/<persona>/<screen>.png`.

Example:

```ts
test('welcome screen visual - mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/welcome');
  await expect(page).toHaveScreenshot('welcome-mobile.png', { maxDiffPixelRatio: 0.02 });
});
```

## Selector Stability

- Add `data-testid` on critical elements: PRESS START, onboarding next, vibes, tags, panic button, visibility toggle, chat controls.
- Centralize queries in `tests/utils/selectors.ts` so copy/ARIA changes won’t break tests.

```ts
// tests/utils/selectors.ts
export const SEL = {
  ctaPressStart: '[data-testid="cta-press-start"]',
  vibeOption: (name: string) => `[data-testid="vibe-${name}"]`,
  tagChip: (name: string) => `[data-testid="tag-${name}"]`,
  panicButton: '[data-testid="panic-fab"]',
  visibilityToggle: '[data-testid="visibility-toggle"]',
};
```

## CI Strategy

- Split suites:
  - Smoke (fast): 1 per persona group, visual on Welcome + Radar
  - Full (nightly): all personas + WS-mock + visual matrix + a11y
- Publish HTML report + screenshots/videos + telemetry summary
- Quarantine flakey tests with auto-retry and tracking

## Next Steps Checklist

These items are tracked as separate GitHub issues (Persona Sim Testing Phase 2):

- [ ] **Issue #8**: Add `tests/mocks/websocket-mock.ts` and shim binding in app
- [ ] **Issue #9**: Add presence scripts under `tests/fixtures/persona-presence/`
- [ ] **Issue #10**: Add `tests/utils/geolocation.ts` and wire into persona specs
- [ ] **Issue #11**: Upgrade persona E2E suites to dual-context flows (Phase 2)
- [ ] **Issue #12**: Validate look-and-feel across devices, themes, reduced motion
- [ ] **Issue #13**: Add `data-testid` to critical UI and centralize selectors
- [ ] **Issue #14**: Add `tests/utils/telemetry.ts` and emit per-persona run JSON
- [ ] **Issue #15**: Create smoke vs full suites in Playwright config and CI
- [ ] **Issue #16**: Add keyboard-only, screen-reader, and WS failure coverage
- [ ] **Issue #17**: Add visual snapshot tests on key screens and viewports

**Note**: Main planning issue is **Issue #18** (Persona-Simulated User Testing with Look-and-Feel Validation). Issues #8-#17 are Phase 2 implementation backlog items.

See `.notes/features/persona-sim-testing/next-issues.md` for detailed scope and acceptance criteria for each issue.

