import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import { createSession, getSession, updateSessionVisibility, updateEmergencyContact } from "../src/services/SessionManager.js";
import profileRouter from "../src/routes/profile.js";
import { createTestServer, closeTestServer } from "./utils/test-server.js";

/**
 * Profile API Endpoints Test Suite
 * 
 * Tests for PUT /api/profile/visibility and PUT /api/profile/emergency-contact endpoints.
 * Covers authentication, validation, and core functionality.
 */

const app = express();
app.use(express.json());
app.use("/api/profile", profileRouter);

let testServer;
let testPort;
let baseUrl;

describe("Profile API Endpoints", () => {
  beforeAll(async () => {
    const result = await createTestServer(app);
    testServer = result.server;
    testPort = result.port;
    baseUrl = result.url;
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  beforeEach(() => {
    // Sessions are in-memory and will be cleared between test runs
    // No explicit cleanup needed as each test creates fresh sessions
  });

  describe("PUT /api/profile/visibility", () => {
    it("should require authorization token", async () => {
      const response = await fetch(`${baseUrl}/api/profile/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility: false }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should require visibility field", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("visibility is required");
    });

    it("should validate visibility is boolean", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibility: "true" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("visibility must be a boolean");
    });

    it("should update visibility to false", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.visibility).toBe(true);

      const response = await fetch(`${baseUrl}/api/profile/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibility: false }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.visibility).toBe(false);

      // Verify session was updated
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.visibility).toBe(false);
    });

    it("should update visibility to true", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: false,
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.visibility).toBe(false);

      const response = await fetch(`${baseUrl}/api/profile/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibility: true }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.visibility).toBe(true);

      // Verify session was updated
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.visibility).toBe(true);
    });
  });

  describe("PUT /api/profile/emergency-contact", () => {
    it("should require authorization token", async () => {
      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emergencyContact: "+1234567890" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should validate emergencyContact is string when provided", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: 123 }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("emergencyContact must be a string");
    });

    it("should accept valid phone number (E.164 format)", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "+1234567890" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.emergencyContact).toBe("+1234567890");

      // Verify session was updated
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe("+1234567890");
    });

    it("should accept valid email address", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "test@example.com" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.emergencyContact).toBe("test@example.com");

      // Verify session was updated
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe("test@example.com");
    });

    it("should reject invalid phone number format", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "1234567890" }), // Missing +
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("valid phone number");
    });

    it("should reject invalid email format", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "invalid-email" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("valid");
    });

    it("should clear emergency contact when set to null", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        emergencyContact: "+1234567890",
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.emergencyContact).toBe("+1234567890");

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: null }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.emergencyContact).toBe(null);

      // Verify session was updated
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe(null);
    });

    it("should trim whitespace from emergency contact", async () => {
      const { token, sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "  +1234567890  " }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.emergencyContact).toBe("+1234567890");

      // Verify session was updated with trimmed value
      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe("+1234567890");
    });

    it("should handle empty string as invalid", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/profile/emergency-contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyContact: "" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Session Manager Functions", () => {
    it("updateSessionVisibility should update visibility", () => {
      const { sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.visibility).toBe(true);

      const success = updateSessionVisibility(sessionId, false);
      expect(success).toBe(true);

      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.visibility).toBe(false);
    });

    it("updateSessionVisibility should return false for invalid session", () => {
      const success = updateSessionVisibility("invalid-session-id", true);
      expect(success).toBe(false);
    });

    it("updateEmergencyContact should update emergency contact", () => {
      const { sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.emergencyContact).toBe(null);

      const success = updateEmergencyContact(sessionId, "+1234567890");
      expect(success).toBe(true);

      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe("+1234567890");
    });

    it("updateEmergencyContact should clear emergency contact when set to null", () => {
      const { sessionId } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        emergencyContact: "+1234567890",
      });

      const sessionBefore = getSession(sessionId);
      expect(sessionBefore.emergencyContact).toBe("+1234567890");

      const success = updateEmergencyContact(sessionId, null);
      expect(success).toBe(true);

      const sessionAfter = getSession(sessionId);
      expect(sessionAfter.emergencyContact).toBe(null);
    });

    it("updateEmergencyContact should return false for invalid session", () => {
      const success = updateEmergencyContact("invalid-session-id", "+1234567890");
      expect(success).toBe(false);
    });

    it("createSession should include emergencyContact field", () => {
      const { sessionId } = createSession({
        vibe: "banter",
        tags: ["tech"],
        visibility: true,
        emergencyContact: "+1234567890",
      });

      const session = getSession(sessionId);
      expect(session.emergencyContact).toBe("+1234567890");
    });

    it("createSession should set emergencyContact to null if not provided", () => {
      const { sessionId } = createSession({
        vibe: "banter",
        tags: ["tech"],
        visibility: true,
      });

      const session = getSession(sessionId);
      expect(session.emergencyContact).toBe(null);
    });
  });
});

