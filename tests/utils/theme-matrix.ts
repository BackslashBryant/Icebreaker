/**
 * Theme/Viewport Test Matrix Helper
 *
 * Provides utilities for applying theme, viewport, and accessibility settings
 * in visual regression tests. Supports light/dark themes, reduced motion,
 * and high-contrast mode combinations.
 */

import { Page } from '@playwright/test';
import { ViewportConfig, VIEWPORTS } from './viewports';

export type ColorScheme = 'light' | 'dark';
export type ReducedMotion = 'reduce' | 'no-preference';
export type HighContrast = 'on' | 'off';

export interface ThemeSettings {
  colorScheme: ColorScheme;
  reducedMotion: ReducedMotion;
  highContrast: HighContrast;
}

export interface ThemeMatrixConfig {
  viewport: ViewportConfig;
  theme: ThemeSettings;
}

/**
 * Apply theme settings to a Playwright page
 *
 * @param page - Playwright page instance
 * @param settings - Theme settings to apply
 */
export async function applyThemeSettings(
  page: Page,
  settings: ThemeSettings,
): Promise<void> {
  // Apply color scheme (light/dark)
  await page.emulateMedia({ colorScheme: settings.colorScheme });

  // Apply reduced motion preference
  await page.emulateMedia({
    reducedMotion: settings.reducedMotion === 'reduce' ? 'reduce' : 'no-preference'
  });

  // Apply high contrast mode via class toggle
  const htmlElement = page.locator('html');
  if (settings.highContrast === 'on') {
    await htmlElement.evaluate((el) => {
      el.classList.add('high-contrast');
    });
  } else {
    await htmlElement.evaluate((el) => {
      el.classList.remove('high-contrast');
    });
  }

  // Apply dark mode class if needed (matches :root.dark selector)
  if (settings.colorScheme === 'dark') {
    await htmlElement.evaluate((el) => {
      el.classList.add('dark');
    });
  } else {
    await htmlElement.evaluate((el) => {
      el.classList.remove('dark');
    });
  }

  // Wait for CSS to apply
  await page.waitForTimeout(100);
}

/**
 * Generate screenshot name with all parameters
 *
 * Format: {screen}-{viewport}-{theme}-{motion}-{contrast}.png
 *
 * @param screen - Screen/section name (e.g., "welcome", "onboarding-step-0")
 * @param viewport - Viewport config name
 * @param theme - Theme settings
 * @returns Screenshot filename
 */
export function generateScreenshotName(
  screen: string,
  viewport: string,
  theme: ThemeSettings,
): string {
  const themeName = theme.colorScheme;
  const motionName = theme.reducedMotion === 'reduce' ? 'reduced-motion' : 'normal-motion';
  const contrastName = theme.highContrast === 'on' ? 'high-contrast' : 'normal-contrast';

  return `${screen}-${viewport}-${themeName}-${motionName}-${contrastName}.png`;
}

/**
 * Get all theme/viewport combinations for test matrix
 *
 * Returns 24 combinations:
 * - 3 viewports (mobile, tablet, desktop)
 * - 2 color schemes (light, dark)
 * - 2 reduced motion settings (reduce, no-preference)
 * - 2 high contrast settings (on, off)
 *
 * @param viewports - Optional viewport names to include (default: all)
 * @returns Array of theme matrix configurations
 */
export function getThemeMatrix(
  viewports: string[] = ['mobile', 'tablet', 'desktop'],
): ThemeMatrixConfig[] {
  const colorSchemes: ColorScheme[] = ['light', 'dark'];
  const reducedMotions: ReducedMotion[] = ['reduce', 'no-preference'];
  const highContrasts: HighContrast[] = ['on', 'off'];

  const matrix: ThemeMatrixConfig[] = [];

  for (const viewportName of viewports) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];
    if (!viewport) {
      console.warn(`Viewport "${viewportName}" not found, skipping`);
      continue;
    }

    for (const colorScheme of colorSchemes) {
      for (const reducedMotion of reducedMotions) {
        for (const highContrast of highContrasts) {
          matrix.push({
            viewport,
            theme: {
              colorScheme,
              reducedMotion,
              highContrast,
            },
          });
        }
      }
    }
  }

  return matrix;
}

/**
 * Get theme matrix for a single viewport
 *
 * @param viewportName - Viewport name (mobile, tablet, desktop)
 * @returns Array of theme configurations for that viewport
 */
export function getThemeMatrixForViewport(
  viewportName: string,
): ThemeMatrixConfig[] {
  return getThemeMatrix([viewportName]);
}

/**
 * Get all unique theme combinations (without viewport)
 *
 * Returns 8 combinations:
 * - 2 color schemes × 2 reduced motion × 2 high contrast
 *
 * @returns Array of theme settings
 */
export function getAllThemeCombinations(): ThemeSettings[] {
  const colorSchemes: ColorScheme[] = ['light', 'dark'];
  const reducedMotions: ReducedMotion[] = ['reduce', 'no-preference'];
  const highContrasts: HighContrast[] = ['on', 'off'];

  const combinations: ThemeSettings[] = [];

  for (const colorScheme of colorSchemes) {
    for (const reducedMotion of reducedMotions) {
      for (const highContrast of highContrasts) {
        combinations.push({
          colorScheme,
          reducedMotion,
          highContrast,
        });
      }
    }
  }

  return combinations;
}

