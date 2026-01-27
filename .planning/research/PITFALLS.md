# Domain Pitfalls

**Domain:** Trip Coordination & Travel Planning Web Application
**Researched:** 2026-01-27
**Confidence:** MEDIUM (based on WebSearch findings cross-referenced with multiple sources)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: AI Hallucination Without Validation Layer

**What goes wrong:** LLM-generated itineraries contain false information - non-existent attractions, incorrect operating hours, invalid booking details, impossible travel times. Research shows AI travel planning tools are error-free only 10% of the time, and regularly provide outdated or incomplete information.

**Why it happens:**
- Claude API and other LLMs have training data cutoffs and can't distinguish true from false information
- LLMs draw only on written content, not real-time map/logistics data
- No validation layer between LLM output and user display
- Overconfidence in LLM capabilities leads to skipping verification steps

**Consequences:**
- Users denied boarding due to missing visa/ESTA requirements
- Travelers arrive at closed/non-existent venues
- Impossible itineraries (distances/times don't work in reality)
- Loss of user trust, negative reviews, potential liability
- Users revert to manual planning, defeating the product's purpose

**Prevention:**
1. **Output Validation Layer** - Implement a validation service that checks LLM output before displaying to users:
   - Verify place existence via Google Places/Yelp APIs
   - Validate travel times with Google Maps Distance Matrix API
   - Cross-check operating hours with real-time data
   - Flag impossible time windows (e.g., 10min to travel 20 miles in city traffic)

2. **Structured Output Validation** - Use JSON Schema validation or Pydantic models with self-correction loops, forcing LLM to retry until output is structurally valid

3. **Ground Truth Integration** - Integrate knowledge graphs or authoritative APIs at inference stage to ground outputs in verifiable facts

4. **User Verification Points** - Add explicit "verify with official source" warnings for critical details (visa requirements, flight times, hotel confirmations)

5. **Incremental Validation** - Validate each component separately (existence, hours, travel time) rather than validating entire itinerary at once

**Detection:**
- Monitor ratio of user corrections to AI suggestions
- Track user abandonment after viewing AI itinerary
- Implement feedback mechanism: "Was this information accurate?"
- Log validation failures from external APIs
- Compare LLM outputs against ground-truth test cases

**Phase Mapping:** Address in Phase 2 (AI Integration) - do not defer validation to later phases

---

### Pitfall 2: Underestimating External API Cost Explosion

**What goes wrong:** API costs spiral out of control as usage grows. Google Maps Platform changed pricing in March 2025, eliminating the $200 monthly credit and reducing free tier from 25,000 to 28,500 monthly map loads. With routing, geocoding, places details, and distance matrix calls per trip, costs can reach $50,000/month for moderate usage.

**Why it happens:**
- Developers prototype with free tiers that disappear at scale
- Multiple API calls per user action (route = geocoding + directions + places + distance matrix)
- No caching strategy, making redundant API calls
- Premium pricing tiers trigger unexpectedly (Claude Sonnet 4.5 doubles cost at 200K+ tokens)
- Map reloads on every state change

**Consequences:**
- Unsustainable burn rate, potential shutdown
- Emergency architecture rewrites under financial pressure
- Feature cuts to reduce API dependency
- Need to pass costs to users, killing price competitiveness

**Prevention:**

**For Maps APIs:**
1. **Pre-compute and cache aggressively** - CARTO demonstrates 999K requests from CDN for every 1K API calls through proper caching
2. **Use Datasets API for large data** (350MB limit) instead of real-time calls
3. **Implement request batching** - Batch geocoding/distance matrix requests
4. **Set billing alerts** at 50%, 75%, 90% of budget thresholds
5. **Consider alternatives** - Radar, MapBox for routing may be more cost-effective
6. **Tile-based rendering** for visualizations instead of dynamic map loads

**For Claude API:**
1. **Prompt caching** - 90% discount on cached tokens; essential for repeated system prompts
2. **Batch API** - 50% discount for non-urgent itinerary generation
3. **Right-size model** - Use Haiku ($1/$5) for parsing, Sonnet ($3/$15) for optimization
4. **Avoid premium context window pricing** - Stay under 200K input tokens to avoid doubled costs
5. **Output length limits** - Constrain response length in prompts to reduce output tokens
6. **Debounce AI calls** - Don't call Claude on every keystroke; wait for user commit

**For Google Places/Yelp:**
1. **Place ID caching** - Cache place details for 30 days per ToS
2. **Autocomplete debouncing** - Wait 300ms after typing stops
3. **Request consolidation** - Fetch multiple place details in single batch call
4. **Field masking** - Only request fields you'll use (reduces cost per request)

**Detection:**
- Daily API cost monitoring dashboard
- Alert on unusual spike (>2x daily average)
- Track API calls per user action
- Monitor cache hit ratio (target >90%)
- Log rejected requests due to budget caps

**Phase Mapping:**
- Phase 1: Set up billing alerts, basic caching
- Phase 2: Implement comprehensive caching strategy before AI goes live
- Phase 3: Optimize based on real usage patterns

---

### Pitfall 3: Fragile Document Parsing (PDF/Screenshot Brittleness)

**What goes wrong:** Document parsing works great in testing with sample PDFs, then fails in production with real-world booking confirmations. Airlines, hotels, and OTAs have dozens of email/PDF formats. Layout changes break extraction. Screenshots have varying quality, rotation, cropping. Extraction accuracy drops from 98% (digital PDFs) to <80% (real-world variety).

**Why it happens:**
- Testing with limited format samples (1-2 airline templates)
- Assumption that all booking confirmations follow standard format
- No fallback when OCR confidence is low
- Structure-dependent extraction (looking for specific field labels/positions)
- Ignoring that airlines update email templates regularly

**Consequences:**
- Users spend more time fixing extraction errors than manual entry would take
- Feature becomes anti-feature; users avoid document upload
- Support burden from "why didn't this work?" tickets
- Negative reviews: "promised auto-extract but it never works"
- Data quality issues cascade into itinerary generation

**Prevention:**

**Multi-layered Extraction Strategy:**
1. **Structured API First** - If user forwards from Gmail/Outlook, attempt structured email parsing before OCR (Gmail API labels booking confirmations)

2. **LLM-based Extraction** - Use Claude with vision for PDFs/screenshots rather than traditional OCR + field extraction:
   - LLMs handle format variations better than template matching
   - Can extract semantic meaning even with layout changes
   - Vision models handle rotated/cropped screenshots
   - Include example extraction in prompt for consistency

3. **Confidence Scoring** - Return confidence per field:
   ```json
   {
     "flight_number": {"value": "UA1234", "confidence": 0.95},
     "date": {"value": "2026-03-15", "confidence": 0.60}
   }
   ```

4. **Human-in-the-Loop for Low Confidence** - Don't auto-fill fields with confidence <0.8; show extracted value as suggestion requiring confirmation

5. **Format Learning** - Log successful extractions with document hash; build format library over time

6. **Fallback to Manual Entry** - Make manual entry UX excellent; don't force broken automation

**Extraction Best Practices:**
- Prefer semantic extraction ("when is the flight?") over structural ("find field labeled 'departure'")
- Test with 50+ real booking confirmations across providers before launch
- Monitor extraction accuracy per provider; warn users if specific airline has issues
- Version extraction prompts; roll back if accuracy drops

**Detection:**
- Track extraction attempts vs. successful field populations
- User correction rate per field type
- Time spent in review/correction phase
- User feedback: "Was extraction helpful?"
- A/B test: extraction vs. direct manual entry

**Phase Mapping:**
- Phase 1: Simple MVP extraction (may be template-based, limited providers)
- Phase 2: LLM-based extraction with confidence scoring
- Phase 3: Format learning and provider-specific optimization
- Continuous: Monitor accuracy, expand format support

---

### Pitfall 4: Timezone Hell in International Travel

**What goes wrong:** Itineraries show wrong times. Flight at 10pm displays as 10am. Hotel check-in time is in user's timezone instead of hotel's. Events scheduled during overnight flights. Times change when user travels and their device timezone updates. Exported ICS files have timezone errors that cause calendar apps to show wrong times.

**Why it happens:**
- Mixing timezone-naive and timezone-aware datetimes in codebase
- Storing times in user's local timezone instead of UTC + timezone identifier
- Not tracking which timezone each event belongs to (departure city ≠ arrival city ≠ activity city)
- Assuming "today" is the same everywhere (date line crossing)
- Frontend rendering in browser timezone without explicit conversion
- ICS export using local timezone instead of VTIMEZONE specifications

**Consequences:**
- Users miss flights, check-ins, reservations
- App unusable for international travel (its primary use case)
- Trust destroyed after first major timezone error
- Support overwhelmed with "wrong time" tickets
- Database corruption when mixing formats

**Prevention:**

**Data Layer:**
1. **Always store in UTC + explicit timezone identifier:**
   ```typescript
   {
     event: "Flight departure",
     utc_datetime: "2026-03-15T18:00:00Z",
     timezone: "America/Los_Angeles",
     display_datetime: "2026-03-15T10:00:00-08:00" // computed, not stored
   }
   ```

2. **Use timezone database libraries** - `date-fns-tz`, `Luxon`, `Temporal` (not plain `Date` objects)

3. **Separate storage concerns:**
   - Flights: departure time in departure timezone, arrival time in arrival timezone
   - Hotels: check-in/out in hotel's timezone
   - Activities: in activity location's timezone

**Business Logic:**
1. **Explicit timezone context for all operations** - Every datetime operation must specify which timezone it's operating in

2. **Detect timezone boundaries:**
   - Flag overnight flights (arrival date ≠ departure date)
   - Warn about date line crossing
   - Handle DST transitions during trip

3. **Display layer converts explicitly:**
   ```typescript
   // BAD: implicit conversion
   const displayTime = new Date(utcTime);

   // GOOD: explicit conversion
   const displayTime = utcToZonedTime(utcTime, eventTimezone);
   ```

**UI/UX:**
1. **Always show timezone indicator** - "10:00 AM PST" not "10:00 AM"

2. **Multi-timezone view for itinerary:**
   - Day 1 (Los Angeles - PST)
   - Day 2 (In flight - crossing timezones)
   - Day 3 (Tokyo - JST)

3. **Relative time helpers** - "in 3 hours" + "10:00 PM local time"

**ICS Export:**
1. **Use VTIMEZONE blocks** - Include full timezone definition in ICS file
2. **Test on all major calendar platforms** - Google Calendar, Outlook, Apple Calendar
3. **Floating times only for all-day events** - Regular events must have timezone

**Testing:**
1. **Edge cases test suite:**
   - Date line crossing (Tokyo → San Francisco)
   - DST transitions during trip
   - Multi-leg flights crossing many zones
   - Same time in different zones

2. **Manual QA in multiple timezones** - Test with device in different timezone than trip locations

**Detection:**
- User reports of wrong times
- Timezone mismatches between frontend and backend logs
- Calendar export complaints
- "This doesn't match my confirmation email" feedback

**Phase Mapping:**
- Phase 1: UTC + timezone storage architecture (foundational)
- All phases: Never compromise on timezone handling
- Pre-launch: Comprehensive timezone testing across edge cases

---

### Pitfall 5: Overcomplicated MVP with Premature Features

**What goes wrong:** Team builds elaborate multi-user collaboration, real-time sync, drag-and-drop timeline, chat, voting, and AI refinement in MVP. Launch takes 6+ months. By the time product ships, team is burned out, budget is exhausted, and market window has closed. Core value proposition is buried under complexity.

**Why it happens:**
- Looking at mature competitors and trying to match all features
- "Just one more thing" scope creep during development
- Confusing "eventually needed" with "MVP required"
- Underestimating complexity of real-time collaboration, undo/redo, timeline UI
- Fear that MVP won't be competitive without all features

**Consequences:**
- Never launch, or launch too late
- Technical debt from rushed complex features
- Budget exhaustion before revenue
- User confusion: what is this app for?
- Maintenance nightmare: every feature is 70% done
- Can't pivot because architecture assumes all features

**Prevention:**

**MVP Ruthlessness:**
1. **Single user first** - Multi-user is a separate product; defer entirely
2. **Text itinerary only** - Visual timeline and maps are v2
3. **No AI refinement chat** - Generate once, let user edit manually
4. **Simple edit, no undo/redo** - Standard form editing, not timeline manipulation
5. **Email export** - ICS export is v2 feature

**True MVP Scope:**
- Upload PDF → Extract data (with manual correction)
- Add fixed events, add wishlist items
- Click "Generate itinerary" → Claude optimizes → Show text schedule
- Edit event details in form
- Save trip to account
- That's it.

**Feature Sequencing:**
- MVP: Prove extraction + AI generation works and provides value
- V2: Maps visualization, ICS export
- V3: Timeline drag-and-drop editing
- V4: Real-time collaboration, shared trips
- V5: Recommendations from Places/Yelp in-app

**Complexity Red Flags:**
- "Real-time collaboration" - Requires WebSockets, CRDTs, conflict resolution
- "Drag-and-drop timeline" - Complex state management, undo/redo, time calculations
- "Chat-based refinement" - Multi-turn conversation state, streaming, context management
- Any of these alone could be the whole MVP

**Decision Framework:**
"Can we validate our core hypothesis without this feature?"
- Core hypothesis: AI can generate better itineraries than manual planning
- Validation needs: extraction + generation + display
- Everything else is optimization or alternate use case

**Detection:**
- Development velocity slowing as features interact
- QA finding bugs across feature boundaries
- Team unsure what's in/out of scope
- Demo takes >5 minutes to show value
- Can't explain product in one sentence

**Phase Mapping:**
- Phase 1: Document extraction + manual trip building
- Phase 2: AI itinerary generation (core hypothesis)
- Phase 3: Visualization improvements (maps, timeline)
- Phase 4+: Collaboration, advanced editing, recommendations

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 6: Naive Distance/Time Calculations

**What goes wrong:** App calculates travel time as straight-line distance / average speed. Shows 30-minute drive that actually takes 2 hours in city traffic. Suggests visiting 8 attractions in a day that would require 12 hours of walking. Doesn't account for traffic patterns, public transit schedules, walking speed variations.

**Why it happens:**
- Using simple distance formulas (haversine) instead of routing APIs
- Not calling Distance Matrix API to get real travel times
- Ignoring time-of-day traffic patterns
- Assuming constant travel speed
- Free tier API limitations leading to approximations

**Prevention:**
1. **Always use routing APIs for time estimates** - Google Distance Matrix, not haversine distance
2. **Include traffic patterns** - Distance Matrix with departure time for traffic modeling
3. **Add buffer time** - Multiply estimated time by 1.25x for safety margin
4. **Validate feasibility** - Flag if daily travel time exceeds 4 hours or walking exceeds 10 miles
5. **Consider transit modes** - Walking time ≠ driving time ≠ public transit time

**Detection:**
- User feedback: "this itinerary is impossible"
- Comparison with Google Maps for same route
- Time budget violations in itinerary

**Phase Mapping:** Phase 2 (AI generation must use real routing data)

---

### Pitfall 7: No Offline Capability for Active Travel

**What goes wrong:** User is on vacation, pulls up itinerary on phone, has no cell coverage, app shows blank screen. All the value disappears when it's needed most.

**Why it happens:**
- Building web-first without offline consideration
- Assuming constant connectivity
- External API dependencies for every view
- No local storage strategy

**Prevention:**
1. **Progressive Web App with Service Worker** - Cache itinerary data and core UI
2. **Local-first architecture** - Store trip data in IndexedDB/localStorage, sync to server
3. **Export to offline formats** - PDF, ICS, Apple Wallet pass
4. **Graceful degradation** - Show cached data with "last updated" timestamp if offline

**Detection:**
- Test in airplane mode
- Monitor error rates in areas with poor connectivity
- User feedback about unavailability

**Phase Mapping:** Phase 3 (after core features work online)

---

### Pitfall 8: Poor State Management for Complex Edit Operations

**What goes wrong:** User drags event to new time on timeline, other events should shift but don't. Undo/redo breaks after a few operations. Edits to one view don't reflect in other views. Multiple components fighting over single piece of state. Performance degrades with >20 events.

**Why it happens:**
- Using local component state instead of centralized state management
- No clear state architecture for complex interactions
- Implementing drag-and-drop without proper state coordination
- Not planning for undo/redo from the start

**Prevention:**

**State Management Strategy:**
1. **Redux Toolkit or Zustand for trip state** - Complex state transitions need predictable state management
2. **Single source of truth** - One canonical trip state, multiple views render from it
3. **Time-travel state from start** - Use `use-travel` hook or Redux for undo/redo
4. **Optimistic updates with rollback** - Apply change immediately, roll back if server rejects

**For Drag-and-Drop:**
1. **Archive mode for grouped changes** - Using `use-travel` with manual archiving, group all updates from one drag operation
2. **Conflict detection** - If dragging event creates overlap, auto-adjust or reject
3. **Debounce server sync** - Don't save to server on every drag; wait for 2s idle

**Architecture:**
```typescript
// Single trip state
const tripState = {
  events: [...],
  constraints: {...},
  optimizationParams: {...}
};

// All views read from this state
<DayView events={tripState.events} />
<TimelineView events={tripState.events} />
<MapView events={tripState.events} />

// All edits update this state through actions
dispatch(moveEvent({id, newTime}));
```

**Detection:**
- Visual inconsistencies between views
- Undo doesn't reverse last action
- Performance profiling shows excessive re-renders
- User complaints about "glitchy" editing

**Phase Mapping:**
- Phase 2: Simple state management (may be component state)
- Phase 3: Redux/Zustand when timeline editing added
- Phase 4: Undo/redo and complex edit operations

---

### Pitfall 9: ICS Export Compatibility Nightmares

**What goes wrong:** Exported ICS files work in Google Calendar, break in Outlook, show wrong times in Apple Calendar. Recurring events don't import. Attachments are stripped. New Outlook for Mac keeps events local instead of syncing. iOS 18 makes it hard to import ICS files at all.

**Why it happens:**
- ICS spec is complex with platform-specific interpretations
- Testing on only one calendar platform
- Not including VTIMEZONE blocks
- Missing required fields
- Using features not universally supported

**Prevention:**

**ICS Export Best Practices:**
1. **Include full VTIMEZONE definitions** - Don't rely on TZID references
2. **Test on all major platforms:**
   - Google Calendar (web, iOS, Android)
   - Outlook (Windows, Mac, web, new Mac client)
   - Apple Calendar (iOS, macOS)
   - Yahoo, AOL for breadth

3. **Keep it simple:**
   - Avoid RECURRENCE rules (each event is unique in travel itinerary)
   - 1MB file size limit (Google Calendar restriction)
   - Don't attach files (not universally supported)

4. **Essential fields:**
   ```
   BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//YourApp//EN
   BEGIN:VTIMEZONE
   [full timezone definition]
   END:VTIMEZONE
   BEGIN:VEVENT
   UID:[unique ID]
   DTSTAMP:[creation time]
   DTSTART;TZID=America/Los_Angeles:20260315T100000
   DTEND;TZID=America/Los_Angeles:20260315T120000
   SUMMARY:[event title]
   LOCATION:[full address]
   DESCRIPTION:[details]
   END:VEVENT
   END:VCALENDAR
   ```

5. **Workarounds for known issues:**
   - iOS 18: Provide alternative "Add to Calendar" buttons with deep links
   - New Outlook for Mac: Warn users that imported events may not sync
   - Offer direct calendar API integration (Google Calendar API, Outlook Graph API)

**Detection:**
- User reports: "events show wrong times"
- Support tickets about import failures
- Test automation on multiple platforms
- Monitor which platforms users are exporting to

**Phase Mapping:**
- Phase 2: Basic ICS export
- Phase 3: Multi-platform compatibility testing and fixes
- Phase 4: Direct calendar API integration as alternative

---

### Pitfall 10: Ignoring Live Data Staleness

**What goes wrong:** App shows restaurant as open, user arrives to find it closed. Google Places says museum hours are 9am-5pm, but it's closed for renovation. Yelp rating from 6 months ago, restaurant closed 3 months ago. User plans around outdated information.

**Why it happens:**
- Caching place details too long
- Not checking "permanently closed" status
- Displaying old data without "last updated" timestamp
- Assuming API data is always current

**Prevention:**

1. **Respect API caching ToS:**
   - Google Places: 30 days max for place details
   - Yelp: Check their specific caching policy
   - Refresh on user demand

2. **Check business status:**
   - Google Places: `business_status` field (OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY)
   - Yelp: `is_closed` field
   - Show warnings if status is not OPERATIONAL

3. **Freshness indicators:**
   - "Hours last verified: 2 days ago"
   - "Call ahead to confirm" for critical reservations
   - Provide direct link to official website/phone

4. **User-generated updates:**
   - "Is this information still accurate?" feedback
   - Crowd-sourced corrections
   - Flag places with high correction rate

5. **Pre-trip validation:**
   - Day before trip, refresh all place data
   - Notify user of any changes (closed, hours different)
   - Suggest alternatives if place is closed

**Detection:**
- User feedback: "place was closed"
- Tracking "permanently closed" encounters
- API error rates (404 for place details)
- Compare your data against current API response

**Phase Mapping:**
- Phase 2: Basic live data integration
- Phase 3: Staleness detection and refresh workflows
- Phase 4: Pre-trip validation and user corrections

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 11: No Map Performance Optimization

**What goes wrong:** Map loads slowly with >100 markers. Browser freezes when rendering routes. Mobile devices overheat. Map tiles fail to load on slow connections.

**Prevention:**
1. **Marker clustering** for >50 markers (Mapbox, Google Maps clustering)
2. **Virtualized rendering** with deck.gl for massive datasets
3. **Lazy load map** - Don't initialize until user clicks "Map View"
4. **Tile-based rendering** instead of real-time API for static maps
5. **WebGL rendering** for better performance (deck.gl, Mapbox GL JS)

**Phase Mapping:** Phase 3 (maps), optimize based on performance profiling

---

### Pitfall 12: Poor Mobile Extraction UX

**What goes wrong:** User opens app on phone, can't upload screenshot easily. Camera capture of physical printout is clunky. Document picker doesn't work on iOS Safari.

**Prevention:**
1. **Native file picker with camera option**
2. **Share target on mobile** - Accept files shared from other apps
3. **Email forwarding** - Give user unique email address to forward confirmations
4. **OCR directly in app** - Capture photo of printed confirmation with in-app camera
5. **Copy-paste text extraction** as fallback

**Phase Mapping:** Phase 1 (extraction UX is core to first impression)

---

### Pitfall 13: Ambiguous Date Parsing

**What goes wrong:** User types "3/4/2026" - is it March 4th or April 3rd? Different regions interpret differently. Extracted dates from PDFs may be DD/MM or MM/DD.

**Prevention:**
1. **Explicit date picker** instead of text input
2. **Show format hint** - "MM/DD/YYYY" or detect user's locale
3. **Parse with locale context** - `date-fns` with locale parameter
4. **Confirm ambiguous dates** - If parsing "3/4/2026", ask: "Did you mean March 4th or April 3rd?"
5. **ISO 8601 internally** - Always store as YYYY-MM-DD

**Phase Mapping:** Phase 1 (parsing is immediate user interaction)

---

### Pitfall 14: Over-Optimizing Before Understanding Use Patterns

**What goes wrong:** Team spends weeks implementing complex itinerary optimization algorithm with simulated annealing, then learns users just want chronological list by location. Over-engineered features nobody uses.

**Prevention:**
1. **Start with simple heuristics:**
   - Group by neighborhood
   - Sort by time windows
   - Minimize backtracking
2. **Measure before optimizing** - Instrument: "Was this itinerary helpful?"
3. **A/B test algorithms** - Simple vs. complex, measure which users prefer
4. **Understand use cases** - Interview users about what "optimized" means to them

**Phase Mapping:** Phase 2 (start simple, iterate based on feedback)

---

### Pitfall 15: No Clear Error Recovery for Parsing Failures

**What goes wrong:** Document parsing fails, user sees "Error: extraction failed", stuck with no way forward. User doesn't know if they should try different file format or give up.

**Prevention:**
1. **Graceful fallback to manual entry** - "We couldn't extract automatically, but you can enter details manually"
2. **Partial extraction handling** - Show what was successfully extracted, let user fill in gaps
3. **Helpful error messages:**
   - "This looks like a screenshot - try uploading the PDF attachment instead"
   - "This format isn't supported yet, but you can copy-paste the details below"
4. **Retry with different method** - "Try taking a clearer photo" with tips
5. **Report format** - "Help us support this airline - send us this email" (crowd-source format learning)

**Phase Mapping:** Phase 1 (UX for failure is as important as success case)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Document Parsing (Phase 1) | Over-reliance on template matching; brittleness to format variations | Use LLM-based semantic extraction; test with 50+ real booking confirmations |
| AI Integration (Phase 2) | Hallucinated itinerary details; no validation layer | Implement validation service checking place existence, hours, travel times before display |
| AI Integration (Phase 2) | API cost explosion from lack of caching and batching | Implement prompt caching (90% savings), batch API (50% savings), aggressive response caching |
| Maps/Timeline (Phase 3) | Performance issues with 50+ markers/events | Use marker clustering, lazy loading, virtualized rendering |
| Maps/Timeline (Phase 3) | Fragile timezone handling causing wrong times | UTC + timezone storage from start; explicit timezone context on all operations; test date line crossing |
| Editing (Phase 3/4) | Complex state management for drag-and-drop with undo/redo | Use Redux Toolkit or Zustand with time-travel from start; manual archive mode for grouped operations |
| Collaboration (Phase 4+) | Real-time sync conflicts and data races | Implement CRDTs; defer this entire phase if possible (not MVP) |
| Export (Phase 2/3) | ICS compatibility across calendar platforms | Test on Google/Outlook/Apple; include VTIMEZONE blocks; consider direct calendar API integration |
| Live Data (Phase 2/3) | Stale hours/closure data from over-caching | Respect API caching limits; check business_status; add "last verified" timestamps |

---

## Sources

**AI Hallucination and Validation:**
- [The 4 Most Common Mistakes AI Makes When Planning Travel - AFAR](https://www.afar.com/magazine/the-most-common-mistakes-ai-makes-when-planning-travel)
- [Hallucination Detection and Mitigation in Large Language Models (arxiv.org)](https://arxiv.org/pdf/2601.09929)
- [LLM Outputs - Hallucination Detection of Structured Data From LLMs](https://www.llmoutputs.com/)

**API Costs:**
- [The true cost of the Google Maps API and how Radar compares in 2026](https://radar.com/blog/google-maps-api-cost)
- [Google Maps Platform pricing overview (Google Developers)](https://developers.google.com/maps/billing-and-pricing/overview)
- [Claude API Pricing Guide 2026 (AI Free API)](https://www.aifreeapi.com/en/posts/claude-api-pricing-per-million-tokens)
- [Claude AI Pricing 2026: The Ultimate Guide (Global GPT)](https://www.glbgpt.com/hub/claude-ai-pricing-2026-the-ultimate-guide-to-plans-api-costs-and-limits/)

**Document Parsing:**
- [LLMs for Structured Data Extraction from PDFs in 2026 (Unstract)](https://unstract.com/blog/comparing-approaches-for-using-llms-for-structured-data-extraction-from-pdfs/)
- [AI-Powered OCR for flight bookings (Parseur)](https://parseur.com/extract-data/flight-booking)
- [OCR Benchmark: Text Extraction / Capture Accuracy [2026]](https://research.aimultiple.com/ocr-accuracy/)

**Itinerary Optimization:**
- [Personalized Tour Itinerary Recommendation Algorithm (MDPI)](https://www.mdpi.com/2076-3417/14/12/5195)
- [Travel itinerary problem (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0191261515302125)

**Map Performance:**
- [Visualize massive datasets (CARTO Documentation)](https://docs.carto.com/carto-for-developers/guides/visualize-massive-datasets)
- [deck.gl](https://deck.gl/)

**State Management:**
- [7 Top React State Management Libraries in 2026 (Trio)](https://trio.dev/7-top-react-state-management-libraries/)
- [use-travel: React Hook for state time travel (GitHub)](https://github.com/mutativejs/use-travel)

**Timezone Handling:**
- [Timezone handling in booking systems (Laracasts)](https://laracasts.com/discuss/channels/code-review/help-with-booking-system-timezone-offsets)
- [Time Zone Troubleshooting Guide (Calendly)](https://community.calendly.com/how-do-i-40/time-zone-troubleshooting-guide-242)

**ICS Export:**
- [Google Calendar ICS Files: Fix Single Event Export Failures](https://add-to-calendar-pro.com/articles/google-calendar-ics-files)
- [Adding .ics file to a Google Calendar via new Outlook doesn't sync (Microsoft)](https://learn.microsoft.com/en-us/answers/questions/5596110/adding-ics-file-to-a-google-calendar-via-new-outlo)
- [.ics file can't import to Calendar (Apple Community)](https://discussions.apple.com/thread/255910569)

**Travel App Design:**
- [Why Most Travel Planning Startups Miss the Mark (Travel Massive)](https://www.travelmassive.com/posts/why-most-travel-planning-startups-miss-the-mark-554943365)
- [7 travel technology trends driving tourism in 2026 (Coaxsoft)](https://coaxsoft.com/blog/tech-travel-trends-innovation)

**Collaboration:**
- [Real-time Multiplayer Collaboration is a Must in Modern Applications (DEV Community)](https://dev.to/vladi-stevanovic/real-time-multiplayer-collaboration-is-a-must-in-modern-applications-10ml)
- [5 Best Tools for Group Trip Planning in 2026 (SquadTrip)](https://squadtrip.com/guides/best-tools-for-group-trip-planning/)
