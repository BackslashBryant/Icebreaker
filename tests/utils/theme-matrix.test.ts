/**
 * Unit tests for theme-matrix helper functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateScreenshotName,
  getThemeMatrix,
  getAllThemeCombinations,
  getThemeMatrixForViewport,
  type ThemeSettings,
} from './theme-matrix';
import { VIEWPORTS } from './viewports';

describe('theme-matrix', () => {
  describe('generateScreenshotName', () => {
    it('generates correct screenshot name for light theme', () => {
      const name = generateScreenshotName('welcome', 'mobile', {
        colorScheme: 'light',
        reducedMotion: 'no-preference',
        highContrast: 'off',
      });
      expect(name).toBe('welcome-mobile-light-normal-motion-normal-contrast.png');
    });

    it('generates correct screenshot name for dark theme with reduced motion', () => {
      const name = generateScreenshotName('onboarding-step-0', 'tablet', {
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        highContrast: 'off',
      });
      expect(name).toBe('onboarding-step-0-tablet-dark-reduced-motion-normal-contrast.png');
    });

    it('generates correct screenshot name with high contrast', () => {
      const name = generateScreenshotName('radar', 'desktop', {
        colorScheme: 'light',
        reducedMotion: 'no-preference',
        highContrast: 'on',
      });
      expect(name).toBe('radar-desktop-light-normal-motion-high-contrast.png');
    });

    it('generates correct screenshot name for all settings combined', () => {
      const name = generateScreenshotName('profile', 'mobile', {
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        highContrast: 'on',
      });
      expect(name).toBe('profile-mobile-dark-reduced-motion-high-contrast.png');
    });
  });

  describe('getAllThemeCombinations', () => {
    it('returns 8 theme combinations', () => {
      const combinations = getAllThemeCombinations();
      expect(combinations).toHaveLength(8);
    });

    it('includes all color scheme combinations', () => {
      const combinations = getAllThemeCombinations();
      const lightThemes = combinations.filter(c => c.colorScheme === 'light');
      const darkThemes = combinations.filter(c => c.colorScheme === 'dark');
      expect(lightThemes).toHaveLength(4);
      expect(darkThemes).toHaveLength(4);
    });

    it('includes all reduced motion combinations', () => {
      const combinations = getAllThemeCombinations();
      const reduced = combinations.filter(c => c.reducedMotion === 'reduce');
      const normal = combinations.filter(c => c.reducedMotion === 'no-preference');
      expect(reduced).toHaveLength(4);
      expect(normal).toHaveLength(4);
    });

    it('includes all high contrast combinations', () => {
      const combinations = getAllThemeCombinations();
      const highContrast = combinations.filter(c => c.highContrast === 'on');
      const normalContrast = combinations.filter(c => c.highContrast === 'off');
      expect(highContrast).toHaveLength(4);
      expect(normalContrast).toHaveLength(4);
    });
  });

  describe('getThemeMatrix', () => {
    it('returns 24 combinations for default viewports (3 viewports × 8 themes)', () => {
      const matrix = getThemeMatrix();
      expect(matrix).toHaveLength(24); // 3 viewports × 8 theme combinations
    });

    it('returns 8 combinations for single viewport', () => {
      const matrix = getThemeMatrix(['mobile']);
      expect(matrix).toHaveLength(8); // 1 viewport × 8 theme combinations
    });

    it('returns 32 combinations with small-mobile included', () => {
      const matrix = getThemeMatrix(['small-mobile', 'mobile', 'tablet', 'desktop']);
      expect(matrix).toHaveLength(32); // 4 viewports × 8 theme combinations
    });

    it('includes all viewport configs', () => {
      const matrix = getThemeMatrix();
      const viewportNames = matrix.map(m => m.viewport.name);
      expect(viewportNames).toContain('mobile');
      expect(viewportNames).toContain('tablet');
      expect(viewportNames).toContain('desktop');
    });

    it('includes all theme combinations for each viewport', () => {
      const matrix = getThemeMatrix(['mobile']);
      const themes = matrix.map(m => m.theme);
      expect(themes).toHaveLength(8);

      // Verify all 8 combinations are present
      const uniqueThemes = new Set(themes.map(t => JSON.stringify(t)));
      expect(uniqueThemes.size).toBe(8);
    });

    it('skips invalid viewport names with warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const matrix = getThemeMatrix(['invalid-viewport', 'mobile']);
      expect(matrix).toHaveLength(8); // Only mobile viewport included
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Viewport "invalid-viewport" not found'),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getThemeMatrixForViewport', () => {
    it('returns 8 combinations for mobile viewport', () => {
      const matrix = getThemeMatrixForViewport('mobile');
      expect(matrix).toHaveLength(8);
      expect(matrix.every(m => m.viewport.name === 'mobile')).toBe(true);
    });

    it('returns 8 combinations for tablet viewport', () => {
      const matrix = getThemeMatrixForViewport('tablet');
      expect(matrix).toHaveLength(8);
      expect(matrix.every(m => m.viewport.name === 'tablet')).toBe(true);
    });

    it('returns 8 combinations for desktop viewport', () => {
      const matrix = getThemeMatrixForViewport('desktop');
      expect(matrix).toHaveLength(8);
      expect(matrix.every(m => m.viewport.name === 'desktop')).toBe(true);
    });

    it('returns empty array for invalid viewport', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const matrix = getThemeMatrixForViewport('invalid');
      expect(matrix).toHaveLength(0);
      consoleSpy.mockRestore();
    });
  });
});

