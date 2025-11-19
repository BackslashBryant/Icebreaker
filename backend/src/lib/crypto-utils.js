import crypto from "crypto";

/**
 * Generate a unique session ID (hashed)
 */
export function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a session token (signed token for MVP)
 */
export function generateSessionToken(sessionId) {
  // For MVP, create a simple signed token
  // In production, use JWT or similar
  const payload = {
    sessionId,
    timestamp: Date.now(),
  };

  const secret = process.env.SESSION_SECRET || "icebreaker-mvp-secret-change-in-production";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return `${Buffer.from(JSON.stringify(payload)).toString("base64")}.${signature}`;
}

/**
 * Verify session token
 * Returns { sessionId, error: null } if valid, { sessionId: null, error: string } if invalid
 */
export function verifySessionToken(token) {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) {
      return { sessionId: null, error: "invalid_format" };
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    } catch (parseError) {
      return { sessionId: null, error: "invalid_format" };
    }

    const secret = process.env.SESSION_SECRET || "icebreaker-mvp-secret-change-in-production";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expectedSignature) {
      return { sessionId: null, error: "signature_mismatch" };
    }

    // Check token expiration (1 hour default, same as session TTL)
    const TOKEN_TTL = 3600000; // 1 hour in milliseconds
    const tokenAge = Date.now() - payload.timestamp;
    if (tokenAge > TOKEN_TTL) {
      return { sessionId: null, error: "expired" };
    }

    return { sessionId: payload.sessionId, error: null };
  } catch (error) {
    return { sessionId: null, error: "validation_error" };
  }
}
