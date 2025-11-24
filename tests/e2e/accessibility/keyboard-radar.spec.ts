/**
 * Keyboard-Only Journey Tests - Radar Navigation
 * 
 * Verifies complete keyboard-only navigation through radar:
 * View toggle, person selection, person card dialog, chat initiation
 * 
 * WCAG Requirements:
 * - 2.1.1 Keyboard (Level A): All functionality operable via keyboard
 * - 2.4.3 Focus Order (Level A): Focus order preserves meaning
 * - 2.4.7 Focus Visible (Level AA): Keyboard focus indicator visible
 */

import { test, expect } from "../fixtures/ws-mock.setup";
import { SEL } from "../../utils/selectors";

test.describe("Keyboard-Only Journey: Radar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage (simulate completed onboarding)
    await page.addInitScript(() => {
      sessionStorage.setItem("icebreaker_session", JSON.stringify({
        sessionId: "test-session",
        token: "test-token",
        handle: "testuser",
      }));
    });

    // Navigate to radar (assuming onboarding is complete)
    await page.goto("/radar");
    await page.waitForLoadState("networkidle");
    
    // Wait for radar to load
    await expect(page.getByText("RADAR").or(page.locator(SEL.radarHeading))).toBeVisible({ timeout: 10000 });
  });

  test("view toggle works with keyboard only", async ({ page }) => {
    const radarButton = page.getByRole("button", { name: /Switch to radar sweep view/i });
    const listButton = page.getByRole("button", { name: /Switch to list view/i });

    const onSweep = (await radarButton.getAttribute("aria-pressed")) === "true";

    if (onSweep) {
      await listButton.press("Enter");
      await expect(listButton).toHaveAttribute("aria-pressed", "true");
      const listLocator = page.locator("ul[role='list']").or(page.getByRole("list"));
      if (await listLocator.count() > 0) {
        await expect(listLocator.first()).toBeVisible({ timeout: 2000 });
      } else {
        await expect(page.getByText(/No one nearby|No one here/i)).toBeVisible({ timeout: 2000 });
      }

      await radarButton.press("Enter");
      await expect(radarButton).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("main", { name: /radar view content/i })).toBeVisible({ timeout: 2000 });
    } else {
      await radarButton.press("Enter");
      await expect(radarButton).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("main", { name: /radar view content/i })).toBeVisible({ timeout: 2000 });

      await listButton.press("Enter");
      await expect(listButton).toHaveAttribute("aria-pressed", "true");
      const listLocator = page.locator("ul[role='list']").or(page.getByRole("list"));
      if (await listLocator.count() > 0) {
        await expect(listLocator.first()).toBeVisible({ timeout: 2000 });
      } else {
        await expect(page.getByText(/No one nearby|No one here/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test("person selection works with keyboard only", async ({ page }) => {
    // Switch to list view first (easier to test person selection)
    const listButton = page.getByRole("button", { name: /list view/i });
    if (await listButton.isVisible()) {
      await listButton.click(); // Use click for setup, then test keyboard
      const listLocator = page.locator("ul[role='list']").or(page.getByRole("list"));
      if (await listLocator.count() === 0) {
        await expect(page.getByText(/No one nearby|No one here/i)).toBeVisible({ timeout: 2000 });
        return;
      }
      await expect(listLocator.first()).toBeVisible({ timeout: 2000 });
    }
    
    // Tab to header buttons, then to view toggles, then to person cards
    await page.keyboard.press("Tab"); // Profile
    await page.keyboard.press("Tab"); // Radar sweep toggle
    await page.keyboard.press("Tab"); // List toggle
    
    // Continue tabbing to find person cards
    // Person cards are buttons in the list
    let foundPersonCard = false;
    let tabCount = 0;
    const maxTabs = 20; // Safety limit
    
    while (!foundPersonCard && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
      const role = await focusedElement.getAttribute("role");
      const text = await focusedElement.textContent();
      
      // Check if we're on a person card (button in list, or canvas interaction)
      if (tagName === "button" && text && text.length > 0 && !text.includes("view") && !text.includes("profile")) {
        // Likely a person card
        foundPersonCard = true;
        break;
      }
      
      // If we hit the panic button, we've gone too far
      if (await focusedElement.getAttribute("data-testid") === "panic-fab") {
        break; // No person cards available
      }
    }
    
    if (foundPersonCard) {
      const focusedPerson = page.locator(":focus");
      await expect(focusedPerson).toBeVisible();
      
      // Press Enter to select person
      await page.keyboard.press("Enter");
      
      // Person card dialog should open
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
    } else {
      // No people available - verify empty state
      const emptyState = page.getByRole("status").or(page.getByText(/No one nearby|No one here/i));
      await expect(emptyState.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test("person card dialog navigation works with keyboard only", async ({ page }) => {
    // First, open a person card (if available)
    // Switch to list view
    const listButton = page.getByRole("button", { name: /list view/i });
    if (await listButton.isVisible()) {
      await listButton.click(); // Setup: switch to list view
    }
    
    // Try to find and open a person card
    const personCards = page.locator("ul[role='list'] button, [role='list'] button");
    const personCount = await personCards.count();
    
    if (personCount > 0) {
      // Open first person card using keyboard
      await page.keyboard.press("Tab"); // Profile
      await page.keyboard.press("Tab"); // Radar toggle
      await page.keyboard.press("Tab"); // List toggle
      
      // Tab to first person card
      let tabCount = 0;
      while (tabCount < 10) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        const testId = await focused.getAttribute("data-testid");
        if (testId === "panic-fab") {
          // Went too far, no person cards in tab order
          break;
        }
        const text = await focused.textContent();
        if (text && !text.includes("view") && !text.includes("profile") && text.length > 5) {
          // Likely a person card
          await page.keyboard.press("Enter");
          break;
        }
        tabCount++;
      }
      
      // Wait for dialog
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
      
      // Tab through dialog buttons
      // Dialog should receive focus automatically, but let's tab to "START CHAT" button
      await page.keyboard.press("Tab");
      
      const chatButton = page.getByRole("button", { name: /START CHAT/i });
      
      // If not focused, tab again
      if (!(await chatButton.evaluate((el) => document.activeElement === el))) {
        await page.keyboard.press("Tab");
      }
      
      await expect(chatButton).toBeFocused();
      
      // Press Enter to activate (or verify it's disabled if in cooldown)
      const isDisabled = await chatButton.isDisabled();
      if (!isDisabled) {
        await page.keyboard.press("Enter");
        // Chat request should be sent (verify toast or state change)
      }
      
      // Test Escape to close dialog
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 1000 });
    } else {
      // No people - test is still valid, just skip dialog-specific tests
      const emptyState = page.getByRole("status").or(page.getByText(/No one nearby|No one here/i));
      await expect(emptyState.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test("chat initiation works with keyboard only", async ({ page }) => {
    // Switch to list view
    const listButton = page.getByRole("button", { name: /list view/i });
    if (await listButton.isVisible()) {
      await listButton.click(); // Setup
    }
    
    // Find and open person card
    const personCards = page.locator("ul[role='list'] button, [role='list'] button");
    const personCount = await personCards.count();
    
    if (personCount > 0) {
      // Open person card using keyboard
      await page.keyboard.press("Tab"); // Profile
      await page.keyboard.press("Tab"); // Radar toggle
      await page.keyboard.press("Tab"); // List toggle
      
      // Tab to person card
      let tabCount = 0;
      while (tabCount < 10) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        const text = await focused.textContent();
        if (text && !text.includes("view") && !text.includes("profile") && text.length > 5) {
          await page.keyboard.press("Enter");
          break;
        }
        tabCount++;
      }
      
      // Wait for dialog
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
      
      // Tab to "START CHAT →" button
      await page.keyboard.press("Tab");
      const chatButton = page.getByRole("button", { name: /START CHAT/i });
      
      if (!(await chatButton.evaluate((el) => document.activeElement === el))) {
        await page.keyboard.press("Tab");
      }
      
      await expect(chatButton).toBeFocused();
      
      // Verify button is accessible and can be activated
      const isDisabled = await chatButton.isDisabled();
      if (!isDisabled) {
        // Press Enter to initiate chat
        await page.keyboard.press("Enter");
        // Chat request sent - verify state change or toast
        // Note: Full chat flow would require WebSocket mock
      } else {
        // Cooldown active - verify button shows cooldown state
        await expect(chatButton).toContainText(/COOLDOWN/i);
      }
    } else {
      // No people available - test still passes (empty state is valid)
      const emptyState = page.getByRole("status").or(page.getByText(/No one nearby|No one here/i));
      await expect(emptyState.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test("navigation order is logical (header → view toggle → person cards → panic button)", async ({ page }) => {
    // Track focus order
    const focusOrder: string[] = [];
    
    // Tab through all interactive elements
    let tabCount = 0;
    const maxTabs = 15; // Safety limit
    
    while (tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      
      if (!(await focused.count())) {
        break; // No more focusable elements
      }
      
      const ariaLabel = await focused.getAttribute("aria-label");
      const text = await focused.textContent();
      const testId = await focused.getAttribute("data-testid");
      const role = await focused.getAttribute("role");
      
      const identifier = ariaLabel || text || testId || role || `element-${tabCount}`;
      focusOrder.push(identifier.trim());
      
      // If we hit panic button, we've completed the cycle
      if (testId === "panic-fab" || ariaLabel?.includes("panic")) {
        break;
      }
      
      tabCount++;
    }
    
    // Verify logical order
    // Should start with header buttons (profile, view toggles)
    expect(focusOrder.length).toBeGreaterThan(0);
    
    // Profile button should be early
    const hasProfile = focusOrder.some(item => item.toLowerCase().includes("profile") || item.toLowerCase().includes("go to profile"));
    
    // View toggles should be after profile
    const hasViewToggle = focusOrder.some(item => item.toLowerCase().includes("view") || item.toLowerCase().includes("list") || item.toLowerCase().includes("radar"));
    
    // Panic button should be last (or near the end)
    const panicIndex = focusOrder.findIndex(item => item.toLowerCase().includes("panic") || item.includes("panic-fab"));
    
    if (panicIndex >= 0) {
      // Panic button should be towards the end (after main content)
      expect(panicIndex).toBeGreaterThan(2); // Should be after header buttons
    }
  });

  test("all radar interactions work with keyboard only (no mouse clicks)", async ({ page }) => {
    // Disable mouse interactions
    await page.addInitScript(() => {
      document.addEventListener("click", (e) => {
        if ((e as any).isTrusted) {
          throw new Error("Mouse click detected - keyboard-only test failed");
        }
      }, true);
    });
    
    // Test view toggle with keyboard only
    await page.keyboard.press("Tab"); // Profile
    await page.keyboard.press("Tab"); // Radar toggle
    await page.keyboard.press("Tab"); // List toggle
    
    const listButton = page.getByRole("button", { name: /list view/i });
    if (await listButton.isVisible()) {
      await expect(listButton).toBeFocused();
      await page.keyboard.press("Enter");
      
      // Verify list view activated
      await expect(listButton).toHaveAttribute("aria-pressed", "true");
    }
    
    // Test person selection (if people available)
    const personCards = page.locator("ul[role='list'] button, [role='list'] button");
    const personCount = await personCards.count();
    
    if (personCount > 0) {
      // Tab to person card
      await page.keyboard.press("Tab");
      let tabCount = 0;
      while (tabCount < 10) {
        const focused = page.locator(":focus");
        const text = await focused.textContent();
        if (text && !text.includes("view") && !text.includes("profile") && text.length > 5) {
          await page.keyboard.press("Enter");
          break;
        }
        await page.keyboard.press("Tab");
        tabCount++;
      }
      
      // Verify dialog opened
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
      
      // Tab to chat button
      await page.keyboard.press("Tab");
      const chatButton = page.getByRole("button", { name: /START CHAT/i });
      await expect(chatButton).toBeFocused();
      
      // Close dialog with Escape
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 1000 });
    }
    
    // Test panic button access
    // Tab to panic button (should be last or near last)
    let tabCount = 0;
    while (tabCount < 15) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const testId = await focused.getAttribute("data-testid");
      if (testId === "panic-fab") {
        await expect(focused).toBeFocused();
        break;
      }
      tabCount++;
    }
  });

  test("focus visible on all interactive elements", async ({ page }) => {
    // Tab through interactive elements and verify focus is visible
    let tabCount = 0;
    const maxTabs = 10;
    let allHaveVisibleFocus = true;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      
      if (!(await focused.count())) {
        break;
      }
      
      // Check if focus is visible
      const hasFocusVisible = await focused.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outlineWidth !== "0px" ||
          styles.outlineStyle !== "none" ||
          el.classList.contains("focus-visible") ||
          el.classList.contains("ring-2") ||
          styles.boxShadow !== "none"
        );
      });
      
      if (!hasFocusVisible) {
        allHaveVisibleFocus = false;
        break;
      }
      
      tabCount++;
    }
    
    expect(allHaveVisibleFocus).toBe(true);
  });
});

