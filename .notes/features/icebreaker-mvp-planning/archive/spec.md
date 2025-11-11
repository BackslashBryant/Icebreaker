# Feature Spec: Icebreaker MVP Planning

- Slug: `icebreaker-mvp-planning`
- Created: 2025-11-04T00:00:00.000Z
- Owner: Vector 🎯

## Problem Statement
Icebreaker vision documents are consolidated, but we need to plan the MVP architecture, tech stack, and first feature implementation.

## Target User
Adults (18+) in shared spaces who want lightweight, ephemeral proximity-based connections.

## Desired Outcome
- Complete vision consolidation (✓ Done)
- Architecture decisions documented
- Tech stack selected
- First feature issue created and planned
- Development environment ready

## Proposed Approach
1. Review vision and consolidate into `docs/vision.md` (✓ Complete)
2. Initialize connection guide and feature context (✓ Complete)
3. Research and decide on tech stack (frontend, backend, real-time, storage)
4. Create first GitHub issue for MVP onboarding flow
5. Plan first feature implementation with Vector

## MVP DoD
- [x] Vision documents consolidated into `docs/vision.md`
- [x] `.notes/features/current.json` initialized
- [x] `docs/ConnectionGuide.md` updated with Icebreaker placeholders
- [x] Tech stack decisions documented (see `docs/research.md` - React+Vite, shadcn/ui, Node.js+Express, WebSocket, in-memory storage)
- [x] First GitHub issue created for MVP feature (Issue #1: MVP Onboarding Flow)
- [x] Architecture documented in `docs/architecture/ARCHITECTURE_TEMPLATE.md` (all 10 sections completed)

## Success Metrics
- All vision documents accessible and structured
- Agents can reference single source of truth (`docs/vision.md`)
- Connection guide ready for port/endpoint tracking
- Preflight checks passing

## Not Now (Out of scope)
- Actual implementation (will be separate feature)
- Post-MVP features (OAuth, personality archetypes, etc.)
- Deployment and infrastructure (will be separate feature)

## Research Needed
- Tech stack selection: frontend framework, backend runtime, real-time solution, storage
- Location API best practices for privacy
- WebSocket vs Server-Sent Events for ephemeral chat
- Session storage options (Redis, in-memory, database)

## References
- `docs/vision.md` - Consolidated product vision
- `docs/ConnectionGuide.md` - Service tracking
- `Docs/Vision/` - Source vision documents
