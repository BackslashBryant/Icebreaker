/**
 * Proximity Utilities
 * 
 * Distance calculation and proximity tier classification.
 * Uses Haversine formula for distance calculation on Earth's surface.
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {object} loc1 - { lat: number, lng: number }
 * @param {object} loc2 - { lat: number, lng: number }
 * @returns {number} Distance in meters
 */
export function calculateDistance(loc1, loc2) {
  if (!loc1 || !loc2) {
    return Infinity; // Cannot calculate distance without both locations
  }

  // Validate coordinate bounds
  if (
    typeof loc1.lat !== "number" ||
    typeof loc1.lng !== "number" ||
    typeof loc2.lat !== "number" ||
    typeof loc2.lng !== "number" ||
    !isFinite(loc1.lat) ||
    !isFinite(loc1.lng) ||
    !isFinite(loc2.lat) ||
    !isFinite(loc2.lng) ||
    loc1.lat < -90 ||
    loc1.lat > 90 ||
    loc1.lng < -180 ||
    loc1.lng > 180 ||
    loc2.lat < -90 ||
    loc2.lat > 90 ||
    loc2.lng < -180 ||
    loc2.lng > 180
  ) {
    return Infinity; // Invalid coordinates
  }

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
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Proximity tier thresholds (in meters)
 * - room: 0-10m (same room/very close)
 * - venue: 10-100m (same venue/area)
 * - nearby: 100-1000m (nearby area)
 * - far: >1000m (not nearby)
 */
const PROXIMITY_THRESHOLDS = {
  room: 10,
  venue: 100,
  nearby: 1000,
};

/**
 * Get proximity tier based on distance
 * @param {number} distanceMeters - Distance in meters
 * @returns {string} Proximity tier: 'room', 'venue', 'nearby', or 'far'
 */
export function getProximityTier(distanceMeters) {
  if (distanceMeters <= PROXIMITY_THRESHOLDS.room) {
    return "room";
  }
  if (distanceMeters <= PROXIMITY_THRESHOLDS.venue) {
    return "venue";
  }
  if (distanceMeters <= PROXIMITY_THRESHOLDS.nearby) {
    return "nearby";
  }
  return "far";
}

/**
 * Calculate proximity tier between two locations
 * @param {Object} location1 - { lat, lng }
 * @param {Object} location2 - { lat, lng }
 * @returns {string|null} Proximity tier or null if either location is missing
 */
export function calculateProximityTier(location1, location2) {
  if (!location1 || !location2 || !location1.lat || !location1.lng || !location2.lat || !location2.lng) {
    return null;
  }

  const distance = calculateDistance(location1, location2);
  
  if (!isFinite(distance)) {
    return null; // Invalid coordinates
  }

  return getProximityTier(distance);
}

/**
 * Get proximity tier score multiplier
 * Used in Signal Engine scoring
 * @param {string} tier - Proximity tier: 'room', 'venue', 'nearby', or 'far'
 * @returns {number} Score multiplier (higher = closer)
 */
export function getProximityScoreMultiplier(tier) {
  switch (tier) {
    case "room":
      return 3; // Highest bonus for same room
    case "venue":
      return 2; // Medium bonus for same venue
    case "nearby":
      return 1; // Lower bonus for nearby
    case "far":
    default:
      return 0; // No bonus for far away
  }
}

