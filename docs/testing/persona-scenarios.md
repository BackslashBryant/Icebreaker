# Persona Test Scenarios

This document defines test scenarios for each persona's primary use case, including expected interactions, outcomes, and edge cases to test.

## Test Scenario Structure

Each persona scenario includes:
- **Primary Use Case**: Main scenario to test
- **Setup**: Required test data and conditions
- **Steps**: Detailed test steps
- **Expected Outcomes**: What should happen
- **Edge Cases**: Additional scenarios to test

---

## Core Test Personas

### Maya Patel - Anxious First-Year Student

**Primary Use Case**: Campus library study session with shared tag compatibility

**Setup**:
- Location: University campus library (same coordinates as Zoe)
- Vibe: `thinking`
- Tags: `["Quietly Curious", "Overthinking Things"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "thinking" vibe + 2-3 tags
2. Verify handle is displayed (anxious user verification)
3. Navigate to Radar
4. Verify Maya appears on Radar
5. Verify Zoe appears on Radar (shared "Overthinking Things" tag)
6. Verify shared tag boosts signal score (Maya + Zoe compatibility)
7. Toggle visibility off/on (anxious user behavior)
8. Initiate chat with Zoe
9. Verify ephemeral chat ending feels clean
10. Verify panic button is accessible
11. **Complete persona feedback questionnaire** (see `docs/testing/persona-questionnaire.md` - Maya Patel questions)

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Maya appears on Radar
- ✅ Zoe appears on Radar with boosted signal score (shared tag)
- ✅ Visibility toggle works as expected
- ✅ Ephemeral chat ending reduces anxiety
- ✅ Panic button is accessible

**Edge Cases**:
- Maya toggles visibility off mid-chat
- Maya uses panic button during chat
- Maya skips location permission (reduced experience)
- Maya selects no tags (soft penalty)

---

### Ethan Chen - Socially Anxious Sophomore

**Primary Use Case**: Campus coffee shop proximity matching with tech tag compatibility

**Setup**:
- Location: Campus coffee shop (same coordinates as Marcus)
- Vibe: `intros`
- Tags: `["Tech curious", "Quietly Curious"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "intros" vibe + tech tags
2. Navigate to Radar
3. Verify Ethan appears on Radar
4. Verify Marcus appears on Radar (shared "Tech curious" tag)
5. Verify shared tag boosts signal score (Ethan + Marcus compatibility)
6. Initiate chat with Marcus
7. Verify one-on-one chat format (avoids group dynamics)
8. Verify ephemeral chat ending feels clean
9. Verify panic button is accessible

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Ethan appears on Radar
- ✅ Marcus appears on Radar with boosted signal score (shared tag)
- ✅ One-on-one chat format works (no group pressure)
- ✅ Ephemeral chat ending reduces anxiety
- ✅ Panic button is accessible

**Edge Cases**:
- Ethan initiates chat but Marcus declines (cooldown triggers)
- Ethan uses panic button during chat
- Ethan skips location permission (reduced experience)
- Multiple "intros" users appear (signal score prioritization)

---

### Zoe Kim - Overthinking Junior

**Primary Use Case**: Campus event with "surprise" vibe compatibility and shared tag matching

**Setup**:
- Location: Student union / campus event (same coordinates as Maya)
- Vibe: `surprise` ("Surprise me")
- Tags: `["Overthinking Things", "Lo-fi head"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "surprise" vibe + overthinking tags
2. Navigate to Radar
3. Verify Zoe appears on Radar
4. Verify Maya appears on Radar (shared "Overthinking Things" tag)
5. Verify shared tag boosts signal score (Zoe + Maya compatibility)
6. Verify "surprise" vibe is compatible with all other vibes
7. Initiate chat with Maya
8. Verify ephemeral chat design (no history to overthink)
9. Verify clean chat ending (reduces overthinking)
10. Toggle visibility off if overwhelmed

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Zoe appears on Radar
- ✅ Maya appears on Radar with boosted signal score (shared tag)
- ✅ "Surprise" vibe is compatible with all vibes
- ✅ Ephemeral chat design prevents overthinking
- ✅ Clean chat ending reduces overthinking
- ✅ Visibility toggle works when overwhelmed

**Edge Cases**:
- Zoe toggles visibility off mid-chat
- Zoe initiates chat with incompatible vibe user ("surprise" should still work)
- Zoe skips location permission (reduced experience)
- Multiple users with shared tags (signal score prioritization)

---

### Marcus Thompson - Remote Worker

**Primary Use Case**: Coworking space proximity matching with professional boundaries

**Setup**:
- Location: Coworking space (different floor, same building as Ethan)
- Vibe: `intros`
- Tags: `["Builder brain", "Tech curious"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "intros" vibe + builder tags
2. Navigate to Radar
3. Verify Marcus appears on Radar
4. Verify Ethan appears on Radar (shared "Tech curious" tag, different floor)
5. Verify proximity matching works across floors (same building)
6. Verify shared tag boosts signal score (Marcus + Ethan compatibility)
7. Initiate chat with Ethan
8. Verify one-chat-at-a-time enforcement (professional boundaries)
9. Verify ephemeral chat ending feels appropriate
10. Verify no LinkedIn follow-up pressure

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Marcus appears on Radar
- ✅ Ethan appears on Radar with boosted signal score (shared tag, different floor)
- ✅ Proximity matching works across floors
- ✅ One-chat-at-a-time enforcement works (professional boundaries)
- ✅ Ephemeral chat ending feels appropriate
- ✅ No permanent connection pressure

**Edge Cases**:
- Marcus tries to initiate second chat while first is active (should be blocked)
- Marcus and Ethan are on different buildings (proximity threshold)
- Marcus skips location permission (reduced experience)
- Multiple "intros" users in coworking space (signal score prioritization)

---

### Casey Rivera - Creative Professional

**Primary Use Case**: Art gallery opening event with creative tag compatibility

**Setup**:
- Location: Art gallery opening (same coordinates as other event attendees)
- Vibe: `banter`
- Tags: `["Creative Energy", "Here for the humans"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "banter" vibe + creative tags
2. Navigate to Radar
3. Verify Casey appears on Radar
4. Verify other "banter" users appear on Radar
5. Verify event/venue proximity matching works
6. Verify creative tag compatibility
7. Initiate chat with compatible user
8. Verify ephemeral chat ending feels appropriate
9. Verify no Instagram follow-up pressure
10. Verify one-chat-at-a-time enforcement

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Casey appears on Radar
- ✅ Other "banter" users appear on Radar
- ✅ Event/venue proximity matching works
- ✅ Creative tag compatibility works
- ✅ Ephemeral chat ending feels appropriate
- ✅ No permanent social commitment pressure

**Edge Cases**:
- Casey tries to initiate second chat while first is active (should be blocked)
- Casey skips location permission (reduced experience)
- Multiple "banter" users at event (signal score prioritization)
- Casey leaves event (proximity breaks, chat ends)

---

## Market Research Personas

### River Martinez - Urban Neighborhood Resident

**Primary Use Case**: Dense urban neighborhood proximity matching

**Setup**:
- Location: Dense urban neighborhood (apartment building/café)
- Vibe: `intros`
- Tags: `["Quietly Curious", "Here for the humans"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "intros" vibe + local tags
2. Navigate to Radar
3. Verify River appears on Radar
4. Verify other "intros" users in neighborhood appear on Radar
5. Verify dense urban proximity matching works
6. Initiate chat with nearby neighbor
7. Verify ephemeral chat ending feels appropriate
8. Verify no Nextdoor/Facebook follow-up pressure

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ River appears on Radar
- ✅ Other neighborhood users appear on Radar
- ✅ Dense urban proximity matching works
- ✅ Ephemeral chat ending feels appropriate
- ✅ No permanent neighbor relationship pressure

**Edge Cases**:
- River skips location permission (reduced experience)
- Multiple neighbors in same building (proximity prioritization)
- River leaves neighborhood (proximity breaks, chat ends)

---

### Alex Kim - Tech Conference Attendee

**Primary Use Case**: Tech conference networking with ephemeral connections

**Setup**:
- Location: Tech conference (same coordinates as other attendees)
- Vibe: `banter`
- Tags: `["Tech curious", "Builder brain"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "banter" vibe + tech tags
2. Navigate to Radar
3. Verify Alex appears on Radar
4. Verify other "banter" or "intros" users at conference appear on Radar
5. Verify event/conference proximity matching works
6. Verify tech tag compatibility
7. Initiate chat with compatible attendee
8. Verify ephemeral chat ending feels appropriate
9. Verify no LinkedIn exchange pressure
10. Verify no business card swap pressure

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Alex appears on Radar
- ✅ Other conference attendees appear on Radar
- ✅ Event/conference proximity matching works
- ✅ Tech tag compatibility works
- ✅ Ephemeral chat ending feels appropriate
- ✅ No LinkedIn connection pressure

**Edge Cases**:
- Alex leaves conference (proximity breaks, chat ends)
- Multiple tech conference attendees (signal score prioritization)
- Alex skips location permission (reduced experience)

---

### Jordan Park - Privacy-Focused Professional

**Primary Use Case**: Privacy-first coworking connections with visibility control

**Setup**:
- Location: Coworking space / café
- Vibe: `thinking`
- Tags: `["Tech curious", "Quietly Curious"]`
- Visibility: `false` (privacy-focused)

**Test Steps**:
1. Complete onboarding with "thinking" vibe + minimal tags
2. Toggle visibility OFF (privacy-first)
3. Navigate to Radar
4. Verify Jordan does NOT appear on Radar (visibility off)
5. Toggle visibility ON selectively
6. Verify Jordan appears on Radar
7. Verify privacy-respecting signal scoring
8. Initiate chat with privacy-respecting user
9. Verify ephemeral chat design (no data trail)
10. Verify no message content storage

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Visibility toggle OFF works (Jordan hidden from Radar)
- ✅ Visibility toggle ON works (Jordan appears on Radar)
- ✅ Privacy-respecting signal scoring works
- ✅ Ephemeral chat design verified (no data trail)
- ✅ No message content storage verified

**Edge Cases**:
- Jordan toggles visibility on/off frequently
- Jordan skips location permission (privacy-conscious)
- Jordan verifies no data persistence after chat ends
- Multiple privacy-focused users (signal score respects privacy)

---

### Sam Taylor - Outgoing Introvert

**Primary Use Case**: Music venue event socializing without drain

**Setup**:
- Location: Music venue / local event (same coordinates as other attendees)
- Vibe: `banter`
- Tags: `["Creative Energy", "Here for the humans"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "banter" vibe + creative tags
2. Navigate to Radar
3. Verify Sam appears on Radar
4. Verify other "banter" users at event appear on Radar
5. Verify event/venue proximity matching works
6. Verify creative tag compatibility
7. Initiate chat with compatible attendee
8. Verify ephemeral chat design (preserves social energy)
9. Verify clean chat ending (no Instagram follow pressure)
10. Verify social energy preservation

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Sam appears on Radar
- ✅ Other event attendees appear on Radar
- ✅ Event/venue proximity matching works
- ✅ Ephemeral chat design preserves social energy
- ✅ Clean chat ending reduces drain
- ✅ No permanent social commitment pressure

**Edge Cases**:
- Sam leaves event (proximity breaks, chat ends)
- Multiple "banter" users at event (signal score prioritization)
- Sam skips location permission (reduced experience)

---

### Morgan Davis - Graduate Student & Researcher

**Primary Use Case**: Academic conference intellectual connections

**Setup**:
- Location: University library / research lab / academic conference
- Vibe: `thinking`
- Tags: `["Big Sci-Fi Brain", "Overthinking Things"]`
- Visibility: `true`

**Test Steps**:
1. Complete onboarding with "thinking" vibe + research tags
2. Navigate to Radar
3. Verify Morgan appears on Radar
4. Verify other "thinking" users appear on Radar
5. Verify academic conference proximity matching works
6. Verify research tag compatibility
7. Initiate chat with compatible researcher
8. Verify ephemeral chat design (no academic Twitter pressure)
9. Verify clean chat ending (no ResearchGate follow pressure)
10. Verify intellectual connection quality

**Expected Outcomes**:
- ✅ Onboarding completes successfully
- ✅ Morgan appears on Radar
- ✅ Other researchers appear on Radar
- ✅ Academic conference proximity matching works
- ✅ Research tag compatibility works
- ✅ Ephemeral chat design avoids academic Twitter pressure
- ✅ Clean chat ending avoids ResearchGate follow pressure

**Edge Cases**:
- Morgan leaves conference (proximity breaks, chat ends)
- Multiple researchers at conference (signal score prioritization)
- Morgan skips location permission (reduced experience)

---

## Cross-Persona Test Scenarios

### Shared Tag Compatibility
**Scenario**: Test signal score boost with shared tags
- **Maya + Zoe**: Both share "Overthinking Things" tag
- **Ethan + Marcus**: Both share "Tech curious" tag
- **Expected**: Signal scores boosted for shared tags

### Proximity Matching
**Scenario**: Test proximity matching across different scenarios
- **Same Building, Different Floors**: Marcus + Ethan (coworking space)
- **Same Event**: Casey + Alex (art gallery + tech conference)
- **Same Campus**: Maya + Zoe + Ethan (university campus)
- **Expected**: Proximity matching works appropriately

### Vibe Compatibility
**Scenario**: Test "surprise" vibe compatibility with all other vibes
- **Zoe (surprise) + Maya (thinking)**: Should be compatible
- **Zoe (surprise) + Ethan (intros)**: Should be compatible
- **Zoe (surprise) + Casey (banter)**: Should be compatible
- **Expected**: "Surprise" vibe works with all other vibes

### Ephemeral Chat Endings
**Scenario**: Test clean chat endings for all personas
- **Anxious Users**: Maya, Ethan, Zoe (reduces anxiety)
- **Professional Users**: Marcus, Casey, Alex, Morgan (no permanent connections)
- **Privacy-Conscious**: Jordan (no data trail)
- **Expected**: All personas appreciate clean, ephemeral endings

---

## Feedback Collection

After each persona test scenario, complete the persona-specific questionnaire:
- **Questionnaire**: `docs/testing/persona-questionnaire.md`
- **Process**: Answer questions truthfully as the persona would
- **Timing**: Complete immediately after testing while experience is fresh
- **Documentation**: Record feedback in `docs/testing/persona-feedback.md`

**Feedback Categories**:
- **Onboarding Experience**: Clarity, comfort, pressure
- **Radar Discovery**: Understanding, control, safety
- **Chat Interaction**: Ease, ephemerality, endings
- **Overall Experience**: Brand, anxiety reduction, privacy
- **Persona-Specific**: Tailored to persona's concerns and use case

---

**Last Updated**: 2025-01-27  
**Next Steps**: Implement E2E tests (`tests/e2e/personas/`) and integrate questionnaire completion

