# Edge Cases - Issue #16 Accessibility & Failure Coverage

**Last Updated**: 2025-11-20  
**Status**: ✅ **COMPLETE** - All edge cases documented for Issue #16 accessibility and failure coverage
**Purpose**: Document all tested edge cases with expected behavior and recovery procedures

## Overview

This document catalogs all edge cases tested in the accessibility and error recovery test suites for Issue #16, including keyboard navigation, screen reader support, WebSocket failures, and API error recovery. Each edge case includes expected behavior and recovery procedures.

## Keyboard Navigation Edge Cases

### Onboarding Flow

**Edge Case**: User navigates through onboarding using only keyboard (Tab, Enter, Space)

**Expected Behavior**:
- All steps navigable with keyboard only
- Focus order is logical (header → content → buttons)
- Focus visible on all interactive elements
- No keyboard traps

**Recovery Procedures**:
- If focus order is incorrect: Review tab order in component code, ensure logical flow
- If focus not visible: Check CSS for `focus-visible` styles, ensure outline/ring is visible
- If keyboard trap detected: Review modal/dialog focus management, ensure Escape closes dialogs

**Test Coverage**: `tests/e2e/accessibility/keyboard-onboarding.spec.ts`

### Radar Navigation

**Edge Case**: User navigates radar view using only keyboard (view toggle, person selection, chat initiation)

**Expected Behavior**:
- View toggle accessible via keyboard (Tab to button, Enter to switch)
- Person cards accessible via keyboard (Tab to card, Enter to select)
- Person card dialog navigable via keyboard (Tab through buttons, Enter to activate, Escape to close)
- Panic button accessible via keyboard (Tab to button, Enter to open dialog)

**Recovery Procedures**:
- If person cards not keyboard accessible: Ensure cards are buttons or have proper tabindex
- If dialog not keyboard accessible: Review Dialog component focus management
- If panic button not in tab order: Ensure button has proper tabindex or is in DOM order

**Test Coverage**: `tests/e2e/accessibility/keyboard-radar.spec.ts`

### Panic Button

**Edge Case**: User accesses panic button and dialog using only keyboard

**Expected Behavior**:
- Panic button accessible via keyboard (Tab to button, Enter to open)
- Dialog receives focus when opened
- Dialog buttons navigable via keyboard (Tab through buttons, Enter to activate)
- Escape key closes dialog

**Recovery Procedures**:
- If panic button not accessible: Ensure button is in tab order, check z-index doesn't block focus
- If dialog doesn't receive focus: Review Dialog component focus trap implementation
- If Escape doesn't close: Review keyboard event handlers in PanicDialog component

**Test Coverage**: `tests/e2e/accessibility/keyboard-panic.spec.ts`

## Screen Reader Edge Cases

### Visibility Toggle

**Edge Case**: Screen reader announces visibility toggle state (on/off)

**Expected Behavior**:
- Toggle has proper ARIA attributes (`aria-pressed` for button, `checked` for checkbox)
- Screen reader announces state change when toggled
- Accessible name is clear ("Show on Radar" / "Hide from Radar")

**Recovery Procedures**:
- If state not announced: Add `aria-pressed` attribute or ensure checkbox has proper labeling
- If name unclear: Update `aria-label` to be more descriptive

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

### Panic Button

**Edge Case**: Screen reader announces panic button purpose and state

**Expected Behavior**:
- Button has accessible name ("Emergency panic button")
- Button role is "button"
- Title attribute provides additional context

**Recovery Procedures**:
- If name not announced: Ensure `aria-label` is set correctly
- If role incorrect: Ensure button uses native `<button>` element or has `role="button"`

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

### Chat Status

**Edge Case**: Screen reader announces connection state changes

**Expected Behavior**:
- Connection status uses `role="status"` or `aria-live` for announcements
- Status changes are announced immediately
- Status text is clear ("Connected", "Connecting", "Disconnected")

**Recovery Procedures**:
- If status not announced: Add `role="status"` or `aria-live="polite"` to status element
- If announcements delayed: Use `aria-live="assertive"` for immediate announcements

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

### Error Banners

**Edge Case**: Screen reader announces errors immediately

**Expected Behavior**:
- Error banners use `role="alert"` for immediate announcements
- Error messages are user-friendly (not technical jargon)
- Recovery actions are clearly labeled

**Recovery Procedures**:
- If errors not announced: Ensure `role="alert"` is set on error banner
- If messages too technical: Update error messages to be user-friendly
- If recovery unclear: Add clear labels to retry/refresh buttons

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

### Empty States

**Edge Case**: Screen reader announces empty state when no people available

**Expected Behavior**:
- Empty state uses `role="status"` for announcements
- Message is clear ("No one nearby — yet.")
- Status is announced when state changes

**Recovery Procedures**:
- If empty state not announced: Add `role="status"` to empty state element
- If message unclear: Update empty state message to be more descriptive

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

## WebSocket Failure Edge Cases

### Disconnect During Use

**Edge Case**: WebSocket disconnects during active chat or radar update

**Expected Behavior**:
- Error banner appears with user-friendly message
- Connection status updates to "Disconnected" or "Error"
- Recovery action (refresh/retry) is available
- App remains usable (graceful degradation)

**Recovery Procedures**:
- Automatic reconnection (up to 5 attempts with exponential backoff)
- If reconnection fails: Show error banner with refresh option
- User can refresh page to reconnect

**Test Coverage**: `tests/e2e/accessibility/websocket-failure.spec.ts`

### Connection Failure

**Edge Case**: Initial WebSocket connection fails

**Expected Behavior**:
- Error banner appears after reconnection attempts exhausted
- Error message is user-friendly ("Connection failed. Please refresh the page.")
- Recovery action (refresh) is available
- App remains usable

**Recovery Procedures**:
- Automatic reconnection attempts (up to 5)
- If all attempts fail: Show error banner
- User can refresh page to retry connection

**Test Coverage**: `tests/e2e/accessibility/websocket-failure.spec.ts`

### Reconnection

**Edge Case**: WebSocket reconnects after disconnect

**Expected Behavior**:
- Automatic reconnection attempts (up to 5 with exponential backoff)
- Connection status updates to "Connecting" then "Connected"
- Status is announced to screen readers
- App functionality restored

**Recovery Procedures**:
- Reconnection happens automatically
- If reconnection fails: Show error banner with refresh option
- User can refresh page to force reconnection

**Test Coverage**: `tests/e2e/accessibility/websocket-failure.spec.ts`

## API Error Recovery Edge Cases

### 4xx Validation Errors

**Edge Case**: API returns 400 validation error

**Expected Behavior**:
- Error banner appears with user-friendly message
- Error message does NOT contain technical details (no "400", "validation failed", etc.)
- Recovery action (retry/fix and resubmit) is available
- Form remains fillable (graceful degradation)

**Recovery Procedures**:
- User can fix validation errors and resubmit
- Error message guides user to fix issues
- Form state is preserved (user doesn't lose input)

**Test Coverage**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

### 401 Unauthorized

**Edge Case**: API returns 401 unauthorized error

**Expected Behavior**:
- Error banner appears with user-friendly message
- Error message does NOT contain technical details (no "401", "unauthorized", etc.)
- Recovery action (retry or re-authenticate) is available
- App remains usable

**Recovery Procedures**:
- User can retry request
- If token expired: User may need to restart onboarding
- Error message guides user to retry

**Test Coverage**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

### 404 Not Found

**Edge Case**: API returns 404 not found error

**Expected Behavior**:
- Error banner appears with user-friendly message
- Error message does NOT contain technical details (no "404", "not found", etc.)
- Recovery action (retry) is available
- App remains usable

**Recovery Procedures**:
- User can retry request
- If endpoint changed: May need to refresh page or restart onboarding
- Error message guides user to retry

**Test Coverage**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

### 500 Server Error

**Edge Case**: API returns 500 server error

**Expected Behavior**:
- Error banner appears with user-friendly message
- Error message does NOT contain technical details (no "500", "internal server error", etc.)
- Recovery action (retry) is available
- App remains usable

**Recovery Procedures**:
- User can retry request
- If server issue persists: User may need to wait and retry later
- Error message guides user to retry

**Test Coverage**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

### 503 Service Unavailable

**Edge Case**: API returns 503 service unavailable error

**Expected Behavior**:
- Error banner appears with user-friendly message
- Error message does NOT contain technical details (no "503", "service unavailable", etc.)
- Recovery action (retry) is available
- App remains usable

**Recovery Procedures**:
- User can retry request
- If service down: User may need to wait and retry later
- Error message indicates temporary issue

**Test Coverage**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

## Accessibility Edge Cases

### Keyboard Traps

**Edge Case**: User gets trapped in a keyboard navigation loop

**Expected Behavior**:
- No keyboard traps exist
- All interactive elements are reachable via keyboard
- Escape key closes dialogs/modals
- Tab order is logical and complete

**Recovery Procedures**:
- Review focus management in dialogs/modals
- Ensure Escape key handlers are implemented
- Verify tab order doesn't skip elements

**Test Coverage**: All keyboard-only journey tests

### Focus Management

**Edge Case**: Focus is lost or not visible during navigation

**Expected Behavior**:
- Focus is always visible on interactive elements
- Focus order is logical and preserves meaning
- Focus moves correctly when dialogs open/close

**Recovery Procedures**:
- Ensure CSS includes `focus-visible` styles
- Review focus management in dynamic components
- Verify focus moves to dialog when opened

**Test Coverage**: All keyboard-only journey tests

### Screen Reader Announcements

**Edge Case**: Screen reader doesn't announce state changes or errors

**Expected Behavior**:
- State changes are announced via `aria-live` or `role="status"`
- Errors are announced immediately via `role="alert"`
- Empty states are announced via `role="status"`

**Recovery Procedures**:
- Add `role="alert"` to error banners
- Add `role="status"` to status messages
- Use `aria-live="assertive"` for immediate announcements

**Test Coverage**: `tests/e2e/accessibility/screen-reader.spec.ts`

## Performance Under Stress Edge Cases

### Network Issues

**Edge Case**: App behavior during network issues or high latency

**Expected Behavior**:
- App remains usable when network is slow
- Loading states are shown during API calls
- Timeouts are handled gracefully
- Error messages appear if requests fail

**Recovery Procedures**:
- User can retry failed requests
- App doesn't crash on network errors
- Loading states prevent duplicate requests

**Test Coverage**: WebSocket failure and API error recovery tests

### High Latency

**Edge Case**: App behavior during high latency conditions

**Expected Behavior**:
- App remains responsive
- Loading states are shown
- Timeouts are handled gracefully
- User can cancel long-running operations

**Recovery Procedures**:
- User can refresh page if operations hang
- Timeouts prevent indefinite waiting
- Error messages guide user to retry

**Test Coverage**: WebSocket failure and API error recovery tests

## Recovery Action Patterns

### Error Messages

**Pattern**: All error messages must be user-friendly

**Requirements**:
- No technical jargon (no HTTP status codes, error codes, stack traces)
- Clear, actionable language ("Please try again", "Refresh the page")
- Recovery guidance included in message

**Examples**:
- ✅ "Connection failed. Please refresh the page."
- ❌ "WebSocket connection error: ECONNREFUSED"

### Recovery Actions

**Pattern**: All errors must have recovery actions

**Requirements**:
- Retry button for transient errors
- Refresh button for connection errors
- Fix and resubmit for validation errors
- Clear error state when action taken

**Examples**:
- Retry button for API errors
- Refresh button for WebSocket errors
- Fix form and resubmit for validation errors

### Status Communication

**Pattern**: All status changes must be communicated

**Requirements**:
- Connection status visible and announced
- Loading states shown during operations
- Success/error states clearly indicated
- Screen reader announcements for all status changes

**Examples**:
- "Connected" / "Connecting" / "Disconnected" status
- Loading spinner during API calls
- Success toast after operations complete

## Test Coverage Summary

All edge cases are covered by the following test files:

- **Keyboard Navigation**: `tests/e2e/accessibility/keyboard-onboarding.spec.ts`, `tests/e2e/accessibility/keyboard-radar.spec.ts`, `tests/e2e/accessibility/keyboard-panic.spec.ts`
- **Screen Reader**: `tests/e2e/accessibility/screen-reader.spec.ts`
- **WebSocket Failure**: `tests/e2e/accessibility/websocket-failure.spec.ts`
- **API Error Recovery**: `tests/e2e/accessibility/api-error-recovery.spec.ts`

## Maintenance

This document should be updated whenever:
- New edge cases are discovered
- Recovery procedures change
- New error scenarios are added
- Test coverage is expanded

**Last Updated**: 2025-11-20
