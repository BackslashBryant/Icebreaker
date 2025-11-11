/**
 * Centralized Selector Map
 * 
 * All test selectors using data-testid attributes.
 * Use this instead of text-based or ARIA selectors for stability.
 */

export const SEL = {
  // Welcome page
  ctaPressStart: '[data-testid="cta-press-start"]',
  ctaNotForMe: '[data-testid="cta-not-for-me"]',

  // Onboarding steps
  onboardingStep: (step: number) => `[data-testid="onboarding-step-${step}"]`,
  onboardingStep0: '[data-testid="onboarding-step-0"]', // What We Are/Not
  onboardingStep1: '[data-testid="onboarding-step-1"]', // 18+ Consent
  onboardingStep2: '[data-testid="onboarding-step-2"]', // Location
  onboardingStep3: '[data-testid="onboarding-step-3"]', // Vibe & Tags

  // Onboarding buttons
  onboardingGotIt: '[data-testid="onboarding-got-it"]',
  onboardingContinue: '[data-testid="onboarding-continue"]',
  onboardingSkipLocation: '[data-testid="onboarding-skip-location"]',
  onboardingEnterRadar: '[data-testid="onboarding-enter-radar"]',
  onboardingBack: '[data-testid="onboarding-back"]',

  // Vibe options
  vibeOption: (name: string) => `[data-testid="vibe-${name}"]`,
  vibeBanter: '[data-testid="vibe-banter"]',
  vibeIntros: '[data-testid="vibe-intros"]',
  vibeThinking: '[data-testid="vibe-thinking"]',
  vibeKillingTime: '[data-testid="vibe-killing-time"]',
  vibeSurprise: '[data-testid="vibe-surprise"]',

  // Tag chips
  tagChip: (name: string) => `[data-testid="tag-${name}"]`,
  tagQuietlyCurious: '[data-testid="tag-Quietly Curious"]',
  tagCreativeEnergy: '[data-testid="tag-Creative Energy"]',
  tagOverthinkingThings: '[data-testid="tag-Overthinking Things"]',
  tagBigSciFiBrain: '[data-testid="tag-Big Sci-Fi Brain"]',
  tagHereForTheHumans: '[data-testid="tag-Here for the humans"]',
  tagBuilderBrain: '[data-testid="tag-Builder brain"]',
  tagTechCurious: '[data-testid="tag-Tech curious"]',
  tagLofiHead: '[data-testid="tag-Lo-fi head"]',

  // Visibility toggle
  visibilityToggle: '[data-testid="visibility-toggle"]',
  visibilityToggleCheckbox: '[data-testid="visibility-toggle-checkbox"]',

  // Panic button
  panicFab: '[data-testid="panic-fab"]',
  panicDialog: '[data-testid="panic-dialog"]',
  panicConfirm: '[data-testid="panic-confirm"]',
  panicCancel: '[data-testid="panic-cancel"]',

  // Chat controls
  chatAccept: '[data-testid="chat-accept"]',
  chatDecline: '[data-testid="chat-decline"]',
  chatEnd: '[data-testid="chat-end"]',
  chatInput: '[data-testid="chat-input"]',
  chatSend: '[data-testid="chat-send"]',
  chatHeader: '[data-testid="chat-header"]',

  // Radar
  radarHeading: '[data-testid="radar-heading"]',
  radarViewToggle: '[data-testid="radar-view-toggle"]',
  radarProfileButton: '[data-testid="radar-profile-button"]',
  radarPersonCard: (sessionId: string) => `[data-testid="radar-person-${sessionId}"]`,
  radarChatButton: (sessionId: string) => `[data-testid="radar-chat-${sessionId}"]`,
};

/**
 * Helper to create tag selector from tag name
 * Handles spaces and special characters
 */
export function getTagSelector(tagName: string): string {
  return SEL.tagChip(tagName);
}

/**
 * Helper to create vibe selector from vibe ID
 */
export function getVibeSelector(vibeId: string): string {
  return SEL.vibeOption(vibeId);
}

