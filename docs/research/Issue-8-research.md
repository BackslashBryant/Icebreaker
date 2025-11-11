# Chat Request Cooldowns - Research

**Research Date**: 2025-11-10  
**Researcher**: Scout 🔎  
**Issue**: #8 - Chat Request Cooldowns  
**Status**: ✅ Complete

## Research Question

What are best practices for implementing session-level cooldowns after declined/failed chat invites, including threshold configuration, duration, Signal Engine integration, and user-facing feedback?

## Sources Consulted

### Internal Vision & Architecture

**Safety & Moderation Vision** (`Docs/Vision/IceBreaker — Safety & Moderation Vision.txt`):
- **Cooldowns**: "Short, session-level timers (e.g., 15–60 min) before reappearing broadly"
- **Rate limit chat starts**: "Soft cooldown after X failed/declined invites"
- **Consequence ladder**: 
  1. Soft sort-down (lower discoverability)
  2. Session cooldown (temporary hidden)
  3. Account pause (short lock)
  4. Removal (clear, appealable)
- **Signals**: "Rapid chat attempts without acceptance"
- **Microcopy**: "Visibility reduced for a bit due to recent reports." (link to guidelines)
- **Integration**: Signal Engine should include `declines_recent` as negative weights with strict caps
- **Privacy**: Store only minimal metadata; session-scoped only

**Product Vision** (`docs/vision.md`):
- **Supporting flows**: "Cooldowns: Short, session-level timers (15–60 min) after failed/declined invites"
- **Feature #13**: "Safety Moderation — Rate limiting, one-chat-at-a-time, cooldowns, safety exclusions"
- **Success criteria**: "Repeat-offender recidivism decreases after cooldowns"

**Signal Engine Vision** (`Docs/Vision/IceBreaker — Signal Engine Vision.txt`):
- **Negative weights**: Include `declines_recent` as negative signal with strict caps
- **Explainable**: Simple scoring formula that users can understand
- **Soft, not hard**: Avoid strict filters; prefer sort order

### Existing Codebase Patterns

**PanicManager** (`backend/src/services/PanicManager.js`):
- **Pattern**: Sets `safetyFlag: true` and `panicExclusionExpiresAt: timestamp`
- **Duration**: Default 1 hour (configurable)
- **Auto-cleanup**: Safety flag cleared when exclusion expires
- **Signal Engine integration**: Excludes sessions with active exclusion (`-Infinity` score)

**SafetyManager** (`backend/src/services/SafetyManager.js`):
- **Report threshold**: ≥3 unique reporters triggers safety exclusion
- **Exclusion duration**: 1 hour (3600000 ms)
- **Pattern**: Sets `safetyFlag` and `panicExclusionExpiresAt` on session

**SignalEngine** (`backend/src/services/SignalEngine.js`):
- **Report penalty**: `w_report * uniqueReporterCount` (negative weight)
- **Safety exclusion**: Returns `-Infinity` for sessions with active safety flag
- **Auto-cleanup**: Checks expiration and clears flag when expired
- **Pattern**: Checks `panicExclusionExpiresAt` timestamp for expiration

**RateLimiter** (`backend/src/lib/rate-limiter.js`):
- **Pattern**: In-memory Map storing timestamps per chat ID
- **Window**: 1 minute sliding window
- **Cleanup**: Periodic cleanup of old entries
- **Returns**: `{ allowed: boolean, remaining?: number, resetAt?: number }`

**ChatManager** (`backend/src/services/ChatManager.js`):
- **Current gap**: `declineChat()` doesn't track declines or enforce cooldowns
- **No tracking**: No decline count or timestamp storage
- **No enforcement**: No cooldown check in `requestChat()`

**SessionManager** (`backend/src/services/SessionManager.js`):
- **Session structure**: Includes `safetyFlag`, `panicExclusionExpiresAt`, `reportCount`
- **Missing fields**: No `declineCount`, `cooldownExpiresAt`, or `declinedInvites` array
- **TTL**: Sessions expire after 1 hour (ephemeral by design)

## Key Findings

### 1. Cooldown Threshold Configuration

**Recommendation**: 
- **Trigger threshold**: 3-5 declined invites within a time window (e.g., 10 minutes)
- **Rationale**: Prevents spam while allowing legitimate users who get a few declines
- **Configurable**: Store threshold in `backend/src/config/cooldown-config.js` (similar to `signal-weights.js`)

**Pattern from codebase**:
- Safety exclusion uses ≥3 unique reporters threshold
- Rate limiter uses 10 messages/minute threshold
- **Default**: 3 declined invites within 10 minutes triggers cooldown

### 2. Cooldown Duration

**Recommendation**:
- **Default duration**: 30 minutes (configurable 15-60 min range)
- **Rationale**: Long enough to discourage spam, short enough to not frustrate legitimate users
- **Pattern from codebase**: Panic exclusion uses 1 hour; cooldowns should be shorter (30 min default)

**Configurable options**:
- Short cooldown: 15 minutes (first offense)
- Medium cooldown: 30 minutes (default)
- Long cooldown: 60 minutes (repeat offenses)

### 3. Data Storage (Privacy-First)

**Recommendation**:
- **Store**: `declineCount` (number), `declinedInvites` (array of timestamps), `cooldownExpiresAt` (timestamp)
- **Time window**: Track declines within last 10 minutes (sliding window)
- **Cleanup**: Auto-cleanup old timestamps outside window
- **Privacy**: No storage of who declined (only count and timestamps)

**Session structure additions**:
```javascript
{
  declineCount: 0,
  declinedInvites: [], // Array of timestamps (last 10 minutes)
  cooldownExpiresAt: null, // Timestamp when cooldown expires
}
```

### 4. Signal Engine Integration

**Recommendation**:
- **Negative weight**: Add `w_decline` weight (e.g., -5 per decline in cooldown window)
- **Soft sort-down**: Reduce score during cooldown (don't exclude entirely)
- **Strict cap**: Max penalty of -15 (3 declines × -5) to prevent excessive punishment
- **Integration point**: Add to `calculateScore()` in SignalEngine.js

**Formula addition**:
```javascript
// 7. Decline penalty (during cooldown window)
if (targetSession.cooldownExpiresAt && targetSession.cooldownExpiresAt > now) {
  const declineCount = getDeclineCountInWindow(targetSession, 10 * 60 * 1000); // 10 min window
  score += weights.w_decline * Math.min(declineCount, 3); // Cap at 3 declines
}
```

### 5. Enforcement Pattern

**Recommendation**:
- **Check in `requestChat()`**: Before sending request, check if requester is in cooldown
- **Return error**: `{ success: false, error: "Cooldown active", cooldownExpiresAt: timestamp }`
- **Track in `declineChat()`**: Increment decline count and add timestamp when request is declined
- **Auto-trigger**: Check threshold after each decline; set cooldown if threshold met

**Pattern from codebase**:
- PanicManager checks `panicExclusionExpiresAt` before allowing actions
- RateLimiter checks window before allowing messages
- **Similar pattern**: Check `cooldownExpiresAt` before allowing chat requests

### 6. User-Facing Feedback

**Recommendation**:
- **Cooldown notice**: Show when user tries to request chat during cooldown
- **Microcopy**: "You've sent a few requests that were declined. Taking a short break — try again in [X] minutes."
- **UI location**: Toast notification or inline message in Radar/Chat UI
- **Countdown**: Show remaining time until cooldown expires

**Pattern from vision**:
- "Visibility reduced for a bit due to recent reports." (calm, non-dramatic)
- Link to guidelines (optional, post-MVP)

### 7. Auto-Cleanup & Expiration

**Recommendation**:
- **Expiration check**: Similar to PanicManager pattern — check `cooldownExpiresAt` on each request
- **Auto-clear**: Clear cooldown state when expired
- **Cleanup timestamps**: Remove timestamps older than 10 minutes from `declinedInvites` array
- **Periodic cleanup**: Run cleanup check periodically (similar to RateLimiter pattern)

## Recommendations

### Default Configuration

**Cooldown Config** (`backend/src/config/cooldown-config.js`):
```javascript
export const COOLDOWN_CONFIG = {
  // Threshold: number of declined invites within window to trigger cooldown
  DECLINE_THRESHOLD: 3,
  
  // Window: time window for tracking declines (10 minutes)
  DECLINE_WINDOW_MS: 10 * 60 * 1000,
  
  // Duration: cooldown duration in milliseconds (30 minutes default)
  COOLDOWN_DURATION_MS: 30 * 60 * 1000,
  
  // Signal Engine weight: penalty per decline during cooldown
  W_DECLINE: -5,
  
  // Max penalty cap: prevent excessive punishment
  MAX_DECLINE_PENALTY: -15,
};
```

### Implementation Approach

1. **Backend (Forge)**:
   - Add cooldown fields to SessionManager session structure
   - Create `CooldownManager.js` service (similar to PanicManager pattern)
   - Update `ChatManager.declineChat()` to track declines
   - Update `ChatManager.requestChat()` to check cooldown
   - Add decline penalty to SignalEngine scoring
   - Add cooldown config file

2. **Frontend (Link)**:
   - Show cooldown notice when user tries to request chat during cooldown
   - Display countdown timer for remaining cooldown time
   - Toast notification with calm microcopy

3. **Testing (Pixel)**:
   - Unit tests: CooldownManager, ChatManager cooldown checks
   - Integration tests: Cooldown triggers after threshold, expires correctly
   - E2E tests: User sees cooldown notice, can't request during cooldown

### Rollback Options

1. **If cooldowns too aggressive**: Reduce threshold (3 → 5) or increase window (10 min → 15 min)
2. **If cooldowns too lenient**: Reduce threshold (3 → 2) or reduce window (10 min → 5 min)
3. **If Signal Engine integration blocks**: Defer Signal Engine penalty to post-MVP, keep basic cooldown enforcement
4. **If storage concerns**: Use simpler tracking (just `declineCount` and `cooldownExpiresAt`, no timestamp array)

## Next Steps

1. ✅ **Research complete** — Ready for Vector to create implementation plan
2. ⏭️ **Vector 🎯**: Create plan with checkpoints for backend, frontend, Signal Engine integration
3. ⏭️ **Team Review**: Review plan before implementation
4. ⏭️ **Forge 🔗**: Implement CooldownManager and ChatManager updates
5. ⏭️ **Link 🌐**: Implement frontend cooldown feedback
6. ⏭️ **Pixel 🖥️**: Test cooldown behavior and Signal Engine integration

## References

- `Docs/Vision/IceBreaker — Safety & Moderation Vision.txt` (lines 40, 44, 62, 83, 90)
- `docs/vision.md` (Feature #13, Supporting flows)
- `backend/src/services/PanicManager.js` (exclusion pattern)
- `backend/src/services/SafetyManager.js` (threshold pattern)
- `backend/src/services/SignalEngine.js` (penalty pattern)
- `backend/src/lib/rate-limiter.js` (window tracking pattern)
- `backend/src/services/ChatManager.js` (current implementation gap)

