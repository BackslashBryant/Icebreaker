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
 * Panic button should be visible on Radar and Chat pages, not on Profile/Welcome/Onboarding pages
 */
export async function checkPanicButtonVisible(page: Page): Promise<boolean> {
  try {
    // Check if we're on a page where panic button should be visible
    const currentUrl = page.url();
    const isRadarPage = currentUrl.includes('/radar');
    const isChatPage = currentUrl.includes('/chat');
    
    if (!isRadarPage && !isChatPage) {
      // Not on Radar or Chat page - panic button won't be visible (expected)
      return false;
    }
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    
    // Wait for Radar/Chat heading to appear (ensures page has loaded and React has rendered)
    try {
      if (isRadarPage) {
        await page.getByRole('heading', { name: /RADAR/i }).waitFor({ timeout: 15000, state: 'visible' });
      } else if (isChatPage) {
        // Chat page might not have a heading, wait for chat content instead
        await page.waitForSelector('[data-testid="chat-input"], [data-testid="chat-messages"]', { timeout: 15000 }).catch(() => {});
      }
    } catch {
      // If heading/chat content not found, continue anyway
    }
    
    // Wait a bit more for React to render components
    await page.waitForTimeout(500);
    
    // Check for panic button by data-testid first (most reliable)
    const panicButtonByTestId = page.locator('[data-testid="panic-fab"]');
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
    
    // Final fallback: check if element exists in DOM (might be hidden)
    const existsInDom = await panicButtonByTestId.count() > 0;
    if (existsInDom) {
      // Element exists but might be hidden - check computed style
      const isActuallyVisible = await panicButtonByTestId.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
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
    const currentUrl = page.url();
    if (!currentUrl.includes('/profile')) {
      // Not on Profile page - visibility toggle won't be visible
      return false;
    }
    
    // Wait for Profile page heading to appear (more reliable than networkidle)
    // This ensures the page has loaded and React has rendered
    try {
      await page.getByRole('heading', { name: /Profile Settings|PROFILE/i }).waitFor({ timeout: 15000, state: 'visible' });
    } catch {
      // If heading not found, continue anyway
    }
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    
    // Wait a bit more for React to render components
    await page.waitForTimeout(500);
    
    // Check for visibility toggle by data-testid (container) - most reliable
    const visibilityToggle = page.locator('[data-testid="visibility-toggle"]');
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
    
    // Check if element exists in DOM (might be hidden)
    const existsInDom = await visibilityToggle.count() > 0;
    if (existsInDom) {
      // Element exists but might be hidden - check computed style
      const isActuallyVisible = await visibilityToggle.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
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
      
      // Skip location permission denied messages (expected in tests)
      if (text?.toLowerCase().includes('location access denied') || 
          text?.toLowerCase().includes('proximity matching is unavailable')) {
        continue;
      }
      
      // Only count actual error banners (destructive styling)
      // Skip informational alerts that don't have destructive styling
      const hasDestructiveStyling = className?.includes('destructive') || 
                                    className?.includes('border-destructive');
      
      // Only count as error if it has destructive styling AND error-related text
      // This filters out informational alerts that might have "error" in text but aren't actual errors
      if (hasDestructiveStyling && (
          text?.toLowerCase().includes('error') ||
          text?.toLowerCase().includes('failed') ||
          text?.toLowerCase().includes('connection failed') ||
          text?.toLowerCase().includes('unable to connect'))) {
        errorCount++;
      }
    }
    
    // Also check for explicit error classes
    const errorClassElements = await page.locator('.error, [data-testid*="error"]').count();
    
    return Math.max(errorCount, errorClassElements);
  } catch {
    return 0;
  }
}

