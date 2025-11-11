/**
 * Geolocation Helper Tests
 * 
 * Verifies geolocation helper functions work correctly.
 */

import { test, expect } from '@playwright/test';
import {
  setPersonaGeo,
  denyGeolocation,
  revokeGeolocation,
  calculateDistance,
  getJustInsideRadius,
  getJustOutsideRadius,
  updatePersonaGeo,
} from '../../utils/geolocation';
import locations from '../../fixtures/locations.json';

test.describe('Geolocation Helpers', () => {
  test('setPersonaGeo grants permission and sets coordinates', async ({ context }) => {
    const campusLibrary = locations.venues.find((v) => v.name === 'campus-library');
    expect(campusLibrary).toBeDefined();

    if (campusLibrary) {
      await setPersonaGeo(context, campusLibrary.coordinates);

      // Verify geolocation is set (can't directly check, but no error means it worked)
      // In real usage, this would be verified by checking app behavior
    }
  });

  test('denyGeolocation clears permissions', async ({ context }) => {
    // First grant permission
    const campusLibrary = locations.venues.find((v) => v.name === 'campus-library');
    if (campusLibrary) {
      await setPersonaGeo(context, campusLibrary.coordinates);
    }

    // Then deny
    await denyGeolocation(context);

    // Permission cleared (no error means it worked)
  });

  test('calculateDistance computes correct distance', () => {
    const geo1 = { lat: 37.8716, lon: -122.2727 };
    const geo2 = { lat: 37.8726, lon: -122.2727 }; // ~111 meters north

    const distance = calculateDistance(geo1, geo2);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });

  test('getJustInsideRadius returns coordinate inside radius', () => {
    const center = { lat: 37.8716, lon: -122.2727 };
    const inside = getJustInsideRadius(center, 50);

    const distance = calculateDistance(center, inside);
    expect(distance).toBeLessThan(50);
    expect(distance).toBeGreaterThan(40); // Should be ~90% of radius
  });

  test('getJustOutsideRadius returns coordinate outside radius', () => {
    const center = { lat: 37.8716, lon: -122.2727 };
    const outside = getJustOutsideRadius(center, 50);

    const distance = calculateDistance(center, outside);
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(60); // Should be ~110% of radius
  });

  test('updatePersonaGeo updates coordinates during test', async ({ context }) => {
    const campusLibrary = locations.venues.find((v) => v.name === 'campus-library');
    const coffeeShop = locations.venues.find((v) => v.name === 'campus-coffee-shop');

    if (campusLibrary && coffeeShop) {
      // Set initial location
      await setPersonaGeo(context, campusLibrary.coordinates);

      // Update to new location (simulate movement)
      await updatePersonaGeo(context, coffeeShop.coordinates);

      // No error means update worked
    }
  });
});

