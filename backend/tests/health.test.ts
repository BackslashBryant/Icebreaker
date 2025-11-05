import { describe, it, expect } from 'vitest';
import { app } from '../src/index.js';

/**
 * Health API Unit Test
 *
 * MVP DoD: Health API returns JSON { status: "ok" }
 *
 * This test verifies:
 * - GET /api/health returns 200 status code
 * - Response body is JSON with shape { status: "ok" }
 */
describe('Health API Endpoint', () => {
  it('should return 200 OK with { status: "ok" }', async () => {
    const response = await fetch('http://localhost:8000/api/health');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('should return JSON content-type', async () => {
    const response = await fetch('http://localhost:8000/api/health');
    const contentType = response.headers.get('content-type');
    expect(contentType).toMatch(/json/);
  });
});
