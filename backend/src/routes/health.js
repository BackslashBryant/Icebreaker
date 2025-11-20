import express from 'express';
import { getWebSocketStatus } from '../websocket/server.js';

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 * Returns: { status: "ok", websocket: { connected: boolean, connectionCount: number, sessionCount: number } }
 * 
 * TEMPORARY TEST MODE: Set HEALTH_CHECK_TEST_FAIL=true to simulate downtime for alert testing
 */
router.get('/health', (req, res) => {
  // TEMPORARY: Test mode to trigger UptimeRobot alerts
  if (process.env.HEALTH_CHECK_TEST_FAIL === 'true') {
    console.log('[TEST] Health check intentionally failing for alert testing');
    return res.status(500).json({
      status: 'error',
      message: 'Temporary test failure - alert testing in progress',
    });
  }

  const wsStatus = getWebSocketStatus();
  
  res.status(200).json({
    status: 'ok',
    websocket: {
      connected: wsStatus.connected,
      connectionCount: wsStatus.connectionCount || 0,
      sessionCount: wsStatus.sessionCount || 0,
    },
  });
});

/**
 * Readiness endpoint
 * GET /api/health/ready
 * Returns: { status: "ready", websocket: { connected: boolean } }
 * Used for deployment checks (Kubernetes readiness probe, etc.)
 */
router.get('/health/ready', (req, res) => {
  const wsStatus = getWebSocketStatus();
  
  // Ready if WebSocket server is connected
  const ready = wsStatus.connected;
  
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not ready',
    websocket: {
      connected: wsStatus.connected,
    },
  });
});

export { router as healthRouter };
