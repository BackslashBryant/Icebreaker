const ADJECTIVES = [
  "Chill",
  "Cozy",
  "Quiet",
  "Bright",
  "Curious",
  "Mellow",
  "Steady",
  "Warm",
  "Cool",
  "Smooth",
  "Easy",
  "Calm",
  "Bold",
  "Swift",
  "Gentle",
];

const VIBE_NOUNS: Record<string, string[]> = {
  banter: ["Wit", "Spark", "Chat", "Banter", "Quip"],
  intros: ["Friend", "Connector", "Mixer", "Greeter", "Buddy"],
  thinking: ["Thinker", "Mind", "Ponderer", "Muser", "Brain"],
  "killing-time": ["Wanderer", "Drifter", "Pauser", "Stroller", "Idler"],
  surprise: ["Wildcard", "Mystery", "Surprise", "Random", "Chance"],
};

const TAG_NOUNS: Record<string, string> = {
  "Quietly Curious": "Observer",
  "Creative Energy": "Creator",
  "Overthinking Things": "Analyzer",
  "Big Sci-Fi Brain": "Dreamer",
  "Here for the humans": "Connector",
  "Builder brain": "Maker",
  "Tech curious": "Explorer",
  "Lo-fi head": "Viber",
};

export function generateUsername(vibe?: string, tags?: string[]): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

  let noun = "Soul";

  // Try to use vibe first
  if (vibe && VIBE_NOUNS[vibe]) {
    const vibeNouns = VIBE_NOUNS[vibe];
    noun = vibeNouns[Math.floor(Math.random() * vibeNouns.length)];
  }
  // Fall back to tags
  else if (tags && tags.length > 0) {
    const firstTag = tags[0];
    noun = TAG_NOUNS[firstTag] || "Soul";
  }

  const number = Math.floor(Math.random() * 90) + 10;

  return `${adjective}${noun}${number}`;
}
