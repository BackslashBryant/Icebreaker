import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/index.js";
import { createTestServer, closeTestServer } from "./utils/test-server.js";

let server;
let port;
let baseUrl;

beforeAll(async () => {
  const result = await createTestServer(app);
  server = result.server;
  port = result.port;
  baseUrl = result.url;
});

afterAll(async () => {
  await closeTestServer(server);
});

describe("POST /api/onboarding", () => {
  it("creates session with valid data", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "banter",
        tags: ["Quietly Curious"],
        visibility: true,
      }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("sessionId");
    expect(body).toHaveProperty("token");
    expect(body).toHaveProperty("handle");
    expect(typeof body.sessionId).toBe("string");
    expect(typeof body.token).toBe("string");
    expect(typeof body.handle).toBe("string");
  });

  it("creates session with location", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("sessionId");
    expect(body).toHaveProperty("token");
  });

  it("returns 400 if vibe is missing", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [],
        visibility: true,
      }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 if vibe is invalid", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "invalid-vibe",
        tags: [],
        visibility: true,
      }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 if visibility is not boolean", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "banter",
        tags: [],
        visibility: "true",
      }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 if location is invalid", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: "invalid" },
      }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("accepts empty tags array", async () => {
    const response = await fetch(`${baseUrl}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vibe: "surprise",
        tags: [],
        visibility: false,
      }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("sessionId");
  });
});
