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
 */
export function verifySessionToken(token) {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    const secret = process.env.SESSION_SECRET || "icebreaker-mvp-secret-change-in-production";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    return payload.sessionId;
  } catch (error) {
    return null;
  }
}
