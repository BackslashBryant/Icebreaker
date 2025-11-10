## Problem Statement
Users need a way to have brief, ephemeral 1:1 conversations after discovering someone on Radar, with messages that disappear when proximity breaks or the chat ends.

## Target User
Adults (18+) who found someone on Radar and want to initiate a brief, real exchange.

## Desired Outcome
A terminal-style chat interface that enables ephemeral 1:1 messaging. Messages are relayed via WebSocket only (no storage), chats end when proximity breaks (>100m) or user exits, and the interface matches the Icebreaker brand aesthetic.

## MVP DoD Checklist
- [x] Terminal-style chat interface (black background, teal monospace text, `[HH:MM]` timestamps)
- [x] One-tap chat initiation from Radar PersonCard
- [x] Chat request/accept/decline flow
- [x] Real-time message relay via WebSocket (`chat:message` message type)
- [x] Rate limiting: max 10 messages/minute per chat
- [x] Proximity monitoring: automatic termination when distance >100m
- [x] Proximity warning: shows "Signal weak — chat may end." when distance >80m
- [x] One-chat-at-a-time enforcement
- [x] Chat termination: user-initiated (`chat:end`) or proximity-based (`proximity_lost`)
- [x] ASCII dividers between message bursts (>5 minute gap)
- [x] Keyboard navigation: Enter to send, Escape to end chat
- [x] WCAG AA compliance (keyboard nav, screen reader, ARIA labels)
- [x] Unit tests (≥80% coverage)
- [x] E2E test: Radar → Chat → Message → End flow

## Dependencies
- **Blocks on**: Issue #2 (Radar View) - One-tap chat initiation ready
- **Enables**: Issue #4 (Panic Button) - Chat termination ready

## Implementation Complete ✅

**Branch**: `feat/3-chat`  
**Commit**: `bd9ff33` - "feat: Complete Issue #3 - Chat (Ephemeral 1:1 Messaging)"

**Test Results**:
- ✅ Backend: 117/117 tests passing (includes ChatManager, RateLimiter, WebSocket handlers)
- ✅ Frontend: 14/14 Chat component tests passing
- ✅ Code coverage: ≥80% for all new code

**Files Created/Modified**:
- Backend: `ChatManager.js`, `rate-limiter.js`, updated `handlers.js`, `SessionManager.js`
- Frontend: `Chat.tsx`, `ChatMessage.tsx`, `ChatInput.tsx`, `ChatHeader.tsx`, `useChat.ts`
- Tests: `chat-manager.test.js`, `rate-limiter.test.js`, `Chat.test.tsx`
- Docs: `CHANGELOG.md`, `ConnectionGuide.md` updated

**Status**: ✅ Complete - Ready for push

