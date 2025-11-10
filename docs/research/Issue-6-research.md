# Block/Report Safety Controls - Research

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Issue**: #6 - Block/Report (Safety Controls)  
**Status**: ✅ Complete

## Research Question

What are best practices for implementing block/report functionality in proximity-based social apps, including UX patterns, storage approaches, moderation thresholds, and Signal Engine integration?

## Sources Consulted

### Internal Vision & Architecture

**Safety & Moderation Vision** (`Docs/Vision/IceBreaker — Safety & Moderation Vision.txt`):
- Block: Prevents future visibility/matches; immediate and silent
- Report: Simple categories (Harassment, Spam, Impersonation, Other)
- Surface points: Chat header (⋯ menu), end-of-chat screen, user card tap-hold
- Safety exclusion: Multiple unique reports → temporary hidden from Radar
- Signal Engine: Include `reports_unique` as negative weights with strict caps
- Store only: report category, timestamp, anonymized session ID, reporter ID (hashed), accused user ID
- Do NOT store: chat content, precise coordinates, device fingerprints
- Reports are not public; targets are not notified who reported them

**Product Vision** (`docs/vision.md`):
- Block/Report: Two taps from Radar or Chat
- Report categories: Harassment, Spam, Impersonation, Other
- Safety exclusion: Recent Panic or multiple unique reports → temporary hidden from Radar
- Success criteria: Report rate < 1% of sessions
- Performance: Block < 500ms, Report < 1s

**Panic Button Implementation** (`backend/src/services/PanicManager.js`):
- Safety exclusion pattern: Sets `safetyFlag` and `panicExclusionExpiresAt` on session
- Default exclusion duration: 1 hour (configurable)
- Signal Engine excludes sessions with active exclusion from Radar results
- Auto-cleanup: Safety flag cleared when exclusion expires

## Key Findings

### Block/Report UX Patterns
1. **Accessibility**: Two taps max (matches vision requirement)
2. **Surface Points**: Chat header menu (⋯), PersonCard tap-hold/long-press
3. **Confirmation Flow**: Block requires confirmation (irreversible), Report requires category selection
4. **Feedback**: Clear success messages ("You won't see each other again" for block, "Thanks for speaking up" for report)
5. **Privacy**: Reports are anonymous; targets not notified who reported them

### Moderation Thresholds
1. **Safety Exclusion**: ≥3 unique reporters triggers temporary Radar exclusion (matches vision)
2. **Exclusion Duration**: Default 1 hour (configurable, matches Panic Button pattern)
3. **Report Storage**: In-memory for MVP (ephemeral, lost on restart)
4. **Unique Reporter Tracking**: Prevent duplicate reports from same reporter
5. **Report Categories**: Harassment, Spam, Impersonation, Other (matches vision)

### Signal Engine Integration
1. **Negative Weights**: Apply penalty for reported users (`w_report * reportCount`)
2. **Safety Exclusion**: Still excludes entirely (≥3 unique reports) via `safetyFlag`
3. **Soft Sort-Down**: Reported users appear lower in Radar results (before exclusion threshold)
4. **Strict Caps**: Negative weights should have caps to prevent abuse

## Recommendations

### Default Choices
1. **Report Storage**: In-memory Map for MVP (ephemeral, matches vision)
2. **Safety Exclusion Threshold**: ≥3 unique reporters (matches vision)
3. **Exclusion Duration**: 1 hour default (matches Panic Button pattern)
4. **Signal Engine Penalty**: `w_report: -2` per report, capped at 5 reports (`-10` max penalty)
5. **UI Pattern**: Chat header menu (⋯) + PersonCard tap-hold (500ms) or right-click

### Rollback Options
- If tap-hold UX issues: Use visible button in PersonCard
- If report storage complexity: Use simple `reportCount` increment only (no unique tracking)
- If Signal Engine integration blocks: Defer to post-MVP, use safety exclusion only

## Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| In-memory report storage (MVP) | Simple, ephemeral, privacy-first | Lost on server restart |
| REST API (not WebSocket) | Simpler, stateless | No real-time feedback |
| ≥3 unique reporters threshold | Prevents false positives | May allow some abuse before exclusion |
| Report penalty weight (Signal Engine) | Soft sort-down before exclusion | May need tuning based on usage |
| Tap-hold for PersonCard | Discoverable, accessible | May be difficult for some users |

## Next Steps
1. ✅ Research complete
2. ⏳ Team review of plan (Vector coordinates) - IN PROGRESS
3. ⏭️ Implementation after team approval

