import { getSignalWeights } from "../config/signal-weights.js";
import { calculateProximityTier, getProximityScoreMultiplier } from "../lib/proximity-utils.js";
import { getUniqueReporterCount } from "./ReportManager.js";

/**
 * Signal Engine Service
 *
 * Calculates compatibility scores between sessions for Radar View sorting.
 *
 * Scoring formula:
 * score(A,B) = w_vibe * VIBE_MATCH + w_tag * MIN(shared_tags, 3) +
 *              w_vis * VISIBILITY_ON + w_tagless * TAGLESS + w_dist * PROXIMITY_TIER +
 *              w_report * REPORT_COUNT
 *
 * Safety exclusion: Sessions with safety_flag == true are excluded from results.
 * Report penalty: Reported users (1-2 unique reporters) appear lower in results.
 * Tie-breakers: Stable random seed per session + alphabetical handle.
 */

/**
 * Generate a stable random seed for a session
 * Uses sessionId as seed for consistent randomization
 */
function getStableRandomSeed(sessionId) {
  // Simple hash function for stable seed generation
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate compatibility score between two sessions
 * @param {Object} sourceSession - Source session (viewer)
 * @param {Object} targetSession - Target session (person being scored)
 * @returns {number} Compatibility score (higher = better match)
 */
export function calculateScore(sourceSession, targetSession) {
  // Safety exclusion: exclude sessions with active safety flag
  // If panicExclusionExpiresAt is set, check expiration; otherwise exclude if safetyFlag is true
  const now = Date.now();
  if (targetSession.safetyFlag === true) {
    // If panic exclusion timestamp is set, check if it's expired
    if (targetSession.panicExclusionExpiresAt !== null && targetSession.panicExclusionExpiresAt !== undefined) {
      if (targetSession.panicExclusionExpiresAt > now) {
        return -Infinity; // Exclude from results (active exclusion)
      }
      // If exclusion expired, clear safety flag
      if (targetSession.panicExclusionExpiresAt <= now) {
        targetSession.safetyFlag = false;
        targetSession.panicExclusionExpiresAt = null;
      }
    } else {
      // Backward compatibility: safetyFlag without panicExclusionExpiresAt still excludes
      return -Infinity;
    }
  }

  const weights = getSignalWeights();
  let score = 0;

  // 1. Vibe match bonus
  if (sourceSession.vibe === targetSession.vibe) {
    score += weights.w_vibe;
  }

  // 2. Shared tag bonus (max 3 tags)
  const sourceTags = sourceSession.tags || [];
  const targetTags = targetSession.tags || [];
  const sharedTags = sourceTags.filter((tag) => targetTags.includes(tag));
  const sharedTagCount = Math.min(sharedTags.length, 3);
  score += weights.w_tag * sharedTagCount;

  // 3. Visibility bonus (target user has visibility ON)
  if (targetSession.visibility === true) {
    score += weights.w_vis;
  }

  // 4. Tagless penalty (source user has no tags)
  if (sourceTags.length === 0) {
    score += weights.w_tagless;
  }

  // 5. Proximity tier bonus
  const proximityTier = calculateProximityTier(sourceSession.location, targetSession.location);
  if (proximityTier) {
    const proximityMultiplier = getProximityScoreMultiplier(proximityTier);
    score += weights.w_dist * proximityMultiplier;
  }

  // 6. Report penalty (negative weight applied per unique reporter count)
  // This lowers reported users in Radar results without excluding them entirely
  // Safety exclusion (≥3 unique reports) still excludes via safetyFlag check above
  const uniqueReporterCount = getUniqueReporterCount(targetSession.sessionId);
  if (uniqueReporterCount > 0) {
    score += weights.w_report * uniqueReporterCount;
  }

  return score;
}

/**
 * Calculate scores for all target sessions from a source session
 * @param {Object} sourceSession - Source session (viewer)
 * @param {Array<Object>} targetSessions - Array of target sessions to score
 * @returns {Array<Object>} Array of { session, score } objects, sorted by score (descending)
 */
export function calculateScores(sourceSession, targetSessions) {
  // Filter out source session itself
  const otherSessions = targetSessions.filter(
    (session) => session.sessionId !== sourceSession.sessionId
  );

  // Calculate scores
  const scoredSessions = otherSessions.map((session) => ({
    session,
    score: calculateScore(sourceSession, session),
  }));

  // Filter out excluded sessions (safety_flag)
  const validSessions = scoredSessions.filter((item) => item.score !== -Infinity);

  // Sort by score (descending), then apply tie-breakers
  validSessions.sort((a, b) => {
    // Primary sort: score (descending)
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    // Tie-breaker 1: Stable random seed (deterministic but pseudo-random)
    const seedA = getStableRandomSeed(a.session.sessionId);
    const seedB = getStableRandomSeed(b.session.sessionId);
    if (seedA !== seedB) {
      return seedB - seedA; // Higher seed first
    }

    // Tie-breaker 2: Alphabetical handle
    return a.session.handle.localeCompare(b.session.handle);
  });

  return validSessions;
}

/**
 * Get radar results for a source session
 * Returns sorted list of nearby sessions with scores
 * @param {Object} sourceSession - Source session (viewer)
 * @param {Array<Object>} allSessions - Array of all active sessions
 * @returns {Array<Object>} Array of { session, score } objects, sorted by compatibility
 */
export function getRadarResults(sourceSession, allSessions) {
  return calculateScores(sourceSession, allSessions);
}

