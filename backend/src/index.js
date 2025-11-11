import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { healthRouter } from './routes/health.js';
import { onboardingRouter } from './routes/onboarding.js';
import { safetyRouter } from './routes/safety.js';
import profileRouter from './routes/profile.js';
import { initializeWebSocketServer } from './websocket/server.js';
import { initSentry, errorHandler, notFoundHandler } from './middleware/error-handler.js';

// Initialize Sentry error tracking
initSentry();

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

// Safety endpoints (block/report)
app.use('/api/safety', safetyRouter);

// Profile endpoints (visibility, emergency contact)
app.use('/api/profile', profileRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

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
