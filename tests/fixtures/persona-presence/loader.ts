/**
 * Persona Presence Fixture Loader
 * 
 * Provides centralized access to persona presence fixtures for tests and WebSocket mocks.
 * Maintains backward compatibility - direct imports still work.
 */

import type { PersonaPresenceScript } from './schema';

// Import all fixture files
import campusLibraryScript from './campus-library.json';
import coworkingDowntownScript from './coworking-downtown.json';
import galleryOpeningScript from './gallery-opening.json';
import chatPerformanceScript from './chat-performance.json';

// Map of venue names to fixture scripts
const fixtureMap: Record<string, PersonaPresenceScript> = {
  'campus-library': campusLibraryScript as PersonaPresenceScript,
  'coworking-downtown': coworkingDowntownScript as PersonaPresenceScript,
  'gallery-opening': galleryOpeningScript as PersonaPresenceScript,
  'chat-performance-test': chatPerformanceScript as PersonaPresenceScript,
};

/**
 * Load a persona presence fixture by venue name
 * 
 * @param venue - The venue name (e.g., 'campus-library', 'coworking-downtown')
 * @returns The persona presence script for the venue
 * @throws Error if venue not found
 * 
 * @example
 * ```ts
 * const script = loadFixture('campus-library');
 * expect(script.venue).toBe('campus-library');
 * ```
 */
export function loadFixture(venue: string): PersonaPresenceScript {
  const script = fixtureMap[venue];
  if (!script) {
    const available = getAvailableVenues().join(', ');
    throw new Error(
      `Fixture not found for venue "${venue}". Available venues: ${available}`
    );
  }
  return script;
}

/**
 * Get list of available venue names
 * 
 * @returns Array of venue names that have fixtures
 * 
 * @example
 * ```ts
 * const venues = getAvailableVenues();
 * expect(venues).toContain('campus-library');
 * ```
 */
export function getAvailableVenues(): string[] {
  return Object.keys(fixtureMap);
}

/**
 * Check if a venue has a fixture available
 * 
 * @param venue - The venue name to check
 * @returns True if fixture exists for the venue
 * 
 * @example
 * ```ts
 * if (hasFixture('campus-library')) {
 *   const script = loadFixture('campus-library');
 * }
 * ```
 */
export function hasFixture(venue: string): boolean {
  return venue in fixtureMap;
}

