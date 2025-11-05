import express from 'express';

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 * Returns: { status: "ok" }
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export { router as healthRouter };
