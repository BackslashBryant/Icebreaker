import { describe, it, expect } from "vitest";
import { COOLDOWN_CONFIG, getCooldownConfig } from "../src/config/cooldown-config.js";

describe("CooldownConfig", () => {
  describe("COOLDOWN_CONFIG", () => {
    it("has DECLINE_THRESHOLD set to 3", () => {
      expect(COOLDOWN_CONFIG.DECLINE_THRESHOLD).toBe(3);
    });

    it("has DECLINE_WINDOW_MS set to 10 minutes", () => {
      expect(COOLDOWN_CONFIG.DECLINE_WINDOW_MS).toBe(10 * 60 * 1000);
    });

    it("has COOLDOWN_DURATION_MS set to 30 minutes", () => {
      expect(COOLDOWN_CONFIG.COOLDOWN_DURATION_MS).toBe(30 * 60 * 1000);
    });

    it("has W_DECLINE set to -5", () => {
      expect(COOLDOWN_CONFIG.W_DECLINE).toBe(-5);
    });

    it("has MAX_DECLINE_PENALTY set to -15", () => {
      expect(COOLDOWN_CONFIG.MAX_DECLINE_PENALTY).toBe(-15);
    });
  });

  describe("getCooldownConfig", () => {
    it("returns default config when no env vars set", () => {
      const config = getCooldownConfig();
      expect(config.DECLINE_THRESHOLD).toBe(3);
      expect(config.DECLINE_WINDOW_MS).toBe(10 * 60 * 1000);
      expect(config.COOLDOWN_DURATION_MS).toBe(30 * 60 * 1000);
      expect(config.W_DECLINE).toBe(-5);
      expect(config.MAX_DECLINE_PENALTY).toBe(-15);
    });

    it("returns config with all required properties", () => {
      const config = getCooldownConfig();
      expect(config).toHaveProperty("DECLINE_THRESHOLD");
      expect(config).toHaveProperty("DECLINE_WINDOW_MS");
      expect(config).toHaveProperty("COOLDOWN_DURATION_MS");
      expect(config).toHaveProperty("W_DECLINE");
      expect(config).toHaveProperty("MAX_DECLINE_PENALTY");
    });
  });
});

