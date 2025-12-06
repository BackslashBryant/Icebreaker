import { describe, it, expect } from "vitest";
import {
  loadFixture,
  getAvailableVenues,
  hasFixture,
} from "../../tests/fixtures/persona-presence/loader";

describe("Persona Presence Loader (backend)", () => {
  it("loads valid fixture by venue name", () => {
    const script = loadFixture("campus-library");
    expect(script.venue).toBe("campus-library");
    expect(script.personas.length).toBeGreaterThan(0);
  });

  it("throws for invalid venue", () => {
    expect(() => loadFixture("invalid-venue")).toThrow(/Fixture not found/);
  });

  it("returns all available venues", () => {
    const venues = getAvailableVenues();
    expect(venues).toEqual(
      expect.arrayContaining([
        "campus-library",
        "coworking-downtown",
        "gallery-opening",
        "chat-performance-test",
      ])
    );
  });

  it("hasFixture identifies existing venues", () => {
    expect(hasFixture("campus-library")).toBe(true);
    expect(hasFixture("missing-venue")).toBe(false);
  });

  it("fixtures conform to PersonaPresenceScript shape", () => {
    const venues = getAvailableVenues();
    for (const venue of venues) {
      const script = loadFixture(venue);
      expect(script).toHaveProperty("venue");
      expect(typeof script.venue).toBe("string");
      expect(Array.isArray(script.personas)).toBe(true);
      script.personas.forEach((persona) => {
        expect(typeof persona.sessionId).toBe("string");
        expect(typeof persona.handle).toBe("string");
        expect(typeof persona.vibe).toBe("string");
        expect(Array.isArray(persona.tags)).toBe(true);
      });
    }
  });
});

