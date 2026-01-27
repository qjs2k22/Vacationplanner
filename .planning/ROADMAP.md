# Roadmap: Trip Coordinator

## Overview

This roadmap delivers an AI-powered trip coordination web app in 8 phases. Start with core infrastructure and manual trip management (Phase 1), add wishlist building with live place data (Phase 2), then layer in the core differentiator - Claude-powered itinerary generation with validation (Phase 3). Visualize trips through map and timeline views (Phase 4), add document parsing for booking uploads (Phase 5), enable calendar export and sharing (Phase 6), allow conversational refinement (Phase 7), and finish with drag-and-drop editing plus offline access (Phase 8). Phases are designed to enable parallel work where dependencies allow, proving core value before investing in complex features.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Core Infrastructure & Authentication** - User accounts, trip CRUD, foundation
- [ ] **Phase 2: Manual Input & Wishlist Building** - Add events manually, build wishlist with live place data
- [ ] **Phase 3: Live Data Integration** - Google Places and Yelp APIs with caching
- [ ] **Phase 4: AI Itinerary Generation** - Claude generates optimized schedules with validation
- [ ] **Phase 5: Map & Timeline Visualization** - Interactive map, day-by-day timeline views
- [ ] **Phase 6: Document Parsing** - Upload and extract booking confirmations
- [ ] **Phase 7: Itinerary Editing** - Manual editing and drag-and-drop refinement
- [ ] **Phase 8: Export & Sharing** - ICS calendar export and shareable links

## Phase Details

### Phase 1: Core Infrastructure & Authentication
**Goal**: Users can securely manage trips and manually add events
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, TRIP-01, TRIP-02, TRIP-03, TRIP-04, TRIP-05
**Success Criteria** (what must be TRUE):
  1. User can create account with email/password and authenticate successfully
  2. User session persists across browser refresh without re-login
  3. User can log out from any page and session ends immediately
  4. User can reset forgotten password via email link
  5. User can create a new trip with name and date range
  6. User can view list of all their trips with basic metadata
  7. User can edit trip details or delete trips from their account
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 2: Manual Input & Wishlist Building
**Goal**: Users can add fixed events and build wishlist of desired activities
**Depends on**: Phase 1 (requires trip infrastructure)
**Requirements**: INPUT-01, INPUT-06, INPUT-07, INPUT-08
**Success Criteria** (what must be TRUE):
  1. User can manually add events with time, location, and type (flight, hotel, restaurant, activity)
  2. User can add fixed events like visiting relatives or scheduled commitments
  3. User can build wishlist of activities organized by city
  4. User can build wishlist of food types/cuisines organized by city
  5. Events and wishlist items persist to database and display on trip detail page
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 3: Live Data Integration
**Goal**: System pulls real-time place data with aggressive caching to control costs
**Depends on**: Phase 2 (requires wishlist infrastructure)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. System pulls live business hours from Google Places API for wishlist items
  2. System pulls ratings and reviews from Google Places API
  3. System pulls restaurant data from Yelp API
  4. Live data displays alongside wishlist items in UI
  5. API responses cached with appropriate TTLs to prevent cost explosion
  6. Billing alerts configured at 50%, 75%, 90% thresholds
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 4: AI Itinerary Generation
**Goal**: Claude generates optimized day-by-day itineraries that respect constraints and geography
**Depends on**: Phase 3 (requires live data for validation)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. User clicks "Generate Itinerary" and Claude creates day-by-day schedule from bookings and wishlist
  2. Generated itinerary respects fixed time constraints (flights, reservations, visiting relatives)
  3. Generated itinerary minimizes geographic backtracking between locations
  4. Generated itinerary respects opening hours and business hours of venues
  5. Claude suggests specific activities and restaurants matching wishlist preferences
  6. User can regenerate itinerary with different parameters or preferences
  7. Validation service cross-checks AI outputs with live APIs to prevent hallucinations
  8. Itinerary displays with confidence indicators and "verify with source" warnings
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 5: Map & Timeline Visualization
**Goal**: Users see itinerary as interactive map and visual timeline
**Depends on**: Phase 4 (requires generated itinerary data)
**Requirements**: VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05
**Success Criteria** (what must be TRUE):
  1. User can view itinerary as day-by-day text list with times and locations
  2. User can view itinerary as visual timeline or calendar view
  3. User can view itinerary on interactive map with location pins
  4. Map shows routes and paths between sequential locations
  5. User can switch between text, timeline, and map views seamlessly
  6. Views display correctly on mobile devices with responsive layout
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 6: Document Parsing
**Goal**: Users upload booking PDFs/screenshots and system extracts structured data
**Depends on**: Phase 2 (adds to existing manual entry capability)
**Requirements**: INPUT-02, INPUT-03, INPUT-04, INPUT-05
**Success Criteria** (what must be TRUE):
  1. User can upload PDF booking confirmations (flights, hotels, restaurants)
  2. User can upload screenshots of booking confirmations
  3. System extracts structured data from PDFs (dates, times, locations, confirmation numbers)
  4. System extracts structured data from screenshots using OCR or vision API
  5. Extracted data displays with confidence scores per field
  6. User can manually correct low-confidence extractions before saving
  7. System gracefully falls back to manual entry if parsing fails
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 7: Itinerary Editing
**Goal**: Users refine itineraries through manual editing and drag-and-drop
**Depends on**: Phase 5 (requires timeline UI for drag-and-drop)
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05
**Success Criteria** (what must be TRUE):
  1. User can manually edit event details (time, location, notes) via forms
  2. User can drag-and-drop events to reorder them on timeline
  3. User can delete events from itinerary
  4. User can add new events to existing itinerary
  5. User can chat with Claude to refine itinerary conversationally ("move dinner earlier", "add more museums")
  6. Changes sync immediately with undo/redo support
  7. Edits persist to database and reflect across all views (text, timeline, map)
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 8: Export & Sharing
**Goal**: Users export itineraries to calendar apps and share with others
**Depends on**: Phase 5 (requires complete itinerary data structure)
**Requirements**: EXPORT-01, EXPORT-02, EXPORT-03, EXPORT-04
**Success Criteria** (what must be TRUE):
  1. User can export itinerary to ICS file format
  2. ICS export imports correctly to Google Calendar, Apple Calendar, and Outlook
  3. ICS includes proper timezone handling with VTIMEZONE blocks
  4. User can generate shareable read-only link for trip
  5. Shareable link displays itinerary without requiring authentication
  6. User can print or export itinerary as formatted PDF
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Infrastructure & Authentication | 0/TBD | Not started | - |
| 2. Manual Input & Wishlist Building | 0/TBD | Not started | - |
| 3. Live Data Integration | 0/TBD | Not started | - |
| 4. AI Itinerary Generation | 0/TBD | Not started | - |
| 5. Map & Timeline Visualization | 0/TBD | Not started | - |
| 6. Document Parsing | 0/TBD | Not started | - |
| 7. Itinerary Editing | 0/TBD | Not started | - |
| 8. Export & Sharing | 0/TBD | Not started | - |
