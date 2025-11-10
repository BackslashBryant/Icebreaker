import express from "express";
import { authenticateSession } from "../middleware/auth.js";
import { blockSession, reportSession } from "../services/SafetyManager.js";

const router = express.Router();

// Parse JSON bodies
router.use(express.json());

// All safety routes require authentication
router.use(authenticateSession);

/**
 * POST /api/safety/block
 * Block a user (add to blockedSessionIds)
 * 
 * Request: { targetSessionId: string }
 * Response: { success: boolean }
 */
router.post("/block", (req, res) => {
  try {
    const { targetSessionId } = req.body;
    const requesterSession = req.session;

    // Validate required fields
    if (!targetSessionId) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "targetSessionId is required",
        },
      });
    }

    // Validate targetSessionId is a string
    if (typeof targetSessionId !== "string") {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "targetSessionId must be a string",
        },
      });
    }

    // Block the target session
    const result = blockSession(requesterSession.sessionId, targetSessionId);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "BLOCK_FAILED",
          message: result.error || "Failed to block user",
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/safety/block:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
});

/**
 * POST /api/safety/report
 * Report a user (increment reportCount, store report metadata)
 * 
 * Request: { targetSessionId: string, category: 'harassment' | 'spam' | 'impersonation' | 'other' }
 * Response: { success: boolean }
 */
router.post("/report", (req, res) => {
  try {
    const { targetSessionId, category } = req.body;
    const requesterSession = req.session;

    // Validate required fields
    if (!targetSessionId) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "targetSessionId is required",
        },
      });
    }

    if (!category) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "category is required",
        },
      });
    }

    // Validate category is one of the allowed values
    const allowedCategories = ["harassment", "spam", "impersonation", "other"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: `category must be one of: ${allowedCategories.join(", ")}`,
        },
      });
    }

    // Validate targetSessionId is a string
    if (typeof targetSessionId !== "string") {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "targetSessionId must be a string",
        },
      });
    }

    // Report the target session
    const result = reportSession(
      requesterSession.sessionId,
      targetSessionId,
      category
    );

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "REPORT_FAILED",
          message: result.error || "Failed to report user",
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/safety/report:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
});

export { router as safetyRouter };

