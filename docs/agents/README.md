# Agents Roster (Stack-Agnostic)

| Agent | Purpose | Path Scope (guideline) | Model Hint |
|---|---|---|---|
| Vector | Planning, acceptance tests, owners | `/docs/**` | Reasoning |
| Forge | Backend APIs/services/db/migrations | `/api/**` `/server/**` `/db/**` `/migrations/**` | Codegen |
| Link | Web UI/components/state/a11y | `/app/**` `/pages/**` `/components/**` `/styles/**` | Codegen |
| Glide | Mobile Web/PWA, responsive, offline | `/app/**(mobile)` `/pwa/**` `/public/**` service worker | Codegen |
| Apex | Android native | `/android/**` | Codegen |
| Cider | iOS native | `/ios/**` | Codegen |
| Pixel | Tests only | `/tests/**` + test config | Reasoning |
| Muse | Docs: README/CHANGELOG/guides | `/docs/**` `README.md` `CHANGELOG.md` | Codegen |
| Nexus | DevOps: CI/env.example/previews | `.github/**` `/.ci/**` `Dockerfile` deploy config `env.example` `docs/github/**` | Codegen |
| Scout | Research (tools + sources) | `/docs/research.md` | Reasoning |
| Sentinel | Security review notes | `/docs/security/**` | Reasoning |

Active feature state lives under `.notes/features/`:
- `current.json` points to the working slug.
- `spec.md`, `progress.md`, and `docs/Plan.md` drive the MVP loop.
- Use the issue templates (**0 - Spec**, **1 - Plan**, **2 - Build**) to keep Cursor aligned.

**House Rules**
- Speak to a hobbyist; define jargon once. Tell the truth; if unsure, say "unknown".
- Message shape: Status -> Next 3 -> Question (optional).
- Read `.notes/features/current.json` and `/docs/Plan.md` before proposing work. Stay within MVP DoD scope.
- Small, reversible diffs. Hand off via @mentions when leaving your lane.
- Prefer Docfork MCP for library/API references; paste source snippets into `/docs/research.md`.

**Plan Mode (sequential)**
- Use `docs/process/MVP_LOOP.md` as the canonical flow.
- Start a feature by drafting or validating `/docs/Plan.md` with @Vector, then move agent-by-agent.

**Run Order (typical)**
Vector -> Pixel (tests scaffold) -> Forge/Link/Glide/Apex/Cider -> Pixel (verify) -> Muse (docs) -> Nexus (optional) -> Sentinel (if risk).

**Helpers**
- `npm run agents:prompt -- all` prints every prompt for quick copy/paste.
- `npm run agents:install-hook` installs the optional pre-commit path-scope guard (`--force` overwrites an existing hook).
- `npm run github:labels` seeds GitHub labels defined in `docs/github/labels.json`.
- `npm run github:issue -- <template> "<title>"` opens a GitHub issue using the local templates.
- Agent tooling quickstarts live under `docs/cursor/`:
  - `agent-tools.md` - enabling/disabling agent integrations safely.
  - `agent-browser.md` - how to run web research with automatic citations.
  - `agent-hooks.md` - wiring local automation to agent lifecycle events.
  - `symbols.md` - shorthand for attaching the right context in prompts.

