import { describe, it, expect } from "vitest";
import {
  calculateDistance,
  getProximityTier,
  calculateProximityTier,
  getProximityScoreMultiplier,
} from "../src/lib/proximity-utils.js";

describe("proximity-utils", () => {
  describe("calculateDistance", () => {
    it("calculates distance between two points", () => {
      // San Francisco to Oakland (approximately 10km)
      const loc1 = { lat: 37.7749, lng: -122.4194 };
      const loc2 = { lat: 37.8044, lng: -122.2711 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBeGreaterThan(10000);
      expect(distance).toBeLessThan(15000);
    });

    it("calculates zero distance for same point", () => {
      const loc = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc, loc);
      expect(distance).toBeCloseTo(0, 1);
    });

    it("calculates small distance accurately", () => {
      // ~100 meters apart
      const loc1 = { lat: 37.7749, lng: -122.4194 };
      const loc2 = { lat: 37.7758, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    it("returns Infinity for invalid coordinates", () => {
      const loc1 = { lat: 91, lng: 0 }; // Invalid lat
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("returns Infinity for missing locations", () => {
      const loc = { lat: 37.7749, lng: -122.4194 };
      expect(calculateDistance(null, loc)).toBe(Infinity);
      expect(calculateDistance(loc, null)).toBe(Infinity);
      expect(calculateDistance(null, null)).toBe(Infinity);
    });
  });

  describe("getProximityTier", () => {
    it("returns 'room' for 0-10m", () => {
      expect(getProximityTier(0)).toBe("room");
      expect(getProximityTier(5)).toBe("room");
      expect(getProximityTier(10)).toBe("room");
    });

    it("returns 'venue' for 10-100m", () => {
      expect(getProximityTier(11)).toBe("venue");
      expect(getProximityTier(50)).toBe("venue");
      expect(getProximityTier(100)).toBe("venue");
    });

    it("returns 'nearby' for 100-1000m", () => {
      expect(getProximityTier(101)).toBe("nearby");
      expect(getProximityTier(500)).toBe("nearby");
      expect(getProximityTier(1000)).toBe("nearby");
    });

    it("returns 'far' for >1000m", () => {
      expect(getProximityTier(1001)).toBe("far");
      expect(getProximityTier(5000)).toBe("far");
    });
  });

  describe("calculateProximityTier", () => {
    it("calculates proximity tier between two locations", () => {
      const location1 = { lat: 37.7749, lng: -122.4194 };
      const location2 = { lat: 37.775, lng: -122.4195 }; // ~100m away

      const tier = calculateProximityTier(location1, location2);
      expect(["room", "venue", "nearby"]).toContain(tier);
    });

    it("returns null for missing location", () => {
      expect(calculateProximityTier(null, { lat: 37.7749, lng: -122.4194 })).toBeNull();
      expect(calculateProximityTier({ lat: 37.7749, lng: -122.4194 }, null)).toBeNull();
      expect(calculateProximityTier(null, null)).toBeNull();
    });

    it("returns null for incomplete location data", () => {
      expect(calculateProximityTier({ lat: 37.7749 }, { lat: 37.775, lng: -122.4195 })).toBeNull();
      expect(calculateProximityTier({ lat: 37.7749, lng: -122.4194 }, { lat: 37.775 })).toBeNull();
    });
  });

  describe("getProximityScoreMultiplier", () => {
    it("returns correct multipliers for each tier", () => {
      expect(getProximityScoreMultiplier("room")).toBe(3);
      expect(getProximityScoreMultiplier("venue")).toBe(2);
      expect(getProximityScoreMultiplier("nearby")).toBe(1);
      expect(getProximityScoreMultiplier("far")).toBe(0);
      expect(getProximityScoreMultiplier("unknown")).toBe(0);
    });
  });
});

