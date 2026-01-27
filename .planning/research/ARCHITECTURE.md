# Architecture Patterns: Trip Coordination/Travel Planning System

**Domain:** Travel Planning & Itinerary Coordination Web Application
**Researched:** 2026-01-27
**Confidence:** MEDIUM (WebSearch-based with multiple source verification)

## Executive Summary

Modern trip coordination systems in 2026 use a **multi-tier architecture** combining specialized AI agents, document processing pipelines, real-time visualization components, and external API integrations. The architecture separates concerns into distinct layers: presentation (frontend with map/timeline views), orchestration (AI-powered itinerary generation), data processing (document parsing and normalization), and persistence (structured trip storage).

**Key architectural decision:** Your system requires a **hybrid architecture** combining:
1. **Serverless microservices** for AI/document processing (compute-intensive, variable load)
2. **Long-running services** for WebSocket-based real-time collaboration
3. **Client-heavy UI** for drag-and-drop timeline manipulation
4. **Event-driven coordination** between components

## Recommended Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Upload UI    │  │ Timeline View│  │  Map Visualization      │  │
│  │ (PDF/Image)  │  │ (Drag-Drop)  │  │  (Routing & Markers)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────────┘  │
│         │                  │                      │                  │
└─────────┼──────────────────┼──────────────────────┼──────────────────┘
          │                  │                      │
          │            WebSocket/SSE          REST API
          │                  │                      │
┌─────────┼──────────────────┼──────────────────────┼──────────────────┐
│         │           API GATEWAY LAYER             │                  │
│         │  (Routing, Auth, Rate Limiting)         │                  │
│         ▼                  ▼                      ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Document   │  │  Itinerary   │  │  External API Gateway    │  │
│  │   Parser     │  │  Optimizer   │  │  (Places/Maps/Weather)   │  │
│  │   Service    │  │  Service     │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                  │                      │                  │
│         │                  │                      │                  │
│  ┌──────┴──────────────────┴──────────────────────┴───────────────┐ │
│  │                    Event Bus / Message Queue                    │ │
│  │              (Redis Pub/Sub or AWS EventBridge)                 │ │
│  └──────────┬──────────────┬──────────────────────┬────────────────┘ │
│             │              │                      │                  │
└─────────────┼──────────────┼──────────────────────┼──────────────────┘
              │              │                      │
┌─────────────┼──────────────┼──────────────────────┼──────────────────┐
│             │         DATA LAYER                  │                  │
│      ┌──────▼──────┐  ┌────▼─────────┐  ┌────────▼──────────┐      │
│      │  Document   │  │  Trip/Event  │  │  User Accounts    │      │
│      │  Storage    │  │  Database    │  │  & Sessions       │      │
│      │  (S3/Blob)  │  │  (Postgres)  │  │  (Redis/Cognito)  │      │
│      └─────────────┘  └──────────────┘  └───────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Input | Output | Communicates With |
|-----------|---------------|-------|--------|-------------------|
| **Upload Handler** | Accept PDFs/images, validate, store | Raw files (PDF/PNG/JPG) | File URL, job ID | Document Parser Service |
| **Document Parser Service** | OCR, text extraction, entity recognition | File URL | Structured booking data | Event Database, AI Orchestrator |
| **AI Orchestrator** | Coordinate multi-agent itinerary generation | Fixed events, wishlists, constraints | Optimized itinerary | Claude API, Optimizer Service |
| **Itinerary Optimizer** | Calculate optimal routes, timing | Events list, location data | Sequenced itinerary with travel times | Map Service, External APIs |
| **Map Visualization Service** | Generate routes, markers, render maps | Location coordinates, waypoints | Map tiles, route polylines | Frontend, External Map APIs |
| **Timeline Renderer** | Day-by-day view, drag-drop interface | Itinerary events | Visual timeline UI | Frontend State Manager |
| **Chat Interface** | Real-time refinement via conversation | User messages, current itinerary | AI suggestions, updated itinerary | AI Orchestrator, WebSocket Manager |
| **Export Service** | Generate ICS calendar files | Finalized itinerary | ICS file download | Event Database |
| **External API Gateway** | Aggregate Google Places, Yelp, weather | Location queries | Hours, reviews, ratings | Cache Layer, Optimizer |
| **User Service** | Authentication, trip management | Login credentials, trip data | User profile, saved trips | Auth Provider, Trip Database |

## Data Flow

### Primary User Journey Data Flow

#### 1. Upload → Parse Flow
```
User uploads PDF
    ↓
[Frontend] → POST /api/documents/upload
    ↓
[API Gateway] validates auth, file size
    ↓
[Upload Handler] → S3/Blob Storage
    ↓
[Event Bus] → "document.uploaded" event
    ↓
[Document Parser Service]
    • Downloads file from S3
    • OCR extraction (Mistral OCR / Azure Document Intelligence)
    • Entity recognition (booking refs, dates, locations, times)
    • Structured data extraction
    ↓
[Event Bus] → "document.parsed" event
    ↓
[Trip Database] stores structured bookings
    ↓
[Frontend] receives WebSocket update: "Booking parsed: Flight LAX→NYC, Jan 15"
```

#### 2. Itinerary Generation Flow
```
User clicks "Generate Itinerary"
    ↓
[Frontend] → POST /api/itinerary/generate
    ↓
[AI Orchestrator Service]
    • Gathers: fixed events, wishlist items, constraints
    • Calls Claude API with structured prompt
    • Receives streaming response
    ↓
[Itinerary Optimizer]
    • Geocodes locations (external API)
    • Calculates travel times between events
    • Validates time windows
    • Orders events by geography + time
    ↓
[External API Gateway]
    • Fetches Google Places hours/reviews
    • Gets Yelp ratings
    • Weather forecasts
    ↓
[Trip Database] saves generated itinerary
    ↓
[Frontend] receives SSE stream: progressive itinerary display
```

#### 3. Real-Time Refinement Flow
```
User types: "Move dinner to 8pm"
    ↓
[Frontend] → WebSocket message
    ↓
[Chat Interface Service]
    • Maintains conversation state (session store)
    • Calls Claude API with context
    • Receives streaming response
    ↓
[Itinerary Optimizer]
    • Updates event timing
    • Recalculates downstream impacts
    • Validates constraints
    ↓
[Event Bus] → "itinerary.updated" event
    ↓
[Frontend] receives WebSocket: timeline + map updates simultaneously
```

#### 4. Drag-Drop Refinement Flow
```
User drags event from 2pm → 4pm
    ↓
[Frontend State Manager] (React + dnd-kit)
    • Optimistic UI update (immediate visual feedback)
    • Validation (time slot available?)
    ↓
[Frontend] → PATCH /api/itinerary/:id/events/:eventId
    ↓
[Itinerary Optimizer]
    • Validates move
    • Recalculates travel times
    • Checks conflicts
    ↓
[Trip Database] updates event
    ↓
[Event Bus] → "event.moved" event
    ↓
[Map Service] recalculates route
    ↓
[Frontend] receives confirmation or rollback via WebSocket
```

#### 5. Export Flow
```
User clicks "Export to Calendar"
    ↓
[Frontend] → GET /api/itinerary/:id/export/ics
    ↓
[Export Service]
    • Queries finalized itinerary
    • Generates ICS format (RFC 5545)
    • Creates VEVENT blocks for each activity
    • Includes location, description, time zones
    ↓
[Frontend] triggers browser download
```

### Data Flow Patterns

**Synchronous (REST):**
- User authentication
- Trip CRUD operations
- Export generation
- Static content serving

**Asynchronous (Events):**
- Document parsing (long-running)
- AI itinerary generation (streaming)
- External API enrichment (parallel)

**Real-Time (WebSocket/SSE):**
- Chat-based refinement
- Collaborative editing (future)
- Progress updates for long operations
- Live itinerary updates

**Streaming (SSE preferred):**
- AI response streaming (Claude API)
- Progressive itinerary display
- One-way server→client updates

## Technology Stack Recommendations

### Frontend Layer

| Technology | Purpose | Why |
|------------|---------|-----|
| **React 19** | UI framework | Industry standard, strong ecosystem, Server Components support |
| **Next.js 15** | Framework | File-based routing, API routes, SSR/SSG, serverless deployment |
| **dnd-kit** | Drag-and-drop | Lightweight (10kb), zero deps, React state integration, accessibility |
| **Leaflet / Mapbox GL JS** | Map visualization | Open-source option vs premium features, geospatial rendering |
| **Recharts / D3.js** | Timeline visualization | Declarative (Recharts) or full control (D3) for timeline UI |
| **TanStack Query (React Query)** | Data fetching | Caching, optimistic updates, automatic refetching |
| **Zustand / Jotai** | State management | Lightweight alternatives to Redux, simpler for timeline state |

### Backend Services

| Technology | Purpose | Why |
|------------|---------|-----|
| **Node.js (Express/Fastify)** | API server | Non-blocking I/O for real-time, JavaScript ecosystem consistency |
| **Python (FastAPI)** | AI/ML services | Optimal for Claude API integration, ML libraries, async support |
| **PostgreSQL** | Primary database | ACID compliance, relational data (users, trips, events), JSON support |
| **Redis** | Cache + Pub/Sub | Session storage, WebSocket state, rate limiting, event distribution |
| **AWS Lambda** | Serverless functions | Document parsing, ICS generation (variable load) |
| **AWS API Gateway** | API routing | Authentication, rate limiting, request validation |

### AI & Document Processing

| Technology | Purpose | Why |
|------------|---------|-----|
| **Claude API (Anthropic)** | Itinerary generation | Large context window, structured output, planning capabilities |
| **Mistral OCR / Azure Document Intelligence** | PDF parsing | High-speed (2000 pages/min), structured extraction, multi-format |
| **LangGraph / LangChain** | Multi-agent orchestration | State management for agent workflows, tool calling |

### External APIs

| API | Purpose | Considerations |
|-----|---------|---------------|
| **Google Places API** | Business hours, reviews | Cost per query, rate limits |
| **Yelp Fusion API** | Restaurant ratings | Free tier available |
| **Mapbox / Google Maps** | Routing, geocoding | Mapbox cheaper for high volume |
| **OpenWeatherMap** | Weather forecasts | Free tier sufficient for MVP |

### Real-Time Communication

| Technology | Purpose | Why |
|------------|---------|-----|
| **Server-Sent Events (SSE)** | AI streaming responses | Simpler than WebSocket, one-way, automatic reconnection |
| **WebSocket (Socket.io)** | Chat interface, collaborative editing | Bi-directional, room-based channels |
| **Redis Pub/Sub** | Multi-instance coordination | Broadcast events across backend nodes |

### Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| **AWS S3** | Document storage | Scalable, durable, integrates with Lambda |
| **AWS EventBridge / SNS** | Event bus | Serverless event routing, multiple subscribers |
| **Docker + Kubernetes** | Container orchestration | Microservices deployment, auto-scaling |
| **CloudFront / Vercel** | CDN + Frontend hosting | Edge caching, global distribution |

### Authentication

| Technology | Purpose | Why |
|------------|---------|-----|
| **AWS Cognito / Auth0** | User management | Hosted auth, OAuth support, JWT issuance |
| **JWT** | API authentication | Stateless, scalable, self-contained tokens |
| **Redis sessions** | WebSocket auth | Persistent state for long-running connections |

## Architecture Patterns to Follow

### Pattern 1: Backend for Frontend (BFF)

**What:** Separate backend services for web vs mobile clients, each optimized for its UI needs.

**When:** Your timeline drag-drop UI requires different data shapes than a future mobile app would.

**Implementation:**
```typescript
// Web BFF - Rich timeline data
GET /api/web/itinerary/:id
Response: {
  events: [...],           // Full event details
  travelTimes: [...],      // Precalculated routes
  visualizationData: {...} // Timeline rendering hints
}

// Mobile BFF - Simplified data
GET /api/mobile/itinerary/:id
Response: {
  events: [...],  // Minimal fields
  summary: "..."  // Day summaries only
}
```

**Why:** Reduces over-fetching, enables independent scaling, prevents mobile/web coupling.

### Pattern 2: Multi-Agent AI Architecture

**What:** Specialized AI agents for different planning tasks, coordinated by orchestrator.

**When:** Generating itineraries requires multiple reasoning steps (geocoding, optimization, validation).

**Implementation:**
```python
# LangGraph-based multi-agent system
agents = [
    ProfilerAgent(),     # Understands user preferences
    GeocoderAgent(),     # Resolves locations
    OptimizerAgent(),    # Routes + timing
    ValidatorAgent(),    # Constraint checking
    BookerAgent(),       # (Future) API bookings
]

# Sequential workflow with feedback loops
workflow = StateGraph()
workflow.add_node("profile", ProfilerAgent)
workflow.add_node("geocode", GeocoderAgent)
workflow.add_node("optimize", OptimizerAgent)
workflow.add_conditional_edges("optimize", should_retry)
```

**Why:** Separates concerns, enables iterative refinement, makes debugging easier than monolithic prompts.

### Pattern 3: Event-Driven Microservices

**What:** Services communicate via events, not direct calls, using message queues.

**When:** Document parsing and AI generation are long-running operations that shouldn't block HTTP requests.

**Implementation:**
```javascript
// Upload handler publishes event
await eventBus.publish('document.uploaded', {
  documentId: 'doc-123',
  userId: 'user-456',
  url: 's3://bucket/doc.pdf'
});

// Parser service subscribes
eventBus.subscribe('document.uploaded', async (event) => {
  const parsed = await parseDocument(event.url);
  await eventBus.publish('document.parsed', parsed);
});

// AI service subscribes
eventBus.subscribe('document.parsed', async (event) => {
  await generateItinerary(event.userId);
});
```

**Why:** Decouples services, enables async processing, supports retries, allows parallel processing.

### Pattern 4: Optimistic UI with Event Sourcing

**What:** Update UI immediately on user action, reconcile with backend asynchronously.

**When:** Drag-drop timeline manipulation needs instant feedback.

**Implementation:**
```typescript
// Frontend state manager
function moveEvent(eventId, newTime) {
  // 1. Optimistic update (instant)
  dispatch({ type: 'MOVE_EVENT_OPTIMISTIC', eventId, newTime });

  // 2. Backend request
  const promise = api.moveEvent(eventId, newTime);

  // 3. Reconcile or rollback
  promise
    .then(() => dispatch({ type: 'MOVE_EVENT_CONFIRMED', eventId }))
    .catch(() => dispatch({ type: 'MOVE_EVENT_FAILED', eventId }));
}
```

**Why:** Perceived performance, responsive UX, graceful error handling.

### Pattern 5: API Gateway with Rate Limiting

**What:** Single entry point for all API requests with authentication, validation, and rate limiting.

**When:** Protecting against abuse, managing external API costs (Google Places, Yelp).

**Implementation:**
```yaml
# AWS API Gateway configuration
/api/places/search:
  throttle:
    rateLimit: 100 per minute per user
    burstLimit: 20
  cache:
    ttl: 3600  # 1 hour for place data
  authorizer: CognitoUserPool
```

**Why:** Centralized security, cost control (cache reduces external API calls), DDoS protection.

### Pattern 6: CQRS (Command Query Responsibility Segregation)

**What:** Separate read and write paths for trip data.

**When:** Timeline view queries are complex (joins, aggregations) but writes are simple.

**Implementation:**
```
Write side (Commands):
  POST /api/itinerary → writes to PostgreSQL (normalized)

Read side (Queries):
  GET /api/itinerary/:id/timeline → reads from Redis (denormalized)

Event triggers materialized view update:
  "itinerary.updated" → rebuild Redis cache
```

**Why:** Optimizes reads without slowing writes, enables read replicas, supports caching strategies.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Synchronous Document Parsing in HTTP Request

**What:** Trying to parse PDF and return results in single HTTP request/response.

**Why bad:**
- API Gateway timeouts (30s AWS Lambda limit)
- Poor UX (user waits with loading spinner)
- No progress updates
- Failed parses = lost work

**Instead:**
- Accept upload → return job ID immediately
- Parse asynchronously
- Send progress via WebSocket/SSE
- Store results for polling

### Anti-Pattern 2: Monolithic AI Prompt

**What:** Single massive prompt trying to do parsing, optimization, validation, and formatting in one Claude API call.

**Why bad:**
- Hard to debug when output is wrong
- No intermediate validation
- Can't retry individual steps
- Token waste (resending context)

**Instead:**
- Multi-agent workflow (see Pattern 2)
- Structured outputs for each step
- Validate intermediate results
- Chain prompts with state

### Anti-Pattern 3: Client-Side Map Routing

**What:** Calculating optimal routes in browser JavaScript.

**Why bad:**
- Performance issues with 50+ events
- Inconsistent results across devices
- Can't leverage server caching
- Limited algorithm sophistication

**Instead:**
- Backend optimizer service
- Cache route calculations
- Use professional routing APIs (OSRM, Mapbox Directions)
- Return pre-computed routes to frontend

### Anti-Pattern 4: Storing Entire Itinerary in JWT

**What:** Embedding trip data in authentication token to avoid database queries.

**Why bad:**
- JWT size limits (cookies max 4kb)
- Can't revoke or update without re-auth
- Security risk (XSS exposes trip data)
- Invalidates caching strategies

**Instead:**
- JWT contains only user ID + basic claims
- Trip data fetched from database/cache
- Stateless auth, stateful data

### Anti-Pattern 5: Real-Time Sync Without Conflict Resolution

**What:** Multiple users editing same itinerary with last-write-wins.

**Why bad:**
- Data loss when simultaneous edits
- Confusing UX (changes disappear)
- No audit trail

**Instead:**
- Operational Transformation (OT) or CRDTs for true collaboration
- For MVP: pessimistic locking (show "User X is editing")
- Warn on conflicts, let user choose resolution

### Anti-Pattern 6: Polling External APIs on Every Request

**What:** Querying Google Places API every time user views an event.

**Why bad:**
- Exceeds rate limits quickly
- High API costs
- Slow page loads
- Unnecessary load

**Instead:**
- Cache place data (Redis, 1-hour TTL)
- Refresh asynchronously in background
- Batch API requests (Places Nearby API)
- Use webhooks where available

### Anti-Pattern 7: Stateful WebSocket Servers Without Session Store

**What:** Storing chat/itinerary state in WebSocket server memory only.

**Why bad:**
- Lost on server restart
- Can't scale horizontally (sticky sessions required)
- No failover support

**Instead:**
- External session store (Redis)
- Stateless WebSocket handlers
- Pub/Sub for multi-instance coordination

## Scalability Considerations

### At 100 Users (MVP)

**Architecture:**
- Monolithic Next.js app (API routes + frontend)
- Single PostgreSQL instance
- No caching layer needed yet
- Direct Claude API calls

**Costs:** ~$50-100/month (Vercel hobby + DB + external APIs)

**Pain points:**
- None yet, over-provisioned

### At 10K Users (Growth Phase)

**Architecture:**
- Separate frontend (Vercel/CloudFront) + backend (ECS/Lambda)
- PostgreSQL primary + read replica
- Redis cache layer (session, place data)
- CDN for static assets

**Scaling changes:**
- Add API Gateway for rate limiting
- Implement request caching (places, weather)
- Separate AI service from API service
- Background job queue for document parsing

**Costs:** ~$500-1000/month

**Pain points:**
- External API costs dominate (Google Places)
- Database query optimization needed
- Need monitoring/alerting (Datadog)

### At 1M Users (Scale)

**Architecture:**
- Multi-region deployment (US, EU)
- PostgreSQL sharded by user ID or trip ID
- Redis cluster (Pub/Sub + caching)
- Microservices (document parsing, AI, optimizer, export)
- Kubernetes orchestration

**Scaling changes:**
- GraphQL BFF layer (reduce over-fetching)
- Read-heavy workload → more read replicas
- ML model for preference learning (reduce Claude API calls)
- Edge functions for low-latency endpoints

**Costs:** ~$10K-50K/month (infrastructure + external APIs)

**Pain points:**
- Database sharding complexity
- Cross-region data consistency
- External API rate limits (need enterprise agreements)
- Multi-tenant isolation

### Scaling Hotspots

| Component | Bottleneck | Solution |
|-----------|-----------|----------|
| **AI Generation** | Claude API rate limits | Request batching, queue, caching |
| **Document Parsing** | OCR processing time | Parallel Lambda invocations, pre-warming |
| **Map Rendering** | Client-side rendering lag | Server-side map tile generation, WebGL |
| **Database Writes** | Trip updates (high write volume) | Write sharding, eventual consistency |
| **External APIs** | Google Places rate limits | Aggressive caching, request deduplication |

## Build Order & Dependencies

### Phase 1: Core Infrastructure (Weeks 1-2)
**Goal:** Set up foundational architecture

**Components:**
1. Database schema (users, trips, events)
2. Authentication (Cognito/Auth0 + JWT)
3. API Gateway setup
4. Basic REST endpoints (CRUD)

**Dependencies:** None (greenfield)

**Deliverable:** User can sign up, create trip, add manual events

### Phase 2: Document Processing Pipeline (Weeks 3-4)
**Goal:** Upload → Parse → Structure

**Components:**
1. S3 upload handler
2. Document parser service (Lambda)
3. Event bus setup (EventBridge)
4. WebSocket progress updates

**Dependencies:** Phase 1 (users, trips, events tables)

**Deliverable:** User can upload PDF, see parsed bookings in UI

### Phase 3: AI Itinerary Generation (Weeks 5-7)
**Goal:** Generate initial itinerary

**Components:**
1. Claude API integration
2. AI orchestrator service
3. Prompt engineering (itinerary generation)
4. SSE streaming for progressive display

**Dependencies:** Phase 2 (structured booking data)

**Deliverable:** User clicks "Generate" → AI creates day-by-day itinerary

### Phase 4: Visualization (Map + Timeline) (Weeks 8-10)
**Goal:** Display itinerary visually

**Components:**
1. Map service (Leaflet/Mapbox)
2. Route calculation (Mapbox Directions)
3. Timeline component (Recharts/custom)
4. Responsive layout (day/map/timeline views)

**Dependencies:** Phase 3 (generated itinerary data)

**Deliverable:** User sees itinerary on map with routes, timeline view

### Phase 5: External API Integration (Weeks 11-12)
**Goal:** Enrich with live data

**Components:**
1. External API gateway (Google Places, Yelp)
2. Data enrichment service
3. Caching layer (Redis)
4. Background refresh jobs

**Dependencies:** Phase 4 (events need enrichment)

**Deliverable:** Events show hours, ratings, reviews

### Phase 6: Itinerary Refinement (Weeks 13-15)
**Goal:** User can modify AI-generated plan

**Components:**
1. Drag-drop timeline (dnd-kit)
2. Optimistic UI updates
3. Chat interface (WebSocket)
4. AI re-optimization service

**Dependencies:** Phase 4 (timeline UI), Phase 3 (AI service)

**Deliverable:** User can drag events, chat to refine, see updates live

### Phase 7: Export & Finalization (Weeks 16-17)
**Goal:** Export to calendar apps

**Components:**
1. ICS generation service
2. Export endpoint (REST)
3. Email integration (optional)

**Dependencies:** Phase 3+ (finalized itinerary)

**Deliverable:** User downloads ICS file, imports to Google Calendar

### Phase 8: Optimization & Polish (Weeks 18-20)
**Goal:** Production readiness

**Components:**
1. Caching strategy implementation
2. Rate limiting
3. Error handling + retries
4. Monitoring (logs, metrics, traces)
5. Load testing

**Dependencies:** All previous phases

**Deliverable:** Production-ready system

### Critical Path

```
Phase 1 (Core) → Phase 2 (Parsing) → Phase 3 (AI) → Phase 4 (Viz)
                                            ↓
                        Phase 5 (APIs) → Phase 6 (Refinement) → Phase 7 (Export)
                                                                        ↓
                                                                  Phase 8 (Polish)
```

**Parallel work opportunities:**
- Phase 4 (Visualization) can start once Phase 3 provides mock data
- Phase 5 (External APIs) can develop independently with stubbed data
- Phase 7 (Export) can develop against Phase 3 output

## Integration Points

### External Services

| Service | Integration Type | Data Flow | Authentication | Error Handling |
|---------|-----------------|-----------|----------------|----------------|
| **Claude API** | REST (streaming) | Prompt → JSON response | API key | Retry with exponential backoff, fallback to basic plan |
| **Google Places** | REST | Location query → place details | API key | Cache aggressively (1hr), handle quota errors |
| **Mapbox/Google Maps** | REST + JS SDK | Coordinates → routes/tiles | API token | Fallback to OpenStreetMap, cached tiles |
| **Yelp Fusion** | REST | Business ID → ratings | OAuth 2.0 | Graceful degradation (hide reviews) |
| **OpenWeatherMap** | REST | Location → forecast | API key | Cache 1hr, non-critical (optional) |

### Internal Service Communication

| From Service | To Service | Method | Payload | When |
|-------------|-----------|--------|---------|------|
| Upload Handler | Parser Service | Event (SNS/EventBridge) | `{documentId, url, userId}` | File uploaded |
| Parser Service | AI Orchestrator | Event | `{parsedData, tripId}` | Parsing complete |
| AI Orchestrator | Optimizer Service | REST | `{events[], constraints}` | Itinerary generated |
| Optimizer Service | Map Service | REST | `{waypoints[]}` | Route needed |
| Chat Interface | AI Orchestrator | WebSocket → REST | `{message, sessionId}` | User chat message |
| Any Service | Frontend | WebSocket/SSE | Various | Real-time updates |

## Security Considerations

### Authentication Flow
1. User logs in → Cognito issues JWT (short-lived, 1hr)
2. Frontend stores JWT in memory (not localStorage - XSS risk)
3. Refresh token in httpOnly cookie (secure, sameSite)
4. API Gateway validates JWT on every request
5. WebSocket handshake validates JWT, stores session in Redis

### Authorization Model
- Trips belong to users (user_id foreign key)
- Row-level security: `WHERE user_id = :current_user`
- Shared trips (future): junction table with permissions

### Data Protection
- PDFs/images stored in S3 with server-side encryption (AES-256)
- Database connections over TLS
- API keys in AWS Secrets Manager (not env vars)
- PII (names, emails) encrypted at rest

### API Security
- Rate limiting per user (100 req/min) and per IP (1000 req/min)
- CORS whitelist (frontend origin only)
- Input validation (Zod schemas)
- SQL injection protection (parameterized queries)
- XSS protection (sanitize user content)

## Monitoring & Observability

### Metrics to Track
- **Performance:** API latency (p50, p95, p99), document parsing time, AI generation time
- **Reliability:** Error rates by endpoint, external API failures, WebSocket disconnections
- **Business:** Daily active users, trips created, itineraries generated, exports completed

### Logging Strategy
- Structured JSON logs (timestamp, level, service, userId, traceId)
- Centralized logging (CloudWatch Logs / ELK stack)
- Log retention: 30 days (debug), 1 year (errors)

### Tracing
- Distributed tracing (AWS X-Ray or OpenTelemetry)
- Trace document upload → parse → AI → display (end-to-end)

### Alerting
- Critical: Database down, auth service down, > 50% error rate
- Warning: External API quota near limit, slow response times, queue backlog

## Technology Choices: Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|-------------------|
| **Frontend Framework** | React + Next.js | Vue + Nuxt, Svelte + SvelteKit | React has larger ecosystem for maps/drag-drop libraries |
| **Backend Language** | Node.js + Python | Go, Rust | Node.js shares frontend types, Python for AI integrations |
| **Database** | PostgreSQL | MongoDB, Supabase | Relational model fits trip/event structure, ACID needed |
| **Real-Time** | SSE + WebSocket | Polling, Long-polling | SSE efficient for streaming, WebSocket for bi-directional chat |
| **Map Library** | Mapbox GL JS | Google Maps JS API, Leaflet | Mapbox balance of features/cost, WebGL performance |
| **AI Orchestration** | LangGraph | Custom, LangChain only | LangGraph built for stateful multi-agent workflows |
| **Document Parsing** | Mistral OCR / Azure | Tesseract, AWS Textract | Mistral speed (2000 ppm), Azure structure extraction |
| **Auth** | AWS Cognito | Auth0, Firebase Auth, custom | Cognito AWS-native, cost-effective, JWT standard |
| **Hosting** | Vercel (FE) + AWS (BE) | All AWS, All Vercel, Netlify | Vercel best Next.js DX, AWS flexibility for backend |

## Key Architectural Decisions & Rationale

### Decision 1: Hybrid Serverless + Long-Running Services

**Rationale:**
- Document parsing: Variable load, compute-intensive → **AWS Lambda** (cost-effective)
- AI generation: Streaming responses, timeout-sensitive → **ECS/Fargate** (long-running)
- Chat interface: Persistent WebSocket connections → **ECS/EC2** (stateful)
- API endpoints: Standard CRUD → **Lambda + API Gateway** (auto-scaling)

### Decision 2: SSE for AI Streaming (not WebSocket)

**Rationale:**
- Claude API streams via SSE natively
- One-way communication sufficient (server → client)
- Simpler than WebSocket (auto-reconnect, HTTP-compatible)
- WebSocket reserved for chat (bi-directional needed)

### Decision 3: Multi-Agent AI (not Monolithic Prompt)

**Rationale:**
- Complex itinerary generation requires: geocoding, optimization, validation, formatting
- Single prompt → hard to debug, can't validate intermediate steps
- Multi-agent → modular, testable, retryable per step
- Aligns with 2026 best practices (LangGraph)

### Decision 4: Event-Driven Architecture (not Request-Response)

**Rationale:**
- Document parsing takes 10-60s → too long for HTTP request
- Enables parallel processing (parse → AI → enrich simultaneously)
- Decouples services (parser doesn't know about AI)
- Supports retries and idempotency

### Decision 5: PostgreSQL (not MongoDB)

**Rationale:**
- Trip/event data is relational (users → trips → events)
- Foreign key constraints prevent orphaned data
- PostgreSQL JSON columns provide flexibility where needed
- ACID transactions critical (don't lose bookings)

## Open Questions for Phase-Specific Research

### Phase 2 (Document Parsing)
- Which OCR service has best booking confirmation recognition?
- How to handle multi-language PDFs (non-English)?
- Confidence thresholds for entity extraction?

### Phase 3 (AI Generation)
- Optimal prompt structure for Claude API (XML tags vs JSON)?
- How many agents in multi-agent system (3? 5? 7?)?
- Streaming vs batch mode for initial itinerary generation?

### Phase 5 (External APIs)
- Google Places vs Yelp vs both (cost/coverage tradeoffs)?
- Self-hosted geocoding (Pelias) vs API (Mapbox)?
- Weather API: OpenWeatherMap vs WeatherAPI vs Tomorrow.io?

### Phase 6 (Refinement)
- Operational Transformation library (ShareDB, Yjs, Automerge)?
- Chat history storage: database vs in-memory (Redis)?
- Conflict resolution strategy for simultaneous edits?

### Phase 8 (Optimization)
- CDN strategy: CloudFront vs Cloudflare vs Fastly?
- Database connection pooling: PgBouncer vs RDS Proxy?
- Redis cluster topology: single instance vs cluster vs Sentinel?

## Confidence Assessment

| Area | Confidence | Source Type | Notes |
|------|-----------|-------------|-------|
| **Multi-Tier Architecture** | HIGH | Multiple sources (AWS whitepapers, academic papers, industry blogs) | Well-established pattern for this domain |
| **Multi-Agent AI** | HIGH | Recent sources (2025-2026), academic papers (TriFlow WWW'26) | Emerging standard for travel planning |
| **Document Parsing** | MEDIUM | WebSearch (Mistral OCR 2025, Azure docs) | Verified via official sources, need to test APIs |
| **Real-Time Patterns** | HIGH | Official docs (AWS, Microsoft, Socket.io) | SSE/WebSocket patterns mature |
| **Database Design** | MEDIUM | WebSearch (general principles, travel agency examples) | Principles verified, need domain-specific schema |
| **External APIs** | MEDIUM | WebSearch (API documentation sites) | Need to verify current pricing, rate limits |
| **Scalability** | LOW | WebSearch (general patterns) | Numbers are estimates, need load testing |

## Next Steps After Architecture Definition

1. **Schema Design:** Define PostgreSQL tables (users, trips, events, locations)
2. **API Contract:** OpenAPI spec for all endpoints
3. **Sequence Diagrams:** Detailed flows for each user journey
4. **Technology Evaluation:** Prototype document parsing APIs (Mistral vs Azure)
5. **Cost Modeling:** Estimate external API costs at different scales

## Sources

This architecture research is based on 2025-2026 sources covering travel planning systems, AI agent architectures, and modern web application patterns:

**AI & Travel Planning:**
- [How To Develop A Smart AI Trip Planner App in 2026 - DEV Community](https://dev.to/nickpe/how-to-develop-a-smart-ai-trip-planner-app-in-2026-4kfk)
- [Building a Multi-Agent Travel Planning System with Agent2Agent Protocol - Medium](https://nayakpplaban.medium.com/building-a-multi-agent-travel-planning-system-with-agent2agent-protocol-b870b58decff)
- [TriFlow: A Progressive Multi-Agent Framework for Intelligent Trip Planning - arXiv](https://arxiv.org/pdf/2512.11271)
- [AI trip planning apps: System design, data sources, and monetization - Coaxsoft](https://coaxsoft.com/blog/guide-to-ai-trip-planning-apps)
- [Aimpoint Digital: AI Agent Systems for Building Travel Itineraries - Databricks Blog](https://www.databricks.com/blog/aimpoint-digital-ai-agent-systems)

**Document Processing:**
- [Mistral OCR | Mistral AI](https://mistral.ai/news/mistral-ocr)
- [Best API For PDF Data Extraction (2026) | Parseur](https://parseur.com/blog/best-api-data-extraction)
- [From PDFs to AI-ready structured data: a deep dive - Explosion AI](https://explosion.ai/blog/pdfs-nlp-structured-data)

**Microservices & Architecture:**
- [Novel Architecture for Distributed Travel Data Integration Using Microservices - Cureus](https://www.cureusjournals.com/articles/4835-novel-architecture-for-distributed-travel-data-integration-and-service-provision-using-microservices)
- [Real-Time Performance Optimization of Travel Reservation Systems Using AI and Microservices - Wiley](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/tje2.70139)
- [Modern Web Application Architecture in 2026 - Quokka Labs](https://quokkalabs.com/blog/modern-web-application-architecture/)
- [Building a Production-Grade AI Web App in 2026 - DEV Community](https://dev.to/art_light/building-a-production-grade-ai-web-app-in-2026-architecture-trade-offs-and-hard-won-lessons-4llg)

**Real-Time & Streaming:**
- [Building real-time applications with WebSockets - Render](https://render.com/articles/building-real-time-applications-with-websockets)
- [WebSocket architecture best practices - Ably](https://ably.com/topic/websocket-architecture-best-practices)
- [Streaming AI Responses: Building Real-Time Chat UIs with Vercel AI SDK - 9.agency](https://www.9.agency/blog/streaming-ai-responses-vercel-ai-sdk)
- [Building Real-Time AI Chat: Infrastructure for WebSockets, LLM Streaming - Render](https://render.com/articles/real-time-ai-chat-websockets-infrastructure)

**Frontend Patterns:**
- [Top 5 Drag-and-Drop Libraries for React in 2026 - Puck](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Frontend Design Patterns That Actually Work in 2026 - Netguru](https://www.netguru.com/blog/frontend-design-patterns)
- [The Complete Guide to Frontend Architecture Patterns in 2026 - DEV Community](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo)
- [Backend for Frontend Pattern - Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)

**API & Authentication:**
- [Serverless Architectures with AWS Lambda - AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/serverless-architectures-with-aws-lambda-overview-and-best-practices/)
- [AWS Serverless Multi-Tier Architectures with API Gateway and Lambda](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/welcome.html)
- [JWT Authentication: A Secure & Scalable Solution - Authgear](https://www.authgear.com/post/jwt-authentication-a-secure-scalable-solution-for-modern-applications)
- [JWTs vs. sessions - Stytch](https://stytch.com/blog/jwts-vs-sessions-which-is-right-for-you/)

**Routing & Optimization:**
- [Logistics Route Optimization: Guide in 2026 - NextBillion.ai](https://nextbillion.ai/blog/logistics-route-optimization)
- [Multi-Itinerary Optimization as Cloud Service - ACM](https://cacm.acm.org/research/multi-itinerary-optimization-as-cloud-service/)

**Event-Driven Architecture:**
- [Event-Driven Architecture Style - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)
- [What Is Event-Driven Architecture? Comprehensive Guide 2026 - Estuary](https://estuary.dev/blog/event-driven-architecture/)
- [7 Essential Patterns in Event-Driven Architecture Today - Talent500](https://talent500.com/blog/event-driven-architecture-essential-patterns/)

**Database Design:**
- [Complete Guide to Database Schema Design - Integrate.io](https://www.integrate.io/blog/complete-guide-to-database-schema-design-guide/)
- [5 Best Database Schema Design Examples in 2026 - Hevo Data](https://hevodata.com/learn/schema-example/)
- [Relational Database vs. Document Database - EnterpriseDB](https://www.enterprisedb.com/blog/relational-vs-document-database)

**Calendar/ICS:**
- [Calendar (.ics) File Structure - WebDAV System](https://www.webdavsystem.com/server/creating_caldav_carddav/calendar_ics_file_structure/)
- [What is iCalendar and how does the ICS file format work? - IONOS](https://www.ionos.com/digitalguide/websites/web-development/icalendar/)
