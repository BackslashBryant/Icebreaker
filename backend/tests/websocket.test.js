import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { WebSocket } from "ws";
import { createSession } from "../src/services/SessionManager.js";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { initializeWebSocketServer } from "../src/websocket/server.js";
import { createWebSocketTestServer, closeTestServer } from "./utils/test-server.js";

// Create minimal Express app for WebSocket testing
const app = express();
app.use(cors());
app.use(express.json());

let testServer;
let testPort;
let wsUrl;

describe("WebSocket Server", () => {
  beforeAll(async () => {
    const httpServer = createServer(app);
    initializeWebSocketServer(httpServer);
    const result = await createWebSocketTestServer(httpServer);
    testServer = result.server;
    testPort = result.port;
    wsUrl = result.wsUrl;
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  describe("Connection", () => {
    it("rejects connection without token", async () => {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws`);

        ws.on("close", (code, reason) => {
          expect(code).toBe(1008);
          expect(reason.toString()).toContain("Missing token");
          resolve();
        });

        ws.on("error", (error) => {
          // Connection will close, ignore error unless it prevents close
          if (ws.readyState === WebSocket.CLOSED) {
            resolve();
          } else {
            reject(error);
          }
        });
      });
    });

    it("rejects connection with invalid token", async () => {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws?token=invalid-token`);

        ws.on("close", (code, reason) => {
          expect(code).toBe(1008);
          expect(reason.toString()).toContain("Invalid token");
          resolve();
        });

        ws.on("error", (error) => {
          // Connection will close, ignore error unless it prevents close
          if (ws.readyState === WebSocket.CLOSED) {
            resolve();
          } else {
            reject(error);
          }
        });
      });
    });

    it("accepts connection with valid token", async () => {
      const sessionData = {
        vibe: "banter",
        tags: ["tag1"],
        visibility: true,
      };

      const { token } = createSession(sessionData);
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

        ws.on("open", () => {
          ws.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === "connected") {
              expect(message.payload).toHaveProperty("sessionId");
              expect(message.payload).toHaveProperty("handle");
              ws.close();
              resolve();
            }
          });
        });

        ws.on("error", (error) => {
          reject(error);
        });
      });
    });
  });

  describe("Message Handling", () => {
    let ws;
    let token;

    beforeEach(async () => {
      const sessionData = {
        vibe: "banter",
        tags: ["tag1"],
        visibility: true,
      };

      const session = createSession(sessionData);
      token = session.token;

      await new Promise((resolve, reject) => {
        ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

        ws.on("open", () => {
          resolve();
        });

        ws.on("error", (error) => {
          reject(error);
        });
      });
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    it("handles radar:subscribe message", async () => {
      await new Promise((resolve, reject) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "radar:update") {
            expect(message.payload).toHaveProperty("people");
            expect(message.payload).toHaveProperty("timestamp");
            expect(Array.isArray(message.payload.people)).toBe(true);
            ws.close();
            resolve();
          }
        });

        ws.send(
          JSON.stringify({
            type: "radar:subscribe",
          })
        );
      });
    });

    it("handles location:update message", async () => {
      let updateCount = 0;

      await new Promise((resolve, reject) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "radar:update") {
            updateCount++;
            if (updateCount === 2) {
              // Should receive update after location change
              expect(message.payload).toHaveProperty("people");
              ws.close();
              resolve();
            }
          }
        });

        // Subscribe first
        ws.send(
          JSON.stringify({
            type: "radar:subscribe",
          })
        );

        // Then update location
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              type: "location:update",
              payload: {
                lat: 37.7749,
                lng: -122.4194,
              },
            })
          );
        }, 100);
      });
    });

    it("handles chat:request message", async () => {
      await new Promise((resolve, reject) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "chat:request:ack") {
            expect(message.payload).toHaveProperty("targetSessionId");
            expect(message.payload).toHaveProperty("status");
            ws.close();
            resolve();
          }
        });

        ws.send(
          JSON.stringify({
            type: "chat:request",
            payload: {
              targetSessionId: "test-session-id",
            },
          })
        );
      });
    });

    it("sends error for invalid message", async () => {
      await new Promise((resolve, reject) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "error") {
            expect(message.payload).toHaveProperty("message");
            ws.close();
            resolve();
          }
        });

        ws.send(
          JSON.stringify({
            type: "unknown:message",
          })
        );
      });
    });

    it("sends error for invalid message format", async () => {
      await new Promise((resolve, reject) => {
        ws.on("message", (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "error") {
            expect(message.payload.message).toBe("Invalid message format");
            ws.close();
            resolve();
          }
        });

        ws.send("invalid json");
      });
    });
  });

  describe("Heartbeat", () => {
    it("responds to ping with pong", async () => {
      const sessionData = {
        vibe: "banter",
        tags: ["tag1"],
        visibility: true,
      };

      const { token } = createSession(sessionData);
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

        ws.on("open", () => {
          ws.isAlive = true;
          ws.on("pong", () => {
            expect(ws.isAlive).toBe(true);
            ws.close();
            resolve();
          });

          // Send ping
          ws.ping();
        });

        ws.on("error", (error) => {
          reject(error);
        });
      });
    });
  });

  describe("Radar Updates", () => {
    it("sends sorted radar results with Signal Engine scores", async () => {
      const sessionData1 = {
        vibe: "banter",
        tags: ["tag1", "tag2"],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      };

      const sessionData2 = {
        vibe: "intros",
        tags: ["tag1"],
        visibility: true,
        location: { lat: 37.775, lng: -122.4195 },
      };

      // Create two sessions
      const session1 = createSession(sessionData1);
      const session2 = createSession(sessionData2);

      // Connect with session1
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws?token=${session1.token}`);

        ws.on("open", () => {
          ws.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === "radar:update") {
              const { people } = message.payload;
              
              // Should have at least one person (session2)
              expect(people.length).toBeGreaterThan(0);
              
              // Should be sorted by score (descending)
              for (let i = 0; i < people.length - 1; i++) {
                expect(people[i].signal).toBeGreaterThanOrEqual(people[i + 1].signal);
              }
              
              // Each person should have required fields
              people.forEach((person) => {
                expect(person).toHaveProperty("sessionId");
                expect(person).toHaveProperty("handle");
                expect(person).toHaveProperty("vibe");
                expect(person).toHaveProperty("tags");
                expect(person).toHaveProperty("signal");
                expect(typeof person.signal).toBe("number");
              });

              ws.close();
              resolve();
            }
          });

          ws.send(
            JSON.stringify({
              type: "radar:subscribe",
            })
          );
        });

        ws.on("error", (error) => {
          reject(error);
        });
      });
    });
  });
});

