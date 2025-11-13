/**
 * UX Telemetry Capture
 * 
 * Captures UX metrics during persona tests to identify friction points
 * and measure user experience quality.
 */

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface TelemetryData {
  persona: string;
  sessionId: string;
  timestamp: string;
  timings: {
    bootMs?: number;
    onboardingMs?: number;
    stepTimes?: Record<number, number>;
  };
  interactions: {
    stepsRetried: number;
    backButtonClicks: number;
    errorBannersEncountered: number;
  };
  accessibility: {
    a11yViolations?: number;
    focusOrderCorrect: boolean;
    visibleAffordances: {
      panicButton: boolean;
      visibilityToggle: boolean;
    };
  };
  errors: string[];
  metadata?: Record<string, any>;
}

export class TelemetryCollector {
  private data: Partial<TelemetryData> = {
    timings: {},
    interactions: {
      stepsRetried: 0,
      backButtonClicks: 0,
      errorBannersEncountered: 0,
    },
    accessibility: {
      focusOrderCorrect: true,
      visibleAffordances: {
        panicButton: false,
        visibilityToggle: false,
      },
    },
    errors: [],
  };

  private startTimes: Map<string, number> = new Map();

  constructor(persona: string, sessionId: string) {
    this.data.persona = persona;
    this.data.sessionId = sessionId;
    this.data.timestamp = new Date().toISOString();
  }

  /**
   * Start timing an event
   */
  startTiming(eventName: string): void {
    this.startTimes.set(eventName, Date.now());
  }

  /**
   * End timing an event and record duration
   */
  endTiming(eventName: string): number {
    const startTime = this.startTimes.get(eventName);
    if (!startTime) {
      return 0;
    }
    const duration = Date.now() - startTime;
    this.startTimes.delete(eventName);

    // Map common event names to telemetry fields
    if (eventName === 'boot') {
      this.data.timings!.bootMs = duration;
    } else if (eventName === 'onboarding') {
      this.data.timings!.onboardingMs = duration;
    } else if (eventName.startsWith('step-')) {
      const stepNum = parseInt(eventName.replace('step-', ''), 10);
      if (!this.data.timings!.stepTimes) {
        this.data.timings!.stepTimes = {};
      }
      this.data.timings!.stepTimes![stepNum] = duration;
    }

    return duration;
  }

  /**
   * Record step retry (back button usage)
   */
  recordStepRetry(): void {
    this.data.interactions!.stepsRetried++;
    this.data.interactions!.backButtonClicks++;
  }

  /**
   * Record error banner encountered
   */
  recordErrorBanner(): void {
    this.data.interactions!.errorBannersEncountered++;
  }

  /**
   * Record error
   */
  recordError(error: string): void {
    this.data.errors!.push(error);
  }

  /**
   * Record accessibility violations count
   */
  recordA11yViolations(count: number): void {
    this.data.accessibility!.a11yViolations = count;
  }

  /**
   * Record focus order check result
   */
  recordFocusOrder(correct: boolean): void {
    this.data.accessibility!.focusOrderCorrect = correct;
  }

  /**
   * Record visible affordance check
   */
  recordAffordance(name: 'panicButton' | 'visibilityToggle', visible: boolean): void {
    this.data.accessibility!.visibleAffordances![name] = visible;
  }

  /**
   * Add custom metadata
   */
  addMetadata(key: string, value: any): void {
    if (!this.data.metadata) {
      this.data.metadata = {};
    }
    this.data.metadata[key] = value;
  }

  /**
   * Get current telemetry data
   */
  getData(): TelemetryData {
    return this.data as TelemetryData;
  }

  /**
   * Write telemetry data to file
   */
  async writeToFile(): Promise<string> {
    // Resolve project root (go up from tests/ directory if needed)
    let projectRoot = process.cwd();
    if (projectRoot.endsWith('tests') || projectRoot.endsWith('tests\\') || projectRoot.endsWith('tests/')) {
      projectRoot = path.join(projectRoot, '..');
    }
    
    const artifactsDir = path.join(projectRoot, 'artifacts', 'persona-runs');
    fs.mkdirSync(artifactsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.data.persona}-${timestamp}.json`;
    const filepath = path.join(artifactsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(this.data, null, 2));

    return filepath;
  }
}

/**
 * Check if panic button is visible
 * Panic button should be visible on Radar and Chat pages
 */
export async function checkPanicButtonVisible(page: Page): Promise<boolean> {
  try {
    // Check if we're on a page where panic button should be visible
    // Use pathname to avoid issues with query params or hash
    const currentUrl = page.url();
    const urlPath = new URL(currentUrl).pathname;
    const shouldHavePanicButton = urlPath.includes('/radar') || 
                                   urlPath.includes('/chat') || 
                                   urlPath.includes('/profile');
    
    if (!shouldHavePanicButton) {
      // Not on a page where panic button should be visible (e.g., onboarding, welcome)
      return false;
    }
    
    // Wait for React to render - use a more reliable approach
    // First, wait for the page to be interactive
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    
    // Check for panic button by data-testid first (most reliable)
    const panicButtonByTestId = page.locator('[data-testid="panic-fab"]');
    
    // Wait for element to appear in DOM (with longer timeout for React rendering)
    try {
      // First try to wait for element to be attached
      await panicButtonByTestId.waitFor({ state: 'attached', timeout: 15000 });
    } catch {
      // Element not attached yet - check if it exists at all
      const count = await panicButtonByTestId.count();
      if (count === 0) {
        // Element doesn't exist in DOM - try aria-label fallback
        try {
          const panicButtonByAria = page.getByRole('button', { name: /Emergency panic button/i });
          await panicButtonByAria.waitFor({ state: 'attached', timeout: 5000 });
        } catch {
          // Neither method found the element
          return false;
        }
      }
    }
    
    // Check if element exists in DOM
    const count = await panicButtonByTestId.count();
    if (count === 0) {
      // Try aria-label fallback
      const panicButtonByAria = page.getByRole('button', { name: /Emergency panic button/i });
      const ariaCount = await panicButtonByAria.count();
      if (ariaCount === 0) {
        return false;
      }
      // Use aria-label element for visibility check
      const isVisibleByAria = await panicButtonByAria.isVisible({ timeout: 10000 }).catch(() => false);
      return isVisibleByAria;
    }
    
    // Element exists - check visibility with longer timeout
    const isVisibleByTestId = await panicButtonByTestId.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisibleByTestId) {
      return true;
    }
    
    // Fallback: check by aria-label (more reliable for accessibility)
    try {
      const panicButtonByAria = page.getByRole('button', { name: /Emergency panic button/i });
      const isVisibleByAria = await panicButtonByAria.isVisible({ timeout: 10000 }).catch(() => false);
      if (isVisibleByAria) {
        return true;
      }
    } catch {
      // Ignore aria-label check errors
    }
    
    // Final fallback: check if element exists in DOM and verify computed style
    const existsInDom = await panicButtonByTestId.count() > 0;
    if (existsInDom) {
      // Element exists but might be hidden - check computed style
      const isActuallyVisible = await panicButtonByTestId.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               rect.width > 0 && 
               rect.height > 0 &&
               rect.top >= 0 && 
               rect.left >= 0;
      }).catch(() => false);
      return isActuallyVisible;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if visibility toggle is visible
 * Visibility toggle is on Profile page, not Radar page
 */
export async function checkVisibilityToggleVisible(page: Page): Promise<boolean> {
  try {
    // Check if we're on Profile page
    // Use pathname to avoid issues with query params or hash
    const currentUrl = page.url();
    const urlPath = new URL(currentUrl).pathname;
    if (!urlPath.includes('/profile')) {
      // Not on Profile page - visibility toggle won't be visible
      return false;
    }
    
    // Wait for React to render - use a more reliable approach
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    
    // Check for visibility toggle by data-testid (container)
    const visibilityToggle = page.locator('[data-testid="visibility-toggle"]');
    
    // Wait for element to appear in DOM (with longer timeout for React rendering)
    try {
      // First try to wait for element to be attached
      await visibilityToggle.waitFor({ state: 'attached', timeout: 15000 });
    } catch {
      // Element not attached yet - check if it exists at all
      const count = await visibilityToggle.count();
      if (count === 0) {
        // Try checkbox fallback
        const visibilityCheckbox = page.locator('[data-testid="visibility-toggle-checkbox"]');
        const checkboxCount = await visibilityCheckbox.count();
        if (checkboxCount === 0) {
          // Try role-based fallback
          try {
            const checkboxByRole = page.getByRole('checkbox', { name: /Show me on Radar|Hide from Radar/i });
            await checkboxByRole.waitFor({ state: 'attached', timeout: 5000 });
          } catch {
            return false;
          }
        }
      }
    }
    
    // Check if element exists in DOM
    const count = await visibilityToggle.count();
    if (count === 0) {
      // Try checkbox fallback
      const visibilityCheckbox = page.locator('[data-testid="visibility-toggle-checkbox"]');
      const checkboxCount = await visibilityCheckbox.count();
      if (checkboxCount === 0) {
        // Try role-based fallback
        const checkboxByRole = page.getByRole('checkbox', { name: /Show me on Radar|Hide from Radar/i });
        const roleCount = await checkboxByRole.count();
        if (roleCount === 0) {
          return false;
        }
        // Use role-based element for visibility check
        const isVisibleByRole = await checkboxByRole.isVisible({ timeout: 10000 }).catch(() => false);
        return isVisibleByRole;
      }
      // Use checkbox for visibility check
      const isVisibleByCheckbox = await visibilityCheckbox.isVisible({ timeout: 10000 }).catch(() => false);
      return isVisibleByCheckbox;
    }
    
    // Element exists - check visibility with longer timeout
    const isVisibleByTestId = await visibilityToggle.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisibleByTestId) {
      return true;
    }
    
    // Fallback: check for checkbox with visibility-related aria-label
    const visibilityCheckbox = page.locator('[data-testid="visibility-toggle-checkbox"]');
    const isVisibleByCheckbox = await visibilityCheckbox.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisibleByCheckbox) {
      return true;
    }
    
    // Final fallback: check by role (checkbox with Show me on Radar/Hide from Radar)
    try {
      const checkboxByRole = page.getByRole('checkbox', { name: /Show me on Radar|Hide from Radar/i });
      const isVisibleByRole = await checkboxByRole.isVisible({ timeout: 10000 }).catch(() => false);
      if (isVisibleByRole) {
        return true;
      }
    } catch {
      // Ignore role check errors
    }
    
    // Check if element exists in DOM and verify computed style
    const existsInDom = await visibilityToggle.count() > 0;
    if (existsInDom) {
      // Element exists but might be hidden - check computed style
      const isActuallyVisible = await visibilityToggle.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               rect.width > 0 && 
               rect.height > 0 &&
               rect.top >= 0 && 
               rect.left >= 0;
      }).catch(() => false);
      return isActuallyVisible;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check focus order correctness (simplified check)
 * Verifies that focusable elements can be navigated in logical order
 */
export async function checkFocusOrder(page: Page): Promise<boolean> {
  try {
    // Get all focusable elements
    const focusableElements = await page.evaluate(() => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      return Array.from(document.querySelectorAll(selectors.join(','))).map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50) || '',
        tabIndex: (el as HTMLElement).tabIndex,
      }));
    });

    // Basic check: ensure elements exist and have reasonable tab order
    // More sophisticated checks would verify actual tab navigation
    return focusableElements.length > 0;
  } catch {
    return false;
  }
}

/**
 * Count error banners on page
 * Excludes informational alerts (like location permission denied which is expected)
 */
export async function countErrorBanners(page: Page): Promise<number> {
  try {
    // Get all elements with role="alert"
    const alertElements = page.locator('[role="alert"]');
    const alertCount = await alertElements.count();
    
    if (alertCount === 0) {
      return 0;
    }
    
    // Filter out informational/expected alerts
    let errorCount = 0;
    for (let i = 0; i < alertCount; i++) {
      const alert = alertElements.nth(i);
      const text = await alert.textContent().catch(() => '');
      const className = await alert.getAttribute('class').catch(() => '');
      
      // Skip location permission denied messages (expected in tests - informational, not error)
      if (text?.toLowerCase().includes('location access denied') || 
          text?.toLowerCase().includes('proximity matching is unavailable') ||
          text?.toLowerCase().includes('location access') && text?.toLowerCase().includes('unavailable')) {
        continue;
      }
      
      // Skip health status messages (informational)
      if (text?.toLowerCase().includes('health status') || 
          text?.toLowerCase().includes('status:')) {
        continue;
      }
      
      // Only count as error if it has destructive styling AND error keywords
      // This prevents counting informational alerts that happen to have role="alert"
      const hasDestructiveStyling = className?.includes('destructive') || 
                                     className?.includes('border-destructive') ||
                                     className?.includes('text-destructive');
      
      const hasErrorKeywords = text?.toLowerCase().includes('error') ||
                               text?.toLowerCase().includes('failed') ||
                               text?.toLowerCase().includes('connection failed') ||
                               text?.toLowerCase().includes('unable to connect');
      
      // Must have BOTH destructive styling AND error keywords to be counted as error
      if (hasDestructiveStyling && hasErrorKeywords) {
        errorCount++;
      }
    }
    
    // Also check for explicit error classes (but be more selective)
    const explicitErrorElements = await page.locator('[data-testid*="error"], .error-banner, .connection-error').count();
    
    return Math.max(errorCount, explicitErrorElements);
  } catch {
    return 0;
  }
}

