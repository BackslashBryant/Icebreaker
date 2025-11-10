/**
 * Location Utilities
 * 
 * Helpers for location handling, privacy, and approximation.
 */

/**
 * Approximate location by rounding coordinates
 * Reduces precision for privacy (approximately 100m accuracy)
 * @param location - Exact location coordinates
 * @returns Approximated location with reduced precision
 */
export function approximateLocation(location: { lat: number; lng: number }): {
  lat: number;
  lng: number;
} {
  // Round to ~3 decimal places (~100m precision)
  // This provides approximate location without being too precise
  return {
    lat: Math.round(location.lat * 1000) / 1000,
    lng: Math.round(location.lng * 1000) / 1000,
  };
}

/**
 * Check if location has changed significantly
 * Used to determine if we should send a location update
 * @param oldLocation - Previous location
 * @param newLocation - New location
 * @param thresholdMeters - Minimum distance change in meters (default: 50m)
 * @returns true if location changed significantly
 */
export function hasLocationChanged(
  oldLocation: { lat: number; lng: number } | null,
  newLocation: { lat: number; lng: number },
  thresholdMeters: number = 50
): boolean {
  if (!oldLocation) {
    return true; // First location is always considered changed
  }

  const distance = calculateDistance(oldLocation, newLocation);
  return distance >= thresholdMeters;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param loc1 - First location
 * @param loc2 - Second location
 * @returns Distance in meters
 */
function calculateDistance(
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(loc2.lat - loc1.lat);
  const dLng = toRadians(loc2.lng - loc1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.lat)) *
      Math.cos(toRadians(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

