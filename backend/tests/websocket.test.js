import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { WebSocket } from "ws";
import { createSession, resetSessionsForTest } from "../src/services/SessionManager.js";
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
    // Pass the Express app to the helper - it will create and listen on the HTTP server
    const result = await createWebSocketTestServer(app);
    testServer = result.server;
    testPort = result.port;
    wsUrl = result.wsUrl;
    // Initialize WebSocket server on the HTTP server that the helper created
    // Server is already listening at this point
    initializeWebSocketServer(testServer);
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  describe("Connection", () => {
    it("rejects connection without token", async () => {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws`);
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.removeAllListeners();
              ws.close();
            }
          }
        };

        ws.on("close", (code, reason) => {
          expect(code).toBe(1008);
          expect(reason.toString()).toContain("Missing token");
          cleanup();
          resolve();
        });

        ws.on("error", () => {
          // Connection will close, error is expected
          // Wait for close event
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for connection close"));
          }
        }, 10000);
      });
    });

    it("rejects connection with invalid token", async () => {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`${wsUrl}/ws?token=invalid-token`);
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.removeAllListeners();
              ws.close();
            }
          }
        };

        ws.on("close", (code, reason) => {
          expect(code).toBe(1008);
          expect(reason.toString()).toContain("Invalid token");
          cleanup();
          resolve();
        });

        ws.on("error", () => {
          // Connection will close, error is expected
          // Wait for close event
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for connection close"));
          }
        }, 5000);
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
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.removeAllListeners();
              ws.close();
            }
          }
        };

        ws.on("open", () => {
          ws.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === "connected") {
              expect(message.payload).toHaveProperty("sessionId");
              expect(message.payload).toHaveProperty("handle");
              cleanup();
              resolve();
            }
          });
        });

        ws.on("error", (error) => {
          cleanup();
          reject(error);
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for connected message"));
          }
        }, 5000);
      });
    });
  });

  describe("Message Handling", () => {
    let ws;
    let token;

    beforeEach(async () => {
      resetSessionsForTest();
      const sessionData = {
        vibe: "banter",
        tags: ["tag1"],
        visibility: true,
      };

      const session = createSession(sessionData);
      token = session.token;

      await new Promise((resolve, reject) => {
        ws = new WebSocket(`${wsUrl}/ws?token=${token}`);
        let resolved = false;

        const cleanup = () => {
          if (!resolved && ws) {
            resolved = true;
            ws.removeAllListeners();
          }
        };

        ws.on("open", () => {
          cleanup();
          resolve();
        });

        ws.on("error", (error) => {
          cleanup();
          reject(error);
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("beforeEach timed out waiting for WebSocket open"));
          }
        }, 5000);
      });
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    it("handles radar:subscribe message", async () => {
      await new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeListener("message", messageHandler);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        };

        const messageHandler = (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "radar:update") {
            expect(message.payload).toHaveProperty("people");
            expect(message.payload).toHaveProperty("timestamp");
            expect(Array.isArray(message.payload.people)).toBe(true);
            cleanup();
            resolve();
          }
        };

        ws.on("message", messageHandler);

        ws.send(
          JSON.stringify({
            type: "radar:subscribe",
          })
        );

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for radar:update message"));
          }
        }, 5000);
      });
    });

    it("handles location:update message", async () => {
      let updateCount = 0;

      await new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeListener("message", messageHandler);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        };

        const messageHandler = (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "radar:update") {
            updateCount++;
            if (updateCount === 2) {
              // Should receive update after location change
              expect(message.payload).toHaveProperty("people");
              cleanup();
              resolve();
            }
          }
        };

        ws.on("message", messageHandler);

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

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for second radar:update"));
          }
        }, 5000);
      });
    });

    it("handles chat:request message", async () => {
      // Create a valid target session for the chat request
      const targetSessionData = {
        vibe: "intros",
        tags: ["tag1"],
        visibility: true,
      };
      const targetSession = createSession(targetSessionData);

      await new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeListener("message", messageHandler);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        };

        const messageHandler = (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "chat:request:ack") {
            expect(message.payload).toHaveProperty("targetSessionId");
            expect(message.payload).toHaveProperty("status");
            expect(message.payload.targetSessionId).toBe(targetSession.sessionId);
            expect(message.payload.status).toBe("pending");
            cleanup();
            resolve();
          }
        };

        ws.on("message", messageHandler);

        ws.send(
          JSON.stringify({
            type: "chat:request",
            payload: {
              targetSessionId: targetSession.sessionId,
            },
          })
        );

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for chat:request:ack"));
          }
        }, 5000);
      });
    });

    it("sends error for invalid message", async () => {
      await new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeListener("message", messageHandler);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        };

        const messageHandler = (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "error") {
            expect(message.payload).toHaveProperty("message");
            cleanup();
            resolve();
          }
        };

        ws.on("message", messageHandler);

        ws.send(
          JSON.stringify({
            type: "unknown:message",
          })
        );

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for error message"));
          }
        }, 5000);
      });
    });

    it("sends error for invalid message format", async () => {
      await new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeListener("message", messageHandler);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        };

        const messageHandler = (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === "error") {
            expect(message.payload.message).toBe("Invalid message format");
            cleanup();
            resolve();
          }
        };

        ws.on("message", messageHandler);

        ws.send("invalid json");

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for error message"));
          }
        }, 5000);
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
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeAllListeners();
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.close();
            }
          }
        };

        ws.on("open", () => {
          ws.isAlive = true;
          ws.on("pong", () => {
            expect(ws.isAlive).toBe(true);
            cleanup();
            resolve();
          });

          // Send ping
          ws.ping();
        });

        ws.on("error", (error) => {
          cleanup();
          reject(error);
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for pong"));
          }
        }, 5000);
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
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            ws.removeAllListeners();
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.close();
            }
          }
        };

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

              cleanup();
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
          cleanup();
          reject(error);
        });

        // Timeout safety
        setTimeout(() => {
          if (!resolved) {
            cleanup();
            reject(new Error("Test timed out waiting for radar:update"));
          }
        }, 5000);
      });
    });
  });
});

