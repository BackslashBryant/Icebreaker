import { describe, it, expect } from "vitest";
import {
  approximateLocation,
  hasLocationChanged,
} from "@/lib/location-utils";

describe("location-utils", () => {
  describe("approximateLocation", () => {
    it("rounds coordinates to ~3 decimal places", () => {
      const exact = { lat: 37.7749123, lng: -122.4194567 };
      const approximated = approximateLocation(exact);

      expect(approximated.lat).toBe(37.775);
      expect(approximated.lng).toBe(-122.419);
    });

    it("maintains coordinate structure", () => {
      const exact = { lat: 40.7128, lng: -74.006 };
      const approximated = approximateLocation(exact);

      expect(approximated).toHaveProperty("lat");
      expect(approximated).toHaveProperty("lng");
      expect(typeof approximated.lat).toBe("number");
      expect(typeof approximated.lng).toBe("number");
    });
  });

  describe("hasLocationChanged", () => {
    it("returns true for first location (null previous)", () => {
      const newLocation = { lat: 37.7749, lng: -122.4194 };
      expect(hasLocationChanged(null, newLocation)).toBe(true);
    });

    it("returns false for same location", () => {
      const location = { lat: 37.7749, lng: -122.4194 };
      expect(hasLocationChanged(location, location)).toBe(false);
    });

    it("returns false for small changes within threshold", () => {
      const oldLocation = { lat: 37.7749, lng: -122.4194 };
      // ~10 meters away (within 50m threshold)
      const newLocation = { lat: 37.775, lng: -122.4194 };
      expect(hasLocationChanged(oldLocation, newLocation, 50)).toBe(false);
    });

    it("returns true for changes exceeding threshold", () => {
      const oldLocation = { lat: 37.7749, lng: -122.4194 };
      // ~100 meters away (exceeds 50m threshold)
      const newLocation = { lat: 37.7758, lng: -122.4194 };
      expect(hasLocationChanged(oldLocation, newLocation, 50)).toBe(true);
    });

    it("uses custom threshold", () => {
      const oldLocation = { lat: 37.7749, lng: -122.4194 };
      const newLocation = { lat: 37.775, lng: -122.4194 };
      // Should be false with 50m threshold, true with 5m threshold
      expect(hasLocationChanged(oldLocation, newLocation, 5)).toBe(true);
    });
  });
});

