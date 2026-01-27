# Trip Coordinator

## What This Is

A web app for coordinating travel. Upload booking documents (flights, restaurants, events), add fixed commitments like visiting relatives, build a wishlist of activities and food types by city, and let Claude generate an optimized itinerary that respects time constraints and minimizes geographic backtracking. View your trip as a day-by-day itinerary, visual timeline, or map with routes. Refine through conversation with Claude or drag-and-drop editing. Export to ICS for your calendar. Save trips to your account across sessions.

## Core Value

Given your bookings and wishlist, Claude generates a logical, geography-optimized itinerary you can actually use.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Parse booking documents (PDFs, screenshots) into structured data
- [ ] Extract flight info, restaurant reservations, event tickets
- [ ] Add fixed events manually (visiting relatives, scheduled commitments)
- [ ] Build wishlist of activities and food types by city
- [ ] Claude generates optimized itinerary from inputs
- [ ] Route optimization respects time windows (flights, reservations, opening hours)
- [ ] Route optimization minimizes geographic backtracking
- [ ] Day-by-day text itinerary view
- [ ] Visual timeline view
- [ ] Map view with routes between locations
- [ ] Refine itinerary via chat with Claude
- [ ] Manual drag-and-drop editing of itinerary
- [ ] Export to ICS format
- [ ] User accounts with authentication
- [ ] Save and load trips
- [ ] Live data integration for hours, reviews, ratings (Google/Yelp)

### Out of Scope

- Mobile native app — web-first, mobile can come later
- Booking/purchasing — this is a planning tool, not a booking engine
- Group/shared trips — single user for now
- Offline mode — requires internet for AI and live data

## Context

This is a personal tool built for reuse across multiple trips. The user uploads existing bookings (often as screenshots or PDFs), adds things they want to do, and gets an AI-generated plan that makes geographic sense.

Key insight: flights define the skeleton (where and when), fixed events pin certain times, and the wishlist fills the gaps. Claude's job is to slot wishlist items into the gaps intelligently.

## Constraints

- **AI**: Claude API — all AI features (parsing, research, generation, refinement) use Anthropic's Claude
- **Interface**: Web application — browser-based, accessible anywhere
- **Data**: Hybrid approach — Claude for suggestions and reasoning, live APIs (Google Places, Yelp) for current hours/reviews/ratings

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over native | Accessible anywhere, faster to build | — Pending |
| Claude API for AI | User preference, strong reasoning capabilities | — Pending |
| Hybrid data (Claude + live APIs) | Best of both: Claude's reasoning + current real-world data | — Pending |
| User accounts over local storage | Reusable tool, access from anywhere | — Pending |

---
*Last updated: 2026-01-27 after initialization*
