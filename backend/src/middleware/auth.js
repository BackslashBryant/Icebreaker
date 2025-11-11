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
  const session = getSessionByToken(token);
  
  if (!session) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }

  // Attach session to request for use in route handlers
  req.session = session;
  next();
}

