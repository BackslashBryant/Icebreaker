/**
 * Persona Presence Script Schema
 * 
 * Defines the structure for persona presence scripts used in multi-user simulation tests.
 */

export interface PersonaPresence {
  sessionId: string;
  handle: string;
  vibe: 'thinking' | 'intros' | 'banter' | 'surprise' | 'killing-time';
  tags: string[];
  visible?: boolean;
  geo?: {
    lat: number;
    lon: number;
    floor?: number;
  };
}

export interface PersonaPresenceScript {
  venue: string;
  personas: PersonaPresence[];
}

