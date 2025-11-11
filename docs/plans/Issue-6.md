# Issue #6: Chat Request Cooldowns

**Status**: ✅ **COMPLETE**  
**Original Issue**: #8  
**Branch**: `origin/feat/8-chat-request-cooldowns`

## Goals

- **GitHub Issue**: #6 (originally #8)
- **Target**: Rate limiting and cooldown system for chat requests
- **Problem**: Users need protection from spam and harassment through cooldown periods
- **Desired Outcome**: 
  - Cooldown periods (15-60 min) after chat requests
  - Frontend cooldown feedback UI
  - Signal Engine decline penalty integration
  - ChatManager cooldown integration
  - CooldownManager service

## Research

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Status**: ✅ Complete

### Research Question

What are best practices for implementing session-level cooldowns after declined/failed chat invites, including threshold configuration, duration, Signal Engine integration, and user-facing feedback?

### Sources & Findings

**Internal Vision & Architecture**:
- Cooldowns: "Short, session-level timers (e.g., 15–60 min) before reappearing broadly"
- Rate limit chat starts: "Soft cooldown after X failed/declined invites"
- Consequence ladder: Soft sort-down → Session cooldown → Account pause → Removal
- Signals: "Rapid chat attempts without acceptance"
- Integration: Signal Engine should include `declines_recent` as negative weights with strict caps

**Existing Codebase Patterns**:
- PanicManager: Sets `safetyFlag: true` and `panicExclusionExpiresAt: timestamp`, default 1 hour
- SafetyManager: Report threshold ≥3 unique reporters triggers safety exclusion
- SignalEngine: Report penalty `w_report * uniqueReporterCount` (negative weight)
- RateLimiter: In-memory Map storing timestamps per chat ID, 1 minute sliding window
- ChatManager: Current gap - `declineChat()` doesn't track declines or enforce cooldowns

### Key Findings

**Cooldown Threshold Configuration**:
- Trigger threshold: 3-5 declined invites within 10 minutes
- Configurable: Store threshold in `backend/src/config/cooldown-config.js`

**Cooldown Duration**:
- Default duration: 30 minutes (configurable 15-60 min range)
- Short cooldown: 15 minutes (first offense)
- Medium cooldown: 30 minutes (default)
- Long cooldown: 60 minutes (repeat offenses)

**Data Storage (Privacy-First)**:
- Store: `declineCount` (number), `declinedInvites` (array of timestamps), `cooldownExpiresAt` (timestamp)
- Time window: Track declines within last 10 minutes (sliding window)
- Privacy: No storage of who declined (only count and timestamps)

**Signal Engine Integration**:
- Negative weight: Add `w_decline` weight (e.g., -5 per decline in cooldown window)
- Soft sort-down: Reduce score during cooldown (don't exclude entirely)
- Strict cap: Max penalty of -15 (3 declines × -5) to prevent excessive punishment

**Enforcement Pattern**:
- Check in `requestChat()`: Before sending request, check if requester is in cooldown
- Track in `declineChat()`: Increment decline count and add timestamp when request is declined
- Auto-trigger: Check threshold after each decline; set cooldown if threshold met

**User-Facing Feedback**:
- Cooldown notice: Show when user tries to request chat during cooldown
- Microcopy: "You've sent a few requests that were declined. Taking a short break — try again in [X] minutes."
- UI location: Toast notification or inline message in Radar/Chat UI
- Countdown: Show remaining time until cooldown expires

### Recommendations

**Default Configuration**:
- DECLINE_THRESHOLD: 3
- DECLINE_WINDOW_MS: 10 * 60 * 1000 (10 minutes)
- COOLDOWN_DURATION_MS: 30 * 60 * 1000 (30 minutes)
- W_DECLINE: -5
- MAX_DECLINE_PENALTY: -15

**Implementation Approach**:
1. Backend: Add cooldown fields to SessionManager, create CooldownManager service, update ChatManager
2. Frontend: Show cooldown notice with countdown timer, toast notification
3. Testing: Unit tests, integration tests, E2E tests

**Rollback Options**:
- If cooldowns too aggressive: Reduce threshold or increase window
- If cooldowns too lenient: Reduce threshold or reduce window
- If Signal Engine integration blocks: Defer Signal Engine penalty to post-MVP

## Team Review

**Review Date**: 2025-11-11  
**Status**: ✅ **APPROVED**

### Review Summary

Plan reviewed and approved for implementation. All 6 checkpoints are clear, actionable, and aligned with research findings.

### Team Approval

- ✅ **Vector 🎯**: Plan created with 6 checkpoints covering backend cooldown tracking, enforcement, Signal Engine integration, and frontend feedback
- ✅ **Scout 🔎**: Research complete. Key findings: 3 declines in 10 min threshold, 30 min cooldown duration, PanicManager pattern for expiration
- ✅ **Forge 🔗**: Backend approach clear - CooldownManager service, ChatManager integration, Signal Engine penalty. Follows existing patterns
- ✅ **Link 🌐**: Frontend approach clear - Cooldown feedback UI with countdown timer, toast notifications
- ✅ **Pixel 🖥️**: Testing plan comprehensive - unit tests, integration tests, E2E tests
- ✅ **Muse 🎨**: Documentation plan clear - ConnectionGuide updates, README updates, CHANGELOG entry
- ✅ **Sentinel 🛡️**: Security considerations reviewed - Session-scoped (ephemeral), privacy-first, no security concerns
- ✅ **Nexus 🚀**: CI/CD considerations - No new ports or services required, no infrastructure changes needed

## Decisions

1. **Cooldown Threshold**: 3 declined invites within 10 minutes triggers cooldown
2. **Cooldown Duration**: 30 minutes default (configurable 15-60 min range)
3. **Signal Engine Integration**: Soft sort-down with -5 penalty per decline, max -15 penalty
4. **Privacy**: No storage of who declined (only count and timestamps)
5. **User Feedback**: Toast notification with countdown timer

## Progress

**Current Status**: ✅ **COMPLETE**

### Step Completion

- ✅ Backend cooldown tracking implemented
- ✅ Cooldown enforcement implemented
- ✅ Signal Engine integration implemented
- ✅ Frontend cooldown feedback implemented
- ✅ Testing complete
- ✅ Documentation complete

## Status

✅ **COMPLETE** - Chat Request Cooldowns implemented and tested

---

**Status**: ✅ **COMPLETE**  
**Original Issue**: #8  
**Branch**: `origin/feat/8-chat-request-cooldowns`

## Goals

- **GitHub Issue**: #6 (originally #8)
- **Target**: Rate limiting and cooldown system for chat requests
- **Problem**: Users need protection from spam and harassment through cooldown periods
- **Desired Outcome**: 
  - Cooldown periods (15-60 min) after chat requests
  - Frontend cooldown feedback UI
  - Signal Engine decline penalty integration
  - ChatManager cooldown integration
  - CooldownManager service

## Research

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Status**: ✅ Complete

### Research Question

What are best practices for implementing session-level cooldowns after declined/failed chat invites, including threshold configuration, duration, Signal Engine integration, and user-facing feedback?

### Sources & Findings

**Internal Vision & Architecture**:
- Cooldowns: "Short, session-level timers (e.g., 15–60 min) before reappearing broadly"
- Rate limit chat starts: "Soft cooldown after X failed/declined invites"
- Consequence ladder: Soft sort-down → Session cooldown → Account pause → Removal
- Signals: "Rapid chat attempts without acceptance"
- Integration: Signal Engine should include `declines_recent` as negative weights with strict caps

**Existing Codebase Patterns**:
- PanicManager: Sets `safetyFlag: true` and `panicExclusionExpiresAt: timestamp`, default 1 hour
- SafetyManager: Report threshold ≥3 unique reporters triggers safety exclusion
- SignalEngine: Report penalty `w_report * uniqueReporterCount` (negative weight)
- RateLimiter: In-memory Map storing timestamps per chat ID, 1 minute sliding window
- ChatManager: Current gap - `declineChat()` doesn't track declines or enforce cooldowns

### Key Findings

**Cooldown Threshold Configuration**:
- Trigger threshold: 3-5 declined invites within 10 minutes
- Configurable: Store threshold in `backend/src/config/cooldown-config.js`

**Cooldown Duration**:
- Default duration: 30 minutes (configurable 15-60 min range)
- Short cooldown: 15 minutes (first offense)
- Medium cooldown: 30 minutes (default)
- Long cooldown: 60 minutes (repeat offenses)

**Data Storage (Privacy-First)**:
- Store: `declineCount` (number), `declinedInvites` (array of timestamps), `cooldownExpiresAt` (timestamp)
- Time window: Track declines within last 10 minutes (sliding window)
- Privacy: No storage of who declined (only count and timestamps)

**Signal Engine Integration**:
- Negative weight: Add `w_decline` weight (e.g., -5 per decline in cooldown window)
- Soft sort-down: Reduce score during cooldown (don't exclude entirely)
- Strict cap: Max penalty of -15 (3 declines × -5) to prevent excessive punishment

**Enforcement Pattern**:
- Check in `requestChat()`: Before sending request, check if requester is in cooldown
- Track in `declineChat()`: Increment decline count and add timestamp when request is declined
- Auto-trigger: Check threshold after each decline; set cooldown if threshold met

**User-Facing Feedback**:
- Cooldown notice: Show when user tries to request chat during cooldown
- Microcopy: "You've sent a few requests that were declined. Taking a short break — try again in [X] minutes."
- UI location: Toast notification or inline message in Radar/Chat UI
- Countdown: Show remaining time until cooldown expires

### Recommendations

**Default Configuration**:
- DECLINE_THRESHOLD: 3
- DECLINE_WINDOW_MS: 10 * 60 * 1000 (10 minutes)
- COOLDOWN_DURATION_MS: 30 * 60 * 1000 (30 minutes)
- W_DECLINE: -5
- MAX_DECLINE_PENALTY: -15

**Implementation Approach**:
1. Backend: Add cooldown fields to SessionManager, create CooldownManager service, update ChatManager
2. Frontend: Show cooldown notice with countdown timer, toast notification
3. Testing: Unit tests, integration tests, E2E tests

**Rollback Options**:
- If cooldowns too aggressive: Reduce threshold or increase window
- If cooldowns too lenient: Reduce threshold or reduce window
- If Signal Engine integration blocks: Defer Signal Engine penalty to post-MVP

## Team Review

**Review Date**: 2025-11-11  
**Status**: ✅ **APPROVED**

### Review Summary

Plan reviewed and approved for implementation. All 6 checkpoints are clear, actionable, and aligned with research findings.

### Team Approval

- ✅ **Vector 🎯**: Plan created with 6 checkpoints covering backend cooldown tracking, enforcement, Signal Engine integration, and frontend feedback
- ✅ **Scout 🔎**: Research complete. Key findings: 3 declines in 10 min threshold, 30 min cooldown duration, PanicManager pattern for expiration
- ✅ **Forge 🔗**: Backend approach clear - CooldownManager service, ChatManager integration, Signal Engine penalty. Follows existing patterns
- ✅ **Link 🌐**: Frontend approach clear - Cooldown feedback UI with countdown timer, toast notifications
- ✅ **Pixel 🖥️**: Testing plan comprehensive - unit tests, integration tests, E2E tests
- ✅ **Muse 🎨**: Documentation plan clear - ConnectionGuide updates, README updates, CHANGELOG entry
- ✅ **Sentinel 🛡️**: Security considerations reviewed - Session-scoped (ephemeral), privacy-first, no security concerns
- ✅ **Nexus 🚀**: CI/CD considerations - No new ports or services required, no infrastructure changes needed

## Decisions

1. **Cooldown Threshold**: 3 declined invites within 10 minutes triggers cooldown
2. **Cooldown Duration**: 30 minutes default (configurable 15-60 min range)
3. **Signal Engine Integration**: Soft sort-down with -5 penalty per decline, max -15 penalty
4. **Privacy**: No storage of who declined (only count and timestamps)
5. **User Feedback**: Toast notification with countdown timer

## Progress

**Current Status**: ✅ **COMPLETE**

### Step Completion

- ✅ Backend cooldown tracking implemented
- ✅ Cooldown enforcement implemented
- ✅ Signal Engine integration implemented
- ✅ Frontend cooldown feedback implemented
- ✅ Testing complete
- ✅ Documentation complete

## Status

✅ **COMPLETE** - Chat Request Cooldowns implemented and tested

---
