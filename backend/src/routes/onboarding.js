import express from "express";
import { createSession } from "../services/SessionManager.js";

const router = express.Router();

// Parse JSON bodies
router.use(express.json());

/**
 * POST /api/onboarding
 * Create a new session from onboarding data
 */
router.post("/", (req, res) => {
  try {
    const { vibe, tags, visibility, location } = req.body;

    // Validate required fields
    if (!vibe) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Vibe is required",
        },
      });
    }

    // Validate vibe is one of the allowed values
    const allowedVibes = ["banter", "intros", "thinking", "killing-time", "surprise"];
    if (!allowedVibes.includes(vibe)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid vibe value",
        },
      });
    }

    // Validate visibility is boolean
    if (typeof visibility !== "boolean") {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Visibility must be a boolean",
        },
      });
    }

    // Validate tags is array if provided
    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Tags must be an array",
        },
      });
    }

    // Validate location if provided
    if (location !== undefined) {
      if (typeof location !== "object" || typeof location.lat !== "number" || typeof location.lng !== "number") {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Location must be an object with lat and lng numbers",
          },
        });
      }
    }

    // Create session
    const sessionData = {
      vibe,
      tags: tags || [],
      visibility,
      location: location || null,
    };

    const { sessionId, token, handle } = createSession(sessionData);

    res.status(201).json({
      sessionId,
      token,
      handle,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create session",
      },
    });
  }
});

export { router as onboardingRouter };
