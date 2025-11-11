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

    // Log request for debugging
    console.log("Onboarding request:", { vibe, tags, visibility, location, body: req.body });

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
      console.error("Visibility validation failed:", { visibility, type: typeof visibility });
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

    // Sanitize and validate tags content (prevent XSS)
    if (Array.isArray(tags)) {
      const MAX_TAG_LENGTH = 50;
      const MAX_TAGS = 10;

      if (tags.length > MAX_TAGS) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: `Maximum ${MAX_TAGS} tags allowed`,
          },
        });
      }

      // Sanitize tags: remove HTML tags, limit length
      const sanitizedTags = tags
        .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().replace(/<[^>]*>/g, "").slice(0, MAX_TAG_LENGTH))
        .filter((tag) => tag.length > 0);

      if (sanitizedTags.length !== tags.length) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid tag content",
          },
        });
      }
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

      // Validate location bounds (prevent extreme values that could cause DoS)
      const { lat, lng } = location;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || !isFinite(lat) || !isFinite(lng)) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Location coordinates out of valid range",
          },
        });
      }
    }

    // Create session (use sanitized tags if validation passed)
    const sanitizedTags = Array.isArray(tags)
      ? tags
          .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim().replace(/<[^>]*>/g, "").slice(0, 50))
          .filter((tag) => tag.length > 0)
      : [];

    const sessionData = {
      vibe,
      tags: sanitizedTags,
      visibility,
      location: location || null,
    };

    const { sessionId, token, handle } = createSession(sessionData);
    
    console.log("Session created successfully:", { sessionId, handle });

    res.status(201).json({
      sessionId,
      token,
      handle,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create session",
      },
    });
  }
});

export { router as onboardingRouter };
