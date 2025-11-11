/**
 * Geolocation Helpers for Playwright E2E Tests
 * 
 * Provides utilities for setting geolocation permissions and coordinates
 * per persona and scenario.
 */

import { BrowserContext } from '@playwright/test';

export interface GeoCoordinates {
  lat: number;
  lon: number;
  floor?: number;
}

export interface VenueLocation {
  name: string;
  coordinates: GeoCoordinates;
  description?: string;
}

/**
 * Set geolocation for a persona's browser context
 * 
 * Grants geolocation permission and sets coordinates.
 * Supports floor numbers for multi-floor buildings.
 * 
 * @param context - Playwright browser context
 * @param geo - Geolocation coordinates (lat, lon, optional floor)
 */
export async function setPersonaGeo(
  context: BrowserContext,
  geo: GeoCoordinates,
): Promise<void> {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({
    latitude: geo.lat,
    longitude: geo.lon,
  });
}

/**
 * Deny geolocation permission for a persona's browser context
 * 
 * Simulates user denying location access.
 * 
 * @param context - Playwright browser context
 */
export async function denyGeolocation(context: BrowserContext): Promise<void> {
  await context.clearPermissions();
}

/**
 * Revoke geolocation permission (simulate user revoking after granting)
 * 
 * @param context - Playwright browser context
 */
export async function revokeGeolocation(context: BrowserContext): Promise<void> {
  await context.clearPermissions();
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 * 
 * @param geo1 - First coordinate
 * @param geo2 - Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(geo1: GeoCoordinates, geo2: GeoCoordinates): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (geo1.lat * Math.PI) / 180;
  const φ2 = (geo2.lat * Math.PI) / 180;
  const Δφ = ((geo2.lat - geo1.lat) * Math.PI) / 180;
  const Δλ = ((geo2.lon - geo1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Generate coordinates just inside proximity radius
 * 
 * Useful for boundary testing - ensures persona is within detection range.
 * 
 * @param center - Center coordinate
 * @param radiusMeters - Proximity radius in meters (default: 50m)
 * @returns Coordinate just inside the radius
 */
export function getJustInsideRadius(
  center: GeoCoordinates,
  radiusMeters: number = 50,
): GeoCoordinates {
  // Move slightly inside radius (90% of radius)
  const offset = (radiusMeters * 0.9) / 111000; // ~111km per degree latitude
  return {
    lat: center.lat + offset,
    lon: center.lon,
    floor: center.floor,
  };
}

/**
 * Generate coordinates just outside proximity radius
 * 
 * Useful for boundary testing - ensures persona is outside detection range.
 * 
 * @param center - Center coordinate
 * @param radiusMeters - Proximity radius in meters (default: 50m)
 * @returns Coordinate just outside the radius
 */
export function getJustOutsideRadius(
  center: GeoCoordinates,
  radiusMeters: number = 50,
): GeoCoordinates {
  // Move slightly outside radius (110% of radius)
  const offset = (radiusMeters * 1.1) / 111000; // ~111km per degree latitude
  return {
    lat: center.lat + offset,
    lon: center.lon,
    floor: center.floor,
  };
}

/**
 * Update geolocation during test (simulate movement)
 * 
 * Useful for testing venue entry/exit or floor changes.
 * 
 * @param context - Playwright browser context
 * @param geo - New geolocation coordinates
 */
export async function updatePersonaGeo(
  context: BrowserContext,
  geo: GeoCoordinates,
): Promise<void> {
  await context.setGeolocation({
    latitude: geo.lat,
    longitude: geo.lon,
  });
}

