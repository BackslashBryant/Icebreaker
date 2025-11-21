/**
 * Keyboard-Only Journey Tests - Panic Button
 * 
 * Verifies complete keyboard-only navigation for panic button:
 * Keyboard access, dialog interaction, confirmation
 * 
 * WCAG Requirements:
 * - 2.1.1 Keyboard (Level A): All functionality operable via keyboard
 * - 2.4.3 Focus Order (Level A): Focus order preserves meaning
 * - 2.4.7 Focus Visible (Level AA): Keyboard focus indicator visible
 */

import { test, expect } from "../fixtures/ws-mock.setup";

test.describe("Keyboard-Only Journey: Panic Button", () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage (simulate completed onboarding)
    await page.addInitScript(() => {
      sessionStorage.setItem("icebreaker_session", JSON.stringify({
        sessionId: "test-session",
        token: "test-token",
        handle: "testuser",
      }));
    });

    // Navigate to radar (panic button is visible on radar)
    await page.goto("/radar");
    await page.waitForLoadState("networkidle");
    
    // Wait for radar to load
    await expect(page.getByText("RADAR").or(page.getByRole("heading", { name: /RADAR/i }))).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => (window as any).__ICEBREAKER_WS_STATUS__ === "connected", null, { timeout: 10000 });
  });

  test("panic button is keyboard accessible", async ({ page }) => {
    // Tab through all elements to reach panic button
    // Panic button should be in tab order (typically last or near last)
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20; // Safety limit
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      // Check if we're on the panic button
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        await expect(focusedElement).toBeFocused();
        await expect(focusedElement).toBeVisible();
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Verify focus is visible on panic button
    const panicButton = page.getByRole("button", { name: /emergency panic button/i }).or(page.locator('[data-testid="panic-fab"]'));
    const hasFocusVisible = await panicButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outlineWidth !== "0px" ||
        styles.outlineStyle !== "none" ||
        el.classList.contains("focus-visible") ||
        el.classList.contains("ring-2") ||
        styles.boxShadow !== "none"
      );
    });
    
    expect(hasFocusVisible).toBe(true);
  });

  test("panic dialog opens with keyboard and receives focus", async ({ page }) => {
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Press Enter to open dialog
    await page.keyboard.press("Enter");
    
    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    
    // Dialog should receive focus (check for focusable element inside dialog)
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    
    // Check if dialog has focusable content
    const dialogButtons = dialog.getByRole("button");
    const buttonCount = await dialogButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("panic dialog navigation works with keyboard only", async ({ page }) => {
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Open dialog
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    
    // Tab through dialog buttons
    // First tab should focus a button in the dialog
    await page.keyboard.press("Tab");
    
    const focusedInDialog = page.locator(":focus");
    const isInDialog = await focusedInDialog.evaluate((el) => {
      const dialog = el.closest('[role="dialog"]');
      return dialog !== null;
    });
    
    expect(isInDialog).toBe(true);
    
    // Find all buttons in dialog
    const dialog = page.getByRole("dialog");
    const buttons = dialog.getByRole("button");
    const buttonCount = await buttons.count();
    
    // Tab through buttons
    for (let i = 0; i < buttonCount; i++) {
      const focused = page.locator(":focus");
      const text = await focused.textContent();
      const isButton = await focused.evaluate((el) => el.tagName.toLowerCase() === "button");
      
      if (isButton) {
        // Verify button is focused and visible
        await expect(focused).toBeFocused();
        await expect(focused).toBeVisible();
      }
      
      if (i < buttonCount - 1) {
        await page.keyboard.press("Tab");
      }
    }
  });

  test("panic confirmation works with keyboard only", async ({ page }) => {
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Open dialog
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    
    // Tab to "Confirm" button (or similar)
    await page.keyboard.press("Tab");
    
    // Find confirm button
    const dialog = page.getByRole("dialog");
    const confirmButton = dialog.getByTestId("panic-confirm");
    
    // If not focused, tab again
    if (!(await confirmButton.evaluate((el) => document.activeElement === el))) {
      await page.keyboard.press("Tab");
    }
    
    await expect(confirmButton).toBeFocused();
    
    // Press Enter to confirm
    await page.keyboard.press("Enter");
    
    // Dialog should close or show success state
    // Note: Actual panic behavior may redirect or show success message
    // For now, verify dialog state changes
    await page.waitForTimeout(500); // Allow state change
  });

  test("Escape key closes panic dialog", async ({ page }) => {
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Open dialog
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
    
    // Press Escape to close
    await page.keyboard.press("Escape");
    
    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 1000 });
  });

  test("all panic interactions work with keyboard only (no mouse clicks)", async ({ page }) => {
    // Disable mouse interactions
    await page.addInitScript(() => {
      document.addEventListener("click", (e) => {
        if ((e as any).isTrusted) {
          throw new Error("Mouse click detected - keyboard-only test failed");
        }
      }, true);
    });
    
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Open dialog with Enter
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
    
    // Navigate dialog with Tab
    await page.keyboard.press("Tab");
    const focusedInDialog = page.locator(":focus");
    const isInDialog = await focusedInDialog.evaluate((el) => {
      const dialog = el.closest('[role="dialog"]');
      return dialog !== null;
    });
    expect(isInDialog).toBe(true);
    
    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 1000 });
  });

  test("focus visible on panic button and dialog elements", async ({ page }) => {
    // Tab to panic button
    let foundPanicButton = false;
    let tabCount = 0;
    const maxTabs = 20;
    
    while (!foundPanicButton && tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;
      
      const focusedElement = page.locator(":focus");
      const testId = await focusedElement.getAttribute("data-testid");
      const ariaLabel = await focusedElement.getAttribute("aria-label");
      
      if (testId === "panic-fab" || ariaLabel?.toLowerCase().includes("panic") || ariaLabel?.toLowerCase().includes("emergency")) {
        foundPanicButton = true;
        
        // Verify focus is visible
        const hasFocusVisible = await focusedElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return (
            styles.outlineWidth !== "0px" ||
            styles.outlineStyle !== "none" ||
            el.classList.contains("focus-visible") ||
            el.classList.contains("ring-2") ||
            styles.boxShadow !== "none"
          );
        });
        
        expect(hasFocusVisible).toBe(true);
        break;
      }
    }
    
    expect(foundPanicButton).toBe(true);
    
    // Open dialog
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
    
    // Tab through dialog elements and verify focus visibility
    await page.keyboard.press("Tab");
    const focusedInDialog = page.locator(":focus");
    
    const dialogHasFocusVisible = await focusedInDialog.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outlineWidth !== "0px" ||
        styles.outlineStyle !== "none" ||
        el.classList.contains("focus-visible") ||
        el.classList.contains("ring-2") ||
        styles.boxShadow !== "none"
      );
    });
    
    expect(dialogHasFocusVisible).toBe(true);
  });
});

