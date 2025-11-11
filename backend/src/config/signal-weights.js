/**
 * Signal Engine Weight Configuration
 * 
 * Tunable weights for Signal Engine compatibility scoring.
 * Adjust these values without code changes to tune the matching algorithm.
 * 
 * Scoring formula:
 * score(A,B) = w_vibe * VIBE_MATCH + w_tag * MIN(shared_tags, 3) + 
 *              w_vis * VISIBILITY_ON + w_tagless * TAGLESS + w_dist * PROXIMITY_TIER +
 *              w_report * REPORT_COUNT + w_decline * DECLINE_PENALTY
 */

export const SIGNAL_WEIGHTS = {
  // Vibe match bonus (when both users have the same vibe)
  w_vibe: 10,

  // Shared tag bonus (per tag, max 3 tags counted)
  w_tag: 5,

  // Visibility bonus (when target user has visibility ON)
  w_vis: 3,

  // Tagless penalty (when source user has no tags)
  w_tagless: -5,

  // Proximity tier bonus (applied based on distance tier)
  w_dist: 2,

  // Report penalty (per report count - negative weight to lower reported users in results)
  w_report: -3,

  // Decline penalty (per decline during cooldown - negative weight for soft sort-down)
  w_decline: -5,
};

/**
 * Get signal weights (allows runtime override via environment variables)
 */
export function getSignalWeights() {
  return {
    w_vibe: Number(process.env.SIGNAL_WEIGHT_VIBE) || SIGNAL_WEIGHTS.w_vibe,
    w_tag: Number(process.env.SIGNAL_WEIGHT_TAG) || SIGNAL_WEIGHTS.w_tag,
    w_vis: Number(process.env.SIGNAL_WEIGHT_VIS) || SIGNAL_WEIGHTS.w_vis,
    w_tagless: Number(process.env.SIGNAL_WEIGHT_TAGLESS) || SIGNAL_WEIGHTS.w_tagless,
    w_dist: Number(process.env.SIGNAL_WEIGHT_DIST) || SIGNAL_WEIGHTS.w_dist,
    w_report: Number(process.env.SIGNAL_WEIGHT_REPORT) || SIGNAL_WEIGHTS.w_report,
    w_decline: Number(process.env.SIGNAL_WEIGHT_DECLINE) || SIGNAL_WEIGHTS.w_decline,
  };
}

