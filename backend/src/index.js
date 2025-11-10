import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { healthRouter } from './routes/health.js';
import { onboardingRouter } from './routes/onboarding.js';
import { initializeWebSocketServer } from './websocket/server.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for frontend
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health endpoint
app.use('/api', healthRouter);

// Onboarding endpoint
app.use('/api/onboarding', onboardingRouter);

// Create HTTP server for WebSocket upgrade
const server = createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`WebSocket server available on ws://localhost:${PORT}/ws`);
  });
}

export { app, server };
