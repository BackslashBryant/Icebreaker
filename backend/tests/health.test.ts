import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/index.js';
import { createTestServer, closeTestServer } from './utils/test-server.js';

/**
 * Health API Integration Test
 *
 * MVP DoD: Health API returns JSON { status: "ok" }
 *
 * Uses test server utilities to start a server for testing.
 */
describe('Health API Endpoint', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const result = await createTestServer(app);
    server = result.server;
    baseUrl = result.url;
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  it('should return 200 OK with { status: "ok" }', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('websocket');
    expect(body.websocket).toHaveProperty('connected');
    expect(body.websocket).toHaveProperty('connectionCount');
    expect(body.websocket).toHaveProperty('sessionCount');
  });

  it('should return JSON content-type', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const contentType = response.headers.get('content-type');
    expect(contentType).toMatch(/json/);
  });
});
