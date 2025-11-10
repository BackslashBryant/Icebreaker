/**
 * Report Manager
 * 
 * Manages report storage and tracking for safety moderation.
 * MVP: In-memory storage (lost on server restart).
 * Post-MVP: Persistent database storage.
 */

// In-memory report store
// Structure: Map<targetSessionId, Set<reporterSessionId>>
const reportsByTarget = new Map();

// Report metadata store
// Structure: Array<{ reporterId, targetId, category, timestamp }>
const reportMetadata = [];

/**
 * Add a report
 * @param {string} reporterSessionId - Session ID of reporter
 * @param {string} targetSessionId - Session ID of target
 * @param {string} category - Report category
 */
export function addReport(reporterSessionId, targetSessionId, category) {
  // Initialize target's report set if not exists
  if (!reportsByTarget.has(targetSessionId)) {
    reportsByTarget.set(targetSessionId, new Set());
  }

  // Add reporter to target's report set (prevents duplicates)
  reportsByTarget.get(targetSessionId).add(reporterSessionId);

  // Store report metadata
  reportMetadata.push({
    reporterId: reporterSessionId, // For MVP, store sessionId directly (post-MVP: hash it)
    targetId: targetSessionId,
    category,
    timestamp: Date.now(),
  });
}

/**
 * Check if a reporter has already reported a target
 * @param {string} reporterSessionId - Session ID of reporter
 * @param {string} targetSessionId - Session ID of target
 * @returns {boolean} true if reporter has already reported target
 */
export function hasReported(reporterSessionId, targetSessionId) {
  const targetReports = reportsByTarget.get(targetSessionId);
  if (!targetReports) {
    return false;
  }
  return targetReports.has(reporterSessionId);
}

/**
 * Get count of unique reporters for a target
 * @param {string} targetSessionId - Session ID of target
 * @returns {number} Count of unique reporters
 */
export function getUniqueReporterCount(targetSessionId) {
  const targetReports = reportsByTarget.get(targetSessionId);
  if (!targetReports) {
    return 0;
  }
  return targetReports.size;
}

/**
 * Get all reports for a target (for moderation/admin use - post-MVP)
 * @param {string} targetSessionId - Session ID of target
 * @returns {Array} Array of report metadata objects
 */
export function getReportsForTarget(targetSessionId) {
  return reportMetadata.filter((report) => report.targetId === targetSessionId);
}

/**
 * Cleanup reports for expired sessions (called periodically)
 * Note: This is a best-effort cleanup. Reports are ephemeral in MVP.
 */
export function cleanupExpiredReports() {
  // In MVP, reports are tied to sessions which expire after 1 hour.
  // For production, this would need to query active sessions and clean up reports for expired ones.
  // For MVP, we can rely on server restart to clear reports.
}

/**
 * Clear all reports (for testing purposes only)
 */
export function clearAllReports() {
  reportsByTarget.clear();
  reportMetadata.length = 0;
}

