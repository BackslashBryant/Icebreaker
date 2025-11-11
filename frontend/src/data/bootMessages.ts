/**
 * Bootup Messages Pool
 *
 * Random on-brand messages for boot sequence that appeal to target demo:
 * Adults (18+) in shared spaces who value control, subtlety, safety, and a vibe that doesn't try too hard.
 *
 * Brand voice: Confident, succinct, slightly playful; never clingy or hypey.
 * Terminal aesthetic: UPPERCASE, monospace feel, retro charm.
 */

export const BOOT_MESSAGES_POOL = [
  // Technical but playful
  "INITIALIZING ICEBREAKER v1.0...",
  "LOADING SIGNAL ENGINE...",
  "CALIBRATING PROXIMITY SENSORS...",
  "ESTABLISHING SECURE CONNECTION...",
  "SCANNING FOR NEARBY SIGNALS...",
  "SYNCING EPHEMERAL SESSION...",
  "VERIFYING PRIVACY PROTOCOLS...",
  "READYING RADAR INTERFACE...",
  "LOADING PRESENCE ENGINE...",
  "CALIBRATING DISTANCE MATRIX...",
  "ESTABLISHING TRUST LAYER...",
  "INITIALIZING CONNECTION MODE...",
  "PREPARING SAFE SPACE...",
  "LOADING SESSION MANAGER...",
  "INITIALIZING PROXIMITY GRID...",
  "VERIFYING AUTHENTICATION...",
  "LOADING CHAT PROTOCOL...",
  "ESTABLISHING DATA PIPELINE...",
  "CALIBRATING SIGNAL STRENGTH...",
  "SYNCING PRESENCE CACHE...",
  
  // Relatable to shared spaces
  "CHECKING WHO'S AROUND...",
  "SCANNING THE ROOM...",
  "LOOKING FOR GOOD VIBES...",
  "FINDING YOUR WAVELENGTH...",
  "MAPPING NEARBY HUMANS...",
  "DETECTING PRESENCE SIGNALS...",
  "LOCATING INTERESTING PEOPLE...",
  "SEARCHING FOR CONNECTION...",
  "CALIBRATING SOCIAL RADAR...",
  "SYNCING WITH REAL WORLD...",
  "SURVEYING THE SPACE...",
  "MAPPING THE CROWD...",
  "SCANNING FOR COMPATIBILITY...",
  "DETECTING NEARBY ACTIVITY...",
  "LOOKING FOR OPEN SIGNALS...",
  "MAPPING SOCIAL LANDSCAPE...",
  "SCANNING FOR PRESENCE...",
  "DETECTING NEARBY VIBES...",
  "MAPPING HUMAN SIGNALS...",
  "SCANNING FOR INTEREST...",
  
  // Playful but not trying too hard
  "WARMING UP THE RADAR...",
  "BOOTING UP THE VIBE CHECK...",
  "LOADING NEARBY HUMANS...",
  "PREPARING FOR BRIEF MOMENTS...",
  "SPINNING UP THE SIGNAL...",
  "TUNING INTO THE PRESENT...",
  "READYING THE WALKIE-TALKIE...",
  "CHARGING THE CONNECTION...",
  "PREPPING THE RADAR SWEEP...",
  "INITIALIZING REAL WORLD MODE...",
  "WARMING UP THE ENGINE...",
  "SPINNING UP PRESENCE...",
  "CHARGING THE RADAR...",
  "PREPPING THE SIGNAL...",
  "TUNING THE FREQUENCY...",
  "READYING THE MOMENT...",
  "WARMING UP CONNECTIONS...",
  "SPINNING UP THE VIBE...",
  "CHARGING THE INTERFACE...",
  "PREPPING FOR CONTACT...",
  
  // Witty terminal vibes
  "RUNNING PRESENCE.EXE...",
  "EXECUTING SOCIAL PROTOCOL...",
  "LOADING HUMAN DETECTION...",
  "COMPILING NEARBY SIGNALS...",
  "PARSING PROXIMITY DATA...",
  "RUNNING VIBE CHECK...",
  "EXECUTING CONNECTION SEQUENCE...",
  "LOADING EPHEMERAL MODE...",
  "RUNNING PRIVACY FILTERS...",
  "COMPILING PRESENCE MATRIX...",
  "RUNNING SIGNAL.EXE...",
  "EXECUTING RADAR PROTOCOL...",
  "LOADING PROXIMITY DETECTION...",
  "COMPILING SOCIAL DATA...",
  "PARSING PRESENCE SIGNALS...",
  "RUNNING COMPATIBILITY CHECK...",
  "EXECUTING VIBE ANALYSIS...",
  "LOADING CONNECTION MODE...",
  "RUNNING SAFETY PROTOCOLS...",
  "COMPILING NEARBY MATRIX...",
  
  // Subtle, confident
  "CONNECTING TO REAL WORLD...",
  "PREPARING FOR AUTHENTIC CONTACT...",
  "READYING THE MOMENT...",
  "INITIALIZING BRIEF CONNECTION...",
  "LOADING QUIET MODE...",
  "PREPPING THE NOD ACROSS THE ROOM...",
  "READYING EPHEMERAL CHAT...",
  "PREPARING FOR REAL TIME...",
  "LOADING PRESENCE OVER PROFILE...",
  "READYING THE QUIET ALTERNATIVE...",
  "CONNECTING TO THE PRESENT...",
  "PREPARING FOR REAL CONTACT...",
  "READYING THE CONNECTION...",
  "INITIALIZING AUTHENTIC MODE...",
  "LOADING SUBTLE MODE...",
  "PREPPING THE BRIEF MOMENT...",
  "READYING REAL WORLD CHAT...",
  "PREPARING FOR NOW...",
  "LOADING MOMENT OVER PERMANENCE...",
  "READYING THE AUTHENTIC ALTERNATIVE...",
  
  // More personality & variety
  "TURNING ON THE RADAR...",
  "ACTIVATING PRESENCE MODE...",
  "BOOTING SOCIAL RADAR...",
  "INITIALIZING NEARBY SCAN...",
  "LOADING HUMAN RADAR...",
  "PREPPING THE SIGNAL...",
  "WARMING UP PRESENCE...",
  "ACTIVATING CONNECTION MODE...",
  "BOOTING PROXIMITY ENGINE...",
  "INITIALIZING SOCIAL SCAN...",
  "LOADING NEARBY MODE...",
  "PREPPING THE INTERFACE...",
  "TURNING ON THE SIGNAL...",
  "ACTIVATING RADAR MODE...",
  "BOOTING PRESENCE ENGINE...",
  "INITIALIZING CONNECTION SCAN...",
  "LOADING SOCIAL MODE...",
  "PREPPING THE RADAR...",
  "TURNING ON PRESENCE...",
  "ACTIVATING NEARBY MODE...",
  
  // Terminal charm
  "SYSTEM READY...",
  "ALL SYSTEMS GO...",
  "READY",
] as const;

/**
 * Selects random messages from the pool for boot sequence.
 * Always ends with "READY" as the final message.
 *
 * @param count Number of messages to select (default: 4)
 * @returns Array of randomly selected messages ending with "READY"
 */
export function selectBootMessages(count: number = 4): string[] {
  // Filter out "READY" and "SYSTEM READY..." / "ALL SYSTEMS GO..." from pool for random selection
  const selectableMessages = BOOT_MESSAGES_POOL.filter(
    msg => msg !== "READY" && msg !== "SYSTEM READY..." && msg !== "ALL SYSTEMS GO..."
  );

  // Shuffle array using Fisher-Yates algorithm
  const shuffled = [...selectableMessages].sort(() => Math.random() - 0.5);

  // Select first N messages
  const selected = shuffled.slice(0, Math.min(count, selectableMessages.length));

  // Always end with "READY"
  return [...selected, "READY"];
}

