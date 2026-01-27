# Requirements: Trip Coordinator

**Defined:** 2026-01-27
**Core Value:** Given your bookings and wishlist, Claude generates a logical, geography-optimized itinerary you can actually use.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link

### Trip Management

- [ ] **TRIP-01**: User can create a new trip with name and date range
- [ ] **TRIP-02**: User can edit trip details (name, dates)
- [ ] **TRIP-03**: User can delete a trip
- [ ] **TRIP-04**: User can view list of all their trips
- [ ] **TRIP-05**: User can save trips to their account

### Data Input

- [ ] **INPUT-01**: User can manually add events (flights, hotels, restaurants, activities)
- [ ] **INPUT-02**: User can upload PDF booking confirmations for parsing
- [ ] **INPUT-03**: User can upload screenshots of bookings for parsing
- [ ] **INPUT-04**: System extracts structured data from PDFs (dates, times, locations, confirmation numbers)
- [ ] **INPUT-05**: System extracts structured data from screenshots via OCR
- [ ] **INPUT-06**: User can add fixed events (visiting relatives, scheduled commitments)
- [ ] **INPUT-07**: User can build wishlist of activities by city
- [ ] **INPUT-08**: User can build wishlist of food types/cuisines by city

### AI Generation

- [ ] **AI-01**: Claude generates day-by-day itinerary from bookings + wishlist
- [ ] **AI-02**: Generated itinerary respects fixed time constraints (flights, reservations)
- [ ] **AI-03**: Generated itinerary minimizes geographic backtracking
- [ ] **AI-04**: Generated itinerary respects opening hours of venues
- [ ] **AI-05**: Claude suggests specific activities/restaurants matching wishlist preferences
- [ ] **AI-06**: User can regenerate itinerary with different parameters

### Visualization

- [ ] **VIEW-01**: User can view itinerary as day-by-day text list
- [ ] **VIEW-02**: User can view itinerary as visual timeline/calendar
- [ ] **VIEW-03**: User can view itinerary on map with location pins
- [ ] **VIEW-04**: Map shows routes/paths between locations
- [ ] **VIEW-05**: User can switch between views seamlessly

### Editing

- [ ] **EDIT-01**: User can manually edit event details (time, location, notes)
- [ ] **EDIT-02**: User can drag-and-drop to reorder events
- [ ] **EDIT-03**: User can delete events from itinerary
- [ ] **EDIT-04**: User can add new events to existing itinerary
- [ ] **EDIT-05**: User can chat with Claude to refine itinerary conversationally

### External Data

- [ ] **DATA-01**: System pulls live hours from Google Places API
- [ ] **DATA-02**: System pulls ratings/reviews from Google Places API
- [ ] **DATA-03**: System pulls restaurant data from Yelp API
- [ ] **DATA-04**: Live data displays alongside AI suggestions

### Export & Sharing

- [ ] **EXPORT-01**: User can export itinerary to ICS file
- [ ] **EXPORT-02**: ICS export works with Google Calendar, Apple Calendar, Outlook
- [ ] **EXPORT-03**: User can generate shareable read-only link
- [ ] **EXPORT-04**: User can print/export itinerary as formatted PDF

## v2 Requirements

### Collaboration

- **COLLAB-01**: Multiple users can edit same trip simultaneously
- **COLLAB-02**: Real-time sync of changes across collaborators
- **COLLAB-03**: User can invite others via email

### Advanced Features

- **ADV-01**: Offline mode with cached trip data
- **ADV-02**: Mobile native apps (iOS, Android)
- **ADV-03**: Real-time flight status updates
- **ADV-04**: Budget tracking per trip
- **ADV-05**: Packing list generation

### Integrations

- **INT-01**: OAuth login (Google, Apple)
- **INT-02**: Direct calendar sync (not just export)
- **INT-03**: Email forwarding to auto-import bookings

## Out of Scope

| Feature | Reason |
|---------|--------|
| Booking/purchasing | Planning tool, not booking engine — compete on optimization, not transactions |
| Flight search | Google Flights does this better — we optimize existing bookings |
| Social features | Focus on personal utility, not community building |
| Gamification | Adds complexity without core value |
| Multi-language UI | English first, localization later |
| Cryptocurrency payments | No payment processing in v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| TRIP-01 | Phase 1 | Pending |
| TRIP-02 | Phase 1 | Pending |
| TRIP-03 | Phase 1 | Pending |
| TRIP-04 | Phase 1 | Pending |
| TRIP-05 | Phase 1 | Pending |
| INPUT-01 | Phase 2 | Pending |
| INPUT-06 | Phase 2 | Pending |
| INPUT-07 | Phase 2 | Pending |
| INPUT-08 | Phase 2 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| AI-01 | Phase 4 | Pending |
| AI-02 | Phase 4 | Pending |
| AI-03 | Phase 4 | Pending |
| AI-04 | Phase 4 | Pending |
| AI-05 | Phase 4 | Pending |
| AI-06 | Phase 4 | Pending |
| VIEW-01 | Phase 5 | Pending |
| VIEW-02 | Phase 5 | Pending |
| VIEW-03 | Phase 5 | Pending |
| VIEW-04 | Phase 5 | Pending |
| VIEW-05 | Phase 5 | Pending |
| INPUT-02 | Phase 6 | Pending |
| INPUT-03 | Phase 6 | Pending |
| INPUT-04 | Phase 6 | Pending |
| INPUT-05 | Phase 6 | Pending |
| EDIT-01 | Phase 7 | Pending |
| EDIT-02 | Phase 7 | Pending |
| EDIT-03 | Phase 7 | Pending |
| EDIT-04 | Phase 7 | Pending |
| EDIT-05 | Phase 7 | Pending |
| EXPORT-01 | Phase 8 | Pending |
| EXPORT-02 | Phase 8 | Pending |
| EXPORT-03 | Phase 8 | Pending |
| EXPORT-04 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after roadmap creation*
