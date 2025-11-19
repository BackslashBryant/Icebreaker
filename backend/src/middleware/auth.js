import { getSessionByToken } from "../services/SessionManager.js";

/**
 * Authentication Middleware
 * 
 * Validates session token from Authorization header and attaches session to request.
 * Returns 401 if token is missing or invalid.
 */
export function authenticateSession(req, res, next) {
  // Get token from Authorization header (format: "Bearer <token>" or just "<token>")
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing authorization token",
      },
    });
  }

  // Extract token (handle both "Bearer <token>" and "<token>" formats)
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : authHeader;

  // Validate token and get session
  const result = getSessionByToken(token);
  
  if (result.error || !result.session) {
    const errorMessages = {
      invalid_format: "Invalid token format",
      signature_mismatch: "Invalid token signature",
      expired: "Token expired",
      session_not_found: "Session not found",
      validation_error: "Token validation error",
    };
    
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: errorMessages[result.error] || "Invalid or expired token",
      },
    });
  }

  // Attach session to request for use in route handlers
  req.session = result.session;
  next();
}

