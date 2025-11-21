# Plan File Mapping Reference

**Date**: 2025-11-20
**Purpose**: Document plan-status file locations and structure

## Plan-Status Files by GitHub Issue Number

| GitHub Issue # | Plan-Status File | Status | Notes |
|----------------|------------------|--------|-------|
| #6 | `Docs/plans/Issue-6-plan-status.md` | To be created | Integration Testing & Launch Preparation |
| #8 | `Docs/plans/Issue-8-plan-status.md` | To be created | PLAYWRIGHT_WS_MOCK transport |
| #11 | `Docs/plans/Issue-11-plan-status.md` | To be created | Dual-context flows |
| #18 | `Docs/plans/Issue-18-plan-status.md` | To be created | Persona Testing |
| #21 | `Docs/plans/Issue-21-plan-status.md` | ✅ Exists | Production Deployment Infrastructure |
| #25 | `Docs/plans/Issue-25-plan-status.md` | To be created | Chat Request Cooldowns |

## Plan-Status File Structure

Each issue has ONE living document: `Docs/plans/Issue-<#>-plan-status.md`

This file contains:
- Research Summary (with link to `docs/research/Issue-<#>-research.md`)
- Goals & Success Metrics
- Plan Steps (numbered checkpoints with status)
- Current Status (overall + step completion)
- Current Issues (blockers/loops)
- Completion Summary (when done)

## Legacy Files

The following legacy plan files exist but should be migrated to plan-status format:
- `Issue-18-persona-testing.md` → Should become `Issue-18-plan-status.md`
- `Issue-21-production-deployment.md` → Consolidated into `Issue-21-plan-status.md`
- `Issue-25-chat-request-cooldowns.md` → Should become `Issue-25-plan-status.md`

See `Docs/migration/plan-status-migration.md` for migration steps.
