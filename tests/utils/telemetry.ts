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
    const artifactsDir = path.join(process.cwd(), 'artifacts', 'persona-runs');
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
 */
export async function checkPanicButtonVisible(page: Page): Promise<boolean> {
  try {
    const panicButton = page.locator('[data-testid="panic-fab"]');
    return await panicButton.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Check if visibility toggle is visible
 */
export async function checkVisibilityToggleVisible(page: Page): Promise<boolean> {
  try {
    const visibilityToggle = page.locator('[data-testid="visibility-toggle"]');
    return await visibilityToggle.isVisible({ timeout: 2000 });
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
 */
export async function countErrorBanners(page: Page): Promise<number> {
  try {
    const errorBanners = await page.locator('[role="alert"], .error, [data-testid*="error"]').count();
    return errorBanners;
  } catch {
    return 0;
  }
}

