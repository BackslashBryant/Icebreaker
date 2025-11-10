# Profile/Settings Page - Research

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Issue**: #7 - Profile/Settings Page  
**Status**: ✅ Complete

## Research Question

What are best practices for implementing a Profile/Settings page with visibility controls, emergency contact management, and accessibility toggles (reduced-motion, high-contrast, keyboard navigation) in a privacy-first, ephemeral proximity-based social app?

## Sources Consulted

### Internal Vision & Architecture

**Product Vision** (`docs/vision.md`):
- Feature #12: Profile/Settings — Visibility controls, emergency contacts, a11y toggles
- Feature #14: Accessibility Modes — Reduced-motion, high-contrast, keyboard navigation, screen reader support
- Success Criteria: WCAG AA compliance; reduced-motion and high-contrast modes work consistently; keyboard-first navigation
- Privacy-first: Approximate location only; session-scoped data; ephemeral by design

**Brand & UI Ethos** (`Docs/Vision/IceBreaker — Brand & UI Ethos.txt`):
- Profile: "Agency over what's visible; emergency contacts."
- Settings: "Your space, your rules."
- Accessibility: Reduced-motion (disable sweeps, blinks, pulses), high-contrast (brighten teal, maintain WCAG contrast), keyboard/screen reader (clear focus states, ARIA labels)
- Tone: Confident, succinct, slightly playful; never clingy or hypey

**Safety & Moderation Vision** (`Docs/Vision/IceBreaker — Safety & Moderation Vision.txt`):
- Panic FAB: Ends session immediately; optional alert to contacts
- Privacy-first: No message content storage; minimal metadata
- Ephemeral by design: Sessions expire; visibility is reversible

**UI Mock** (`Docs/Vision/ui_ux_mocks/app/profile/page.tsx`):
- Profile page mock includes:
  - Handle display (auto-generated from vibe & tags)
  - Visibility toggle ("Show me on Radar")
  - Current vibe display with "Change vibe" button
  - Tags display with "Add tag" button
  - Emergency contact input field
  - Settings link button
- Brand styling: RetroHeader, ASCII dividers, teal accent, monospace fonts

### Current Implementation Status

**Onboarding** (`frontend/src/pages/Onboarding.tsx`, `frontend/src/components/onboarding/TagsStep.tsx`):
- Visibility toggle exists in onboarding (step 3)
- Visibility stored in session: `visibility: boolean`
- Backend accepts visibility in `POST /api/onboarding`

**Session Management** (`backend/src/services/SessionManager.js`):
- Session structure includes: `visibility`, `vibe`, `tags`, `handle`
- **Missing**: `emergencyContact` field (not stored in session)
- Session TTL: 1 hour (ephemeral by design)

**Panic Button** (`backend/src/services/PanicManager.js`, `frontend/src/hooks/usePanic.ts`):
- Panic triggers safety exclusion (1 hour default)
- Panic ends active chat
- **Missing**: Emergency contact notification (not implemented)
- PanicDialog references emergency contacts but no storage/notification logic

**Accessibility** (`frontend/src/index.css`):
- `@media (prefers-reduced-motion: reduce)` implemented for animations
- Animations disabled: `.animate-sweep`, `.animate-pulse-slow`, `.animate-radar-ping`
- **Missing**: User-controlled reduced-motion toggle (only system preference)
- **Missing**: High-contrast mode implementation
- **Missing**: Keyboard navigation preferences storage

**Web Standards** (Web Search Results):
- `prefers-reduced-motion`: CSS media query detects system preference
- `prefers-contrast`: CSS media query for high-contrast mode (limited browser support)
- WCAG AA: Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: All interactive elements accessible via keyboard, clear focus indicators

## Key Findings

### Visibility Controls
1. **Current State**: Visibility toggle exists in onboarding only
2. **Gap**: No way to change visibility after onboarding
3. **Requirement**: Profile/Settings page should allow toggling visibility
4. **Backend**: SessionManager has `updateSessionVisibility()` function (needs verification)
5. **API**: Need `PUT /api/profile/visibility` endpoint (or similar)

### Emergency Contacts
1. **Current State**: PanicDialog references emergency contacts but no storage/notification
2. **Gap**: No emergency contact storage in SessionManager
3. **Requirement**: Profile/Settings page should allow adding/editing emergency contact
4. **Backend**: Need to add `emergencyContact` field to session structure
5. **API**: Need `PUT /api/profile/emergency-contact` endpoint
6. **Notification**: Post-MVP (SMS/email service integration)

### Accessibility Toggles
1. **Reduced Motion**:
   - **Current**: System preference (`prefers-reduced-motion`) respected via CSS
   - **Gap**: No user-controlled toggle (user preference override)
   - **Requirement**: Toggle in Profile/Settings to override system preference
   - **Storage**: LocalStorage (user preference, not session-scoped)
   - **Implementation**: CSS class toggle + localStorage persistence

2. **High Contrast**:
   - **Current**: Not implemented
   - **Gap**: No high-contrast mode available
   - **Requirement**: Toggle in Profile/Settings to enable high-contrast theme
   - **Storage**: LocalStorage (user preference)
   - **Implementation**: CSS class toggle + theme variables adjustment (brighten teal, increase contrast)

3. **Keyboard Navigation**:
   - **Current**: Keyboard navigation works (WCAG AA compliant)
   - **Gap**: No user preferences for keyboard shortcuts or navigation behavior
   - **Requirement**: Post-MVP (custom keyboard shortcuts)
   - **Note**: Basic keyboard navigation already works; no MVP requirement for preferences

## Recommendations

### Default Choices

1. **Visibility Controls**:
   - **API Endpoint**: `PUT /api/profile/visibility` (requires session token)
   - **Request**: `{ visibility: boolean }`
   - **Response**: `{ success: boolean, visibility: boolean }`
   - **Backend**: Update `SessionManager.updateSessionVisibility()` or create new function
   - **Frontend**: Toggle in Profile page, sync with backend immediately

2. **Emergency Contacts**:
   - **Storage**: Add `emergencyContact?: string` to session structure (optional field)
   - **API Endpoint**: `PUT /api/profile/emergency-contact` (requires session token)
   - **Request**: `{ emergencyContact: string }` (phone number or email)
   - **Response**: `{ success: boolean, emergencyContact: string }`
   - **Validation**: Basic format validation (phone: E.164 format, email: RFC 5322)
   - **Frontend**: Input field in Profile page with validation
   - **Notification**: Post-MVP (SMS/email service integration for Panic alerts)

3. **Accessibility Toggles**:
   - **Reduced Motion**:
     - **Storage**: LocalStorage key `icebreaker:reduced-motion` (boolean)
     - **Implementation**: CSS class `.reduced-motion` on `<html>` or `<body>`
     - **CSS**: Override animations when class present: `.reduced-motion .animate-* { animation: none; }`
     - **Toggle**: Checkbox in Profile/Settings page
     - **Default**: Respect system preference (`prefers-reduced-motion`), allow override
   
   - **High Contrast**:
     - **Storage**: LocalStorage key `icebreaker:high-contrast` (boolean)
     - **Implementation**: CSS class `.high-contrast` on `<html>` or `<body>`
     - **CSS**: Adjust theme variables (brighten teal, increase contrast ratios)
     - **Toggle**: Checkbox in Profile/Settings page
     - **Default**: Off (opt-in)
     - **WCAG**: Ensure contrast ratios meet WCAG AA (4.5:1 normal, 3:1 large)

### Rollback Options

- **If emergency contact complexity blocks**: Defer to post-MVP, use placeholder UI only
- **If accessibility toggles complexity blocks**: Use system preferences only (`prefers-reduced-motion`, `prefers-contrast`)
- **If visibility API complexity blocks**: Use WebSocket message to update visibility (less RESTful but functional)

## Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| LocalStorage for accessibility preferences | Simple, persists across sessions, no backend needed | Not synced across devices |
| Session-scoped emergency contacts | Ephemeral, privacy-first | Lost on session expiry (1 hour) |
| Optional emergency contact | Privacy-first, opt-in | May reduce Panic Button effectiveness |
| User-controlled reduced-motion override | More control, better UX | Adds complexity, may conflict with system preference |
| High-contrast toggle (opt-in) | Improves accessibility, WCAG AA compliance | Requires theme variable adjustments, testing |

## Next Steps

1. ✅ Research complete
2. ⏳ Vector creates plan (after research review)
3. ⏭️ Team review of plan
4. ⏭️ Implementation after team approval

## Implementation Notes

### Backend Changes Needed
- Add `emergencyContact?: string` to session structure (`SessionManager.js`)
- Create `PUT /api/profile/visibility` endpoint
- Create `PUT /api/profile/emergency-contact` endpoint
- Add validation for emergency contact format (phone/email)

### Frontend Changes Needed
- Create Profile/Settings page (`frontend/src/pages/Profile.tsx`)
- Add visibility toggle component
- Add emergency contact input field
- Add accessibility toggles (reduced-motion, high-contrast)
- Add LocalStorage hooks for accessibility preferences
- Add CSS classes for `.reduced-motion` and `.high-contrast`
- Update theme variables for high-contrast mode

### Testing Requirements
- Unit tests: Profile API endpoints (visibility, emergency contact)
- Unit tests: Profile page components (toggles, inputs)
- E2E tests: Profile page navigation, visibility toggle, emergency contact save
- Accessibility tests: WCAG AA compliance (high-contrast mode, keyboard navigation)

## References

- Vision: `docs/vision.md` (Feature #12, Feature #14)
- Brand & UI Ethos: `Docs/Vision/IceBreaker — Brand & UI Ethos.txt`
- UI Mock: `Docs/Vision/ui_ux_mocks/app/profile/page.tsx`
- Current Implementation: `frontend/src/pages/Onboarding.tsx`, `backend/src/services/SessionManager.js`
- Web Standards: WCAG AA Guidelines, `prefers-reduced-motion`, `prefers-contrast` media queries

