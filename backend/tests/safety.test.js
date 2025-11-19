import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import { createSession } from "../src/services/SessionManager.js";
import { safetyRouter } from "../src/routes/safety.js";
import { createTestServer, closeTestServer } from "./utils/test-server.js";

/**
 * Safety Endpoints Test Suite
 * 
 * Tests for POST /api/safety/block and POST /api/safety/report endpoints.
 * Covers authentication, validation, and core functionality.
 */

const app = express();
app.use(express.json());
app.use("/api/safety", safetyRouter);

let testServer;
let testPort;
let baseUrl;

describe("Safety Endpoints", () => {
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

  describe("POST /api/safety/block", () => {
    it("requires Authorization header with session token", async () => {
      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetSessionId: "target-123" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
      expect(data.error.message).toContain("Missing authorization token");
    });

    it("rejects invalid token", async () => {
      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify({ targetSessionId: "target-123" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
      // Accept either generic or specific error messages
      expect(["Invalid or expired token", "Invalid token format", "Invalid token signature", "Token expired", "Session not found"]).toContain(data.error.message);
    });

    it("rejects missing targetSessionId", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("targetSessionId is required");
    });

    it("rejects non-string targetSessionId", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetSessionId: 123 }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("targetSessionId must be a string");
    });

    it("blocks a user successfully", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({ targetSessionId: target.sessionId }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("rejects blocking yourself", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({ targetSessionId: requester.sessionId }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("BLOCK_FAILED");
      expect(data.error.message).toContain("Cannot block yourself");
    });

    it("rejects blocking non-existent user", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({ targetSessionId: "non-existent-session" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("BLOCK_FAILED");
      expect(data.error.message).toContain("Target session not found");
    });

    it("rejects blocking already blocked user", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // First block
      const firstResponse = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({ targetSessionId: target.sessionId }),
      });
      expect(firstResponse.status).toBe(200);

      // Second block (should fail)
      const secondResponse = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({ targetSessionId: target.sessionId }),
      });

      expect(secondResponse.status).toBe(400);
      const data = await secondResponse.json();
      expect(data.error.code).toBe("BLOCK_FAILED");
      expect(data.error.message).toContain("already blocked");
    });

    it("accepts token without Bearer prefix", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: requester.token, // No "Bearer " prefix
        },
        body: JSON.stringify({ targetSessionId: target.sessionId }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/safety/report", () => {
    it("requires Authorization header with session token", async () => {
      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetSessionId: "target-123",
          category: "harassment",
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
      expect(data.error.message).toContain("Missing authorization token");
    });

    it("rejects invalid token", async () => {
      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify({
          targetSessionId: "target-123",
          category: "harassment",
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("UNAUTHORIZED");
      // Accept either generic or specific error messages
      expect(["Invalid or expired token", "Invalid token format", "Invalid token signature", "Token expired", "Session not found"]).toContain(data.error.message);
    });

    it("rejects missing targetSessionId", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: "harassment" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("targetSessionId is required");
    });

    it("rejects missing category", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetSessionId: "target-123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("category is required");
    });

    it("rejects invalid category", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetSessionId: "target-123",
          category: "invalid-category",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("category must be one of");
    });

    it("rejects non-string targetSessionId", async () => {
      const { token } = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetSessionId: 123,
          category: "harassment",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("targetSessionId must be a string");
    });

    it("reports a user successfully with valid category", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const categories = ["harassment", "spam", "impersonation", "other"];

      for (const category of categories) {
        // Create fresh sessions for each category test
        const req = createSession({
          vibe: "banter",
          tags: [],
          visibility: true,
        });
        const tgt = createSession({
          vibe: "deep",
          tags: [],
          visibility: true,
        });

        const response = await fetch(`${baseUrl}/api/safety/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${req.token}`,
          },
          body: JSON.stringify({
            targetSessionId: tgt.sessionId,
            category,
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    it("rejects reporting yourself", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({
          targetSessionId: requester.sessionId,
          category: "harassment",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("REPORT_FAILED");
      expect(data.error.message).toContain("Cannot report yourself");
    });

    it("rejects reporting non-existent user", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const response = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({
          targetSessionId: "non-existent-session",
          category: "harassment",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("REPORT_FAILED");
      expect(data.error.message).toContain("Target session not found");
    });

    it("rejects duplicate report from same reporter", async () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // First report
      const firstResponse = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({
          targetSessionId: target.sessionId,
          category: "harassment",
        }),
      });
      expect(firstResponse.status).toBe(200);

      // Second report (should fail)
      const secondResponse = await fetch(`${baseUrl}/api/safety/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requester.token}`,
        },
        body: JSON.stringify({
          targetSessionId: target.sessionId,
          category: "spam",
        }),
      });

      expect(secondResponse.status).toBe(400);
      const data = await secondResponse.json();
      expect(data.error.code).toBe("REPORT_FAILED");
      expect(data.error.message).toContain("Already reported");
    });
  });
});

