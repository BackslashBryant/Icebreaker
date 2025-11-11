/**
 * Cooldown Configuration
 * 
 * Tunable configuration for chat request cooldowns.
 * Adjust these values without code changes to tune cooldown behavior.
 * 
 * Cooldown triggers when a user receives DECLINE_THRESHOLD declined invites
 * within DECLINE_WINDOW_MS time window. Cooldown lasts COOLDOWN_DURATION_MS.
 */

export const COOLDOWN_CONFIG = {
  // Threshold: number of declined invites within window to trigger cooldown
  DECLINE_THRESHOLD: 3,
  
  // Window: time window for tracking declines (10 minutes)
  DECLINE_WINDOW_MS: 10 * 60 * 1000,
  
  // Duration: cooldown duration in milliseconds (30 minutes default)
  COOLDOWN_DURATION_MS: 30 * 60 * 1000,
  
  // Signal Engine weight: penalty per decline during cooldown
  W_DECLINE: -5,
  
  // Max penalty cap: prevent excessive punishment (3 declines × -5 = -15)
  MAX_DECLINE_PENALTY: -15,
};

/**
 * Get cooldown config (allows runtime override via environment variables)
 */
export function getCooldownConfig() {
  return {
    DECLINE_THRESHOLD: Number(process.env.COOLDOWN_DECLINE_THRESHOLD) || COOLDOWN_CONFIG.DECLINE_THRESHOLD,
    DECLINE_WINDOW_MS: Number(process.env.COOLDOWN_DECLINE_WINDOW_MS) || COOLDOWN_CONFIG.DECLINE_WINDOW_MS,
    COOLDOWN_DURATION_MS: Number(process.env.COOLDOWN_DURATION_MS) || COOLDOWN_CONFIG.COOLDOWN_DURATION_MS,
    W_DECLINE: Number(process.env.COOLDOWN_W_DECLINE) || COOLDOWN_CONFIG.W_DECLINE,
    MAX_DECLINE_PENALTY: Number(process.env.COOLDOWN_MAX_DECLINE_PENALTY) || COOLDOWN_CONFIG.MAX_DECLINE_PENALTY,
  };
}

