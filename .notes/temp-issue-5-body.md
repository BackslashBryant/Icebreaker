## Problem Statement
Users need an always-accessible emergency exit button that immediately ends their session, alerts emergency contacts, and temporarily hides them from Radar when they feel unsafe.

## Target User
Adults (18+) using Radar or Chat who need a quick, calm way to exit and alert contacts if they feel unsafe.

## Desired Outcome
A fixed floating action button (FAB) accessible from Radar and Chat screens that:
- Immediately ends the current session
- Optionally alerts emergency contact(s) with approximate location and time
- Temporarily hides user from Radar (safety exclusion)
- Provides calm, non-dramatic confirmation flow
- Matches Icebreaker brand aesthetic (terminal meets Game Boy)

## MVP DoD Checklist
- [ ] Panic FAB component: Fixed position, bottom-right, always visible on Radar/Chat
- [ ] Panic confirmation flow: "Everything okay?" → Confirm → Success state
- [ ] Backend panic handler: End session, set safety flag, trigger safety exclusion
- [ ] Emergency contact alert: Optional SMS/email notification with approximate location
- [ ] Safety exclusion: Hide user from Radar for configurable duration (e.g., 1 hour)
- [ ] Session termination: End active chat if in progress, clear session data
- [ ] WebSocket notification: Notify active chat partner that session ended
- [ ] UI states: Initial → Confirmation → Success (with contact notification details)
- [ ] Accessibility: Keyboard navigation, screen reader support, WCAG AA compliance
- [ ] Unit tests: Panic handler, safety exclusion logic (≥80% coverage)
- [ ] E2E test: Panic flow from Radar and Chat screens

## References
- Vision: `docs/vision.md` (section 2, step 7; section 3, feature #10)
- Safety Vision: `Docs/Vision/IceBreaker — Safety & Moderation Vision.txt`
- UI Mock: `Docs/Vision/ui_ux_mocks/components/panic-button.tsx`
- Demo Mock: `Docs/Vision/ui_ux_mocks/app/panic-demo/page.tsx`

## Dependencies
- **Blocks on**: Issue #2 (Radar View), Issue #4 (Chat) - Panic accessible from both screens
- **Enables**: Safety moderation features (safety exclusion, Signal Engine integration)

## Acceptance Criteria
1. Panic FAB visible on Radar and Chat screens (fixed bottom-right)
2. User taps Panic → Confirmation screen appears ("Everything okay?")
3. User confirms → Session ends, safety flag set, emergency contact notified (if configured)
4. User temporarily hidden from Radar (safety exclusion for 1 hour)
5. Active chat ends gracefully with notification to partner
6. Success screen shows: "You're safe. Session ended." + notification details
7. Keyboard navigation works (Enter to confirm, Escape to cancel)
8. Screen reader announces panic actions clearly

## Technical Notes
- Backend: Panic handler endpoint or WebSocket message (`panic:trigger`)
- Safety exclusion: Configurable duration (default 1 hour), stored in session
- Emergency contacts: Optional, stored in session (post-MVP: Settings page)
- Location sharing: Approximate only (same precision as Radar)
- Privacy: No message content stored, minimal metadata

