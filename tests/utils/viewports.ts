/**
 * Viewport Matrix Helper
 *
 * Provides standardized viewport configurations for visual regression testing.
 * Ensures consistent testing across mobile, tablet, and desktop viewports.
 */

import { devices } from '@playwright/test';

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

/**
 * Standard viewport configurations for visual regression testing
 */
export const VIEWPORTS: Record<string, ViewportConfig> = {
  'small-mobile': {
    name: 'small-mobile',
    width: 320,
    height: 568,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  mobile: {
    name: 'mobile',
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  tablet: {
    name: 'tablet',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true,
  },
  desktop: {
    name: 'desktop',
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
};

/**
 * Get viewport config by name
 */
export function getViewport(name: keyof typeof VIEWPORTS): ViewportConfig {
  return VIEWPORTS[name];
}

/**
 * Get all viewport names
 */
export function getViewportNames(): string[] {
  return Object.keys(VIEWPORTS);
}

/**
 * Apply viewport to Playwright page
 */
export async function setViewport(
  page: any,
  viewport: ViewportConfig,
): Promise<void> {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
}

/**
 * Mask dynamic content in screenshots
 *
 * Common patterns to mask:
 * - Handles/usernames
 * - Timestamps
 * - Session IDs
 * - Randomly generated content
 */
export const MASK_SELECTORS = [
  '[data-testid*="handle"]',
  '[data-testid*="username"]',
  '[data-testid*="timestamp"]',
  '[data-testid*="session"]',
  '.timestamp',
  '.handle',
  '.username',
];

