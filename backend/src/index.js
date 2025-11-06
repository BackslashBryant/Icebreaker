import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { onboardingRouter } from './routes/onboarding.js';

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

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export { app };
