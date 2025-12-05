/**
 * Tests for Persona Presence Fixture Loader
 * 
 * Verifies loader helper functions work correctly with all fixture files.
 */

import { test, expect } from '@playwright/test';
import { loadFixture, getAvailableVenues, hasFixture } from './loader';
import type { PersonaPresenceScript } from './schema';

test.describe('Persona Presence Fixture Loader', () => {
  test('getAvailableVenues() returns all fixture venues', () => {
    const venues = getAvailableVenues();
    
    expect(venues).toContain('campus-library');
    expect(venues).toContain('coworking-downtown');
    expect(venues).toContain('gallery-opening');
    expect(venues).toContain('chat-performance-test');
    expect(venues.length).toBe(4);
  });

  test('hasFixture() returns true for existing venues', () => {
    expect(hasFixture('campus-library')).toBe(true);
    expect(hasFixture('coworking-downtown')).toBe(true);
    expect(hasFixture('gallery-opening')).toBe(true);
    expect(hasFixture('chat-performance-test')).toBe(true);
  });

  test('hasFixture() returns false for non-existent venues', () => {
    expect(hasFixture('non-existent-venue')).toBe(false);
    expect(hasFixture('')).toBe(false);
  });

  test('loadFixture() loads campus-library fixture correctly', () => {
    const script = loadFixture('campus-library');
    
    expect(script.venue).toBe('campus-library');
    expect(script.personas).toBeDefined();
    expect(script.personas.length).toBeGreaterThan(0);
    expect(script.personas[0].sessionId).toBe('maya-session');
    expect(script.personas[0].handle).toBe('QuietThinker42');
  });

  test('loadFixture() loads coworking-downtown fixture correctly', () => {
    const script = loadFixture('coworking-downtown');
    
    expect(script.venue).toBe('coworking-downtown');
    expect(script.personas).toBeDefined();
    expect(script.personas.length).toBeGreaterThan(0);
    expect(script.personas[0].sessionId).toBe('marcus-session');
  });

  test('loadFixture() loads gallery-opening fixture correctly', () => {
    const script = loadFixture('gallery-opening');
    
    expect(script.venue).toBe('gallery-opening');
    expect(script.personas).toBeDefined();
    expect(script.personas.length).toBeGreaterThan(0);
    expect(script.personas[0].sessionId).toBe('casey-session');
  });

  test('loadFixture() loads chat-performance-test fixture correctly', () => {
    const script = loadFixture('chat-performance-test');
    
    expect(script.venue).toBe('chat-performance-test');
    expect(script.personas).toBeDefined();
    expect(script.personas.length).toBeGreaterThan(0);
    expect(script.personas[0].sessionId).toBe('requester-session');
  });

  test('loadFixture() returns correct TypeScript type', () => {
    const script = loadFixture('campus-library');
    
    // Type check: script should be PersonaPresenceScript
    const typedScript: PersonaPresenceScript = script;
    expect(typedScript.venue).toBe('campus-library');
    expect(typedScript.personas).toBeDefined();
  });

  test('loadFixture() throws error for non-existent venue', () => {
    expect(() => {
      loadFixture('non-existent-venue');
    }).toThrow(/Fixture not found for venue "non-existent-venue"/);
  });

  test('loadFixture() error message includes available venues', () => {
    try {
      loadFixture('invalid-venue');
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain('Available venues:');
      expect(error.message).toContain('campus-library');
      expect(error.message).toContain('coworking-downtown');
    }
  });

  test('all fixtures have valid schema structure', () => {
    const venues = getAvailableVenues();
    
    for (const venue of venues) {
      const script = loadFixture(venue);
      
      // Verify schema structure
      expect(script).toHaveProperty('venue');
      expect(script).toHaveProperty('personas');
      expect(Array.isArray(script.personas)).toBe(true);
      
      // Verify each persona has required fields
      for (const persona of script.personas) {
        expect(persona).toHaveProperty('sessionId');
        expect(persona).toHaveProperty('handle');
        expect(persona).toHaveProperty('vibe');
        expect(persona).toHaveProperty('tags');
        expect(Array.isArray(persona.tags)).toBe(true);
      }
    }
  });
});

