# Connection Guide

Track every port, endpoint, credential reference, and integration touchpoint here. Update it whenever a new service appears or an existing one changes.

## 1. Local Services
- Name:
- Purpose:
- Port:
- Startup command:
- Notes (rate limits, auth, dependencies):

## 2. Remote APIs & Integrations
- Service:
- Base URL / Endpoint:
- Auth method:
- Environment variables required:
- Owner (agent/human):
- Notes (timeouts, payload format, rate limits):

## 3. Datastores
- Type (Postgres, Redis, etc.):
- Connection string / host:
- Migration owner:
- Backup/rollback procedure:

## 4. Messaging / Events
- Broker / channel:
- Schemas / payload contracts:
- Replay or dead-letter process:

## 5. Shared Resources & Ports
- Resource:
- Current assignment:
- Conflicts / history:

## Maintenance Rules
- Nexus keeps this file in sync with CI/deployment changes.
- Implementers update it before handing off new services or ports.
- Muse references the relevant section in README updates and changelog entries.
- If a collision occurs (e.g., duplicate port usage), log it in `.notes/features/<slug>/progress.md` and fix it before continuing.
