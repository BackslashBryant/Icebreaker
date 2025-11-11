import express from "express";
import { authenticateSession } from "../middleware/auth.js";
import { updateSessionVisibility, updateEmergencyContact } from "../services/SessionManager.js";

const router = express.Router();

// Parse JSON bodies
router.use(express.json());

// All profile routes require authentication
router.use(authenticateSession);

/**
 * Validate emergency contact format (basic validation)
 * Supports phone (E.164 format: +1234567890) or email (RFC 5322 basic)
 * @param {string} contact - Emergency contact string
 * @returns {boolean} True if valid format
 */
function isValidEmergencyContact(contact) {
  if (!contact || typeof contact !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmed = contact.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // Check if phone (E.164 format: starts with +, followed by digits)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (phoneRegex.test(trimmed)) {
    return true;
  }

  // Check if email (basic RFC 5322 format)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * PUT /api/profile/visibility
 * Update session visibility
 * 
 * Request: { visibility: boolean }
 * Response: { success: boolean, visibility: boolean }
 */
router.put("/visibility", (req, res) => {
  try {
    const { visibility } = req.body;
    const session = req.session;

    // Validate required fields
    if (visibility === undefined) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "visibility is required",
        },
      });
    }

    // Validate visibility is boolean
    if (typeof visibility !== "boolean") {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "visibility must be a boolean",
        },
      });
    }

    // Update session visibility
    const success = updateSessionVisibility(session.sessionId, visibility);

    if (!success) {
      return res.status(500).json({
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update visibility",
        },
      });
    }

    return res.json({
      success: true,
      visibility,
    });
  } catch (error) {
    console.error("Error updating visibility:", error);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
});

/**
 * PUT /api/profile/emergency-contact
 * Update session emergency contact
 * 
 * Request: { emergencyContact: string } (optional - can be null to clear)
 * Response: { success: boolean, emergencyContact: string | null }
 */
router.put("/emergency-contact", (req, res) => {
  try {
    const { emergencyContact } = req.body;
    const session = req.session;

    // If emergencyContact is provided, validate format
    if (emergencyContact !== undefined && emergencyContact !== null) {
      // Validate emergencyContact is string
      if (typeof emergencyContact !== "string") {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "emergencyContact must be a string",
          },
        });
      }

      // Validate format (phone or email)
      if (!isValidEmergencyContact(emergencyContact)) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "emergencyContact must be a valid phone number (E.164 format: +1234567890) or email address",
          },
        });
      }
    }

    // Update session emergency contact (null clears it)
    const contactValue = emergencyContact === null || emergencyContact === undefined ? null : emergencyContact.trim();
    const success = updateEmergencyContact(session.sessionId, contactValue);

    if (!success) {
      return res.status(500).json({
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update emergency contact",
        },
      });
    }

    return res.json({
      success: true,
      emergencyContact: contactValue,
    });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
});

export default router;

