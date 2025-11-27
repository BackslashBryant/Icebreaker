# Product Vision

Keep this file current so every agent session starts with the same mental model. Update it whenever the user journey or goals shift.

## 1. Problem & Audience

**Who is the primary user?**
Adults (18+) in shared spaces — campuses, events, coworking spots, dense neighborhoods — who want lightweight, authentic contact without committing to an identity performance. They value: control, subtlety, safety, and a vibe that doesn't try too hard.

**What pain are we solving?**
Other social apps are loud, performative, and permanent. IceBreaker offers a quiet, ephemeral alternative — a moment of connection, not a feed or forever. If other apps are loud nightclubs, IceBreaker is the quiet nod across the room.

**Why now?**
People want real-world connection without the baggage of social graphs, profiles, or permanence. Ephemeral, proximity-based conversation fills a gap between dating apps and anonymous chat.

---

## 2. Core Experience

### Happy-path narrative (step-by-step walkthrough)

1. **Welcome** → "Real world. Real time. Real connections." + "No feed. No followers. Just now." Minimal splash (invite, don't explain). Clear choice to continue or bounce. Brand moment with retro logo.
2. **18+ Consent** → Single checkbox confirmation. Adult space, safety first.
3. **Location Explainer** → Plain-language explainer: approximate, session-based location. User can skip (reduced experience).
4. **Vibe & Tags** → Required current mood (Up for banter / Open to intros / Thinking out loud / Killing time / Surprise me). Optional tags for wavelength hints. Visibility toggle. Skipping tags allowed but reduces discoverability (soft penalty).
5. **Radar** → Ambient presence view showing who's open nearby. Sorted by lightweight compatibility (vibe match, shared tags, proximity). No avatars, no profiles, no pressure.
6. **Chat** → One-tap to start, terminal-style, ephemeral. Ends when proximity breaks or user exits. No history, no threads, no reactions.
7. **Panic** → Always accessible FAB. One tap to exit and alert contacts. Calm, not dramatic.

### Supporting flows (error handling, empty states, success feedback)

- **Empty Radar**: "No one here — yet."
- **GPS denied/off**: Clear, dignified permission states
- **Chat end**: "Connection lost. Chat deleted."
- **Block/Report**: Two taps from Radar or Chat. Categories: Harassment, Spam, Impersonation, Other.
- **Safety exclusion**: Recent Panic or multiple unique reports → temporary hidden from Radar
- **Cooldowns**: Short, session-level timers (15–60 min) after failed/declined invites

### Out of scope (what we explicitly defer)

- **Post-MVP**: Social enrichment via OAuth (Spotify/Reddit/X) for auto-suggesting tags
- **Post-MVP**: Personality/archetype mode (Myers-Briggs-lite)
- **Post-MVP**: Appeals flow, contextual prompts, venue partnerships
- **Post-MVP**: Optional verification (email/phone) for higher trust contexts
- **Post-MVP**: Client-side encryption (feature flag)
- **Post-MVP**: Silent queue — one pending chat request shown after current chat ends (no interruption)
- Dating app features, social graphs, profiles, avatars, follower cues
- Message history, reactions, stickers, threads
- Background tracking, precise location history
- Data collection beyond minimal safety metadata

---

## 3. Feature Inventory

1. **Welcome/Splash Screen** — Brand moment, clear CTAs, graceful exit option
2. **18+ Consent** — Single checkbox, required to proceed
3. **Location Explainer** — Transparent permission request with skip option
4. **Vibe Selection** — Required current mood indicator (5 options)
5. **Tag Selection** — Optional identity hints, clear soft penalty for skipping
6. **Visibility Toggle** — User control over Radar presence
7. **Radar View** — Proximity-based presence visualization (CRT sweep style or accessible list)
8. **Signal Engine** — Lightweight compatibility scoring (vibe match, shared tags, visibility, proximity, safety)
9. **Chat Interface** — Terminal-style, ephemeral 1:1 messaging
10. **Panic Button** — Always-accessible FAB for immediate exit + alert
11. **Block/Report** — Safety controls from Radar and Chat
12. **Profile/Settings** — Visibility controls, emergency contacts, a11y toggles
13. **Safety Moderation** — Rate limiting, one-chat-at-a-time, cooldowns, safety exclusions
14. **Accessibility Modes** — Reduced-motion, high-contrast, keyboard navigation, screen reader support

---

## 4. Success Criteria

### Quantitative targets (metrics, test coverage, performance budgets)

- **Onboarding**: User reaches Radar in **under 30 seconds** (decisive user)
- **Understanding**: New user understands premise **within 10 seconds** on Welcome screen
- **Chat Start**: First chat is **one tap** and feels instant
- **Safety KPIs**: Report rate < 1% of sessions; Panic false-positive rate < 1%; acceptance-to-chat conversion healthy
- **Performance**: Chat starts in < 500ms; Radar updates in < 1s
- **Test Coverage**: ≥80% unit/integration coverage; Playwright smoke tests for critical flows

### Qualitative gates (accessibility, UX reviews, documentation)

- **Brand Vibe**: Every screen feels like "terminal meets Game Boy" — deep navy/charcoal base, neon teal accents, IBM Plex Mono/Space Mono typography
- **Accessibility**: WCAG AA compliance; reduced-motion and high-contrast modes work consistently; keyboard-first navigation; screen reader labels throughout
- **Tone**: Copy matches examples (confident, succinct, slightly playful; never clingy or hypey)
- **Safety**: Panic is obvious and reachable; block/report is two taps; consequences are explainable
- **Ephemerality**: Chats always end cleanly with clear copy; no history or persistence cues
- **Privacy**: No message content stored; approximate location only; minimal metadata

---

## 5. Constraints & Assumptions

### Technical constraints (stack choices, integrations, performance budgets)

- **Privacy-first**: No message content storage; approximate location only; session-scoped data
- **Ephemeral by design**: Sessions expire; visibility is reversible; no long-term transcripts
- **Lightweight scoring**: Signal Engine uses simple, explainable weights (vibe match, shared tags, proximity, visibility)
- **One-chat-at-a-time**: Enforced to prevent spam/abuse
- **Rate limiting**: Soft cooldowns after X failed/declined invites
- **Performance**: Chat latency < 500ms; Radar updates < 1s
- **Browser/Device**: Responsive design; PWA-capable for mobile

### Business or compliance constraints

- **18+ only**: Explicit age confirmation required
- **Location permissions**: Must handle denial gracefully with reduced experience
- **Privacy regulations**: GDPR/CCPA considerations for location and minimal metadata
- **Accessibility**: WCAG AA minimum; keyboard navigation required
- **Safety**: No tolerance for harassment; clear reporting and blocking paths

### Known risks or unknowns (tag @Scout for research if needed)

- **Location accuracy**: How to balance proximity matching with privacy (approximate only)
- **Signal Engine tuning**: Default weights may need A/B testing across contexts (campus vs. conference)
- **Abuse patterns**: How to detect and prevent spam without building surveillance
- **OAuth integrations** (post-MVP): Which providers (Spotify/Reddit/X) are most trusted and feasible
- **Client-side encryption** (post-MVP): Feasibility and UX impact
- **Appeals process** (post-MVP): Lightweight, human-readable review flow

---

## 6. Links & Artifacts

### GitHub issue(s)
- TBD — Create first issue for MVP planning

### Design mocks
- Logo assets: `Docs/Vision/icebreaker_logo_exports/`
- Brand images: `Docs/Vision/Icebreaker - Primary.png`, `Docs/Vision/Icebreaker - Pulse.png`

### Research notes (`docs/research.md`)
- Signal Engine weight tuning
- OAuth provider feasibility (post-MVP)
- Location privacy best practices
- Accessibility compliance verification

### Test Personas (`docs/personas/`)
- Detailed user personas with social media profiles for testing and user research
- Includes IceBreaker profile configurations for each persona
- See `docs/personas/README.md` for overview and usage

### Connection guide (`docs/ConnectionGuide.md`)
- TBD — Initialize with ports, endpoints, services as architecture is defined

### Vision source documents
- `Docs/Vision/IceBreaker — Developer Vision Brief.txt` — North Star
- `Docs/Vision/IceBreaker — Brand & UI Ethos.txt` — Style bible
- `Docs/Vision/IceBreaker — Onboarding Vision.txt` — Buy-in moment
- `Docs/Vision/IceBreaker — Radar & Chat Vision.txt` — Core experience
- `Docs/Vision/IceBreaker — Signal Engine Vision.txt` — Compatibility scoring
- `Docs/Vision/IceBreaker — Safety & Moderation Vision.txt` — Safety guardrails
- `Docs/Vision/IceBreaker — Social Enrichment Vision.txt` — Post-MVP OAuth
- `Docs/Vision/IceBreaker — Silent Queue Vision.txt` — Post-MVP quiet queue for missed connections
- `Docs/Vision/IceBreaker — Main Screens Emotional Map.txt` — Screen-by-screen feel

---

**Process Reminder:** Vector verifies this vision at the start of every feature. If it's outdated, stop and update it before more code lands.

**Decision Rules (when unsure):**
1. Privacy > precision
2. Simplicity > cleverness
3. A11y is the bar (not a bonus)
4. Vibe is the product — if it doesn't feel like IceBreaker, don't do it
5. Choice everywhere — opt-in, opt-out, consequence is soft not punitive

**Metaphors that guide us:**
- A walkie-talkie for nearby humans
- A radar ping that finds the right kind of now
- A match strike that burns bright and fades

**Final word:** Build for **brief, real, human** moments. Keep it quiet, clean, and intentional. If a choice risks the vibe, choose the vibe.

*That's IceBreaker.*
