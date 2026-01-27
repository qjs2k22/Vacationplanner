# Phase 1: Core Infrastructure & Authentication - Research

**Researched:** 2026-01-27
**Domain:** Next.js 15 App Router with Clerk authentication, Drizzle ORM, PostgreSQL+PostGIS
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational infrastructure for the Trip Coordinator application using Next.js 15 App Router with TypeScript, Clerk for authentication, and Drizzle ORM with PostgreSQL+PostGIS. The standard approach combines server-first architecture with defense-in-depth authentication, proper timezone handling from day one, and serverless-optimized database connections.

The stack is modern, battle-tested, and specifically optimized for the serverless deployment model. Clerk provides production-ready authentication in approximately 30 minutes with first-class Next.js App Router support. Drizzle ORM offers type-safe database access with zero-cost abstractions and excellent PostgreSQL+PostGIS integration. The architecture emphasizes Server Components by default with selective client-side interactivity, proper connection pooling for serverless environments, and UTC-first timezone storage.

Critical from the start: all routes are public by default with Clerk's `clerkMiddleware()` - you must explicitly opt-in to route protection. Database timestamps must use `timestamptz` (not `timestamp`), and connection pooling requires special handling in serverless environments to avoid connection exhaustion.

**Primary recommendation:** Use the multi-tier hybrid pattern with Server Components for data fetching, opt-in route protection with `createRouteMatcher()`, T3 Env for type-safe environment variables, connection pooling with `@vercel/functions` attachDatabasePool, and `timestamptz` for all time data storage.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.2.3+ | Full-stack React framework | Industry standard for React SSR/SSG, built-in TypeScript support, App Router with Server Components |
| TypeScript | 5.0+ | Type safety | Zero-config with Next.js, catches errors at build time, excellent IDE support |
| Clerk | Latest | Authentication & user management | Purpose-built for Next.js, 30-min setup, native React Server Components support, handles OAuth/passwordless/MFA |
| Drizzle ORM | Latest | Type-safe database ORM | Zero-cost TypeScript ORM, excellent PostgreSQL support, PostGIS compatibility, minimal bundle size |
| PostgreSQL | 14+ | Relational database | Industry standard, robust ACID compliance, excellent timezone handling with `timestamptz` |
| PostGIS | 3.0+ | Geospatial extension | Standard for location data, spatial indexes with GIST, mature ecosystem |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @t3-oss/env-nextjs | Latest | Environment variable validation | Always - provides runtime validation and type safety for env vars |
| zod | 3.x | Schema validation | Always - used with T3 Env and for API input validation |
| @vercel/functions | Latest | Serverless utilities | When deploying to Vercel - provides `attachDatabasePool` for connection management |
| pg | 8.x | PostgreSQL driver | Standard driver for Node.js, works with Drizzle node-postgres adapter |
| drizzle-kit | Latest | Schema migrations | Always - generates migrations, handles schema changes, provides push for dev |
| @neondatabase/serverless | Latest | Serverless PostgreSQL driver | Alternative to pg for pure serverless/edge environments (Neon, Vercel Edge) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clerk | NextAuth.js (Auth.js v5) | More control but significantly more setup time, manual session management |
| Drizzle ORM | Prisma | Heavier runtime, larger bundle, but better migrations UI and admin panel |
| PostgreSQL | MySQL/MariaDB | No native `timestamptz`, PostGIS alternative requires more setup |
| @t3-oss/env-nextjs | Manual env validation | No type safety, runtime errors instead of build-time validation |

**Installation:**
```bash
# Core dependencies
npm install @clerk/nextjs drizzle-orm pg dotenv @t3-oss/env-nextjs zod

# Development dependencies
npm install -D drizzle-kit tsx @types/pg

# Serverless optimization (if deploying to Vercel)
npm install @vercel/functions
```

## Architecture Patterns

### Recommended Project Structure
```
Calendar-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Route group: authentication pages
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/          # Route group: authenticated pages
│   │   │   ├── layout.tsx        # Shared auth layout
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx      # Trip list (Server Component)
│   │   │   │   ├── [id]/page.tsx # Trip detail
│   │   │   │   └── new/page.tsx  # Create trip
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── api/                  # API routes
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts
│   │   ├── layout.tsx            # Root layout with ClerkProvider
│   │   └── page.tsx              # Public home
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   └── trips/                # Feature-specific components
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── index.ts              # Database client instance
│   │   └── queries/              # Database query functions
│   │       └── trips.ts
│   ├── lib/                      # Utilities
│   │   ├── utils.ts              # Shared utility functions
│   │   └── validations.ts        # Zod schemas for validation
│   └── env.ts                    # T3 Env configuration
├── middleware.ts                 # Clerk middleware (root or src/)
├── drizzle.config.ts            # Drizzle Kit configuration
├── next.config.ts               # Next.js configuration
├── .env.local                    # Local environment variables (gitignored)
└── tsconfig.json                # TypeScript configuration
```

### Pattern 1: Defense-in-Depth Authentication
**What:** Multi-layered authentication checks at middleware, Server Component, and data access levels
**When to use:** Always - never rely solely on middleware for security
**Example:**
```typescript
// Source: https://clerk.com/docs/reference/nextjs/clerk-middleware
// middleware.ts - Lightweight cookie check for redirection
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/trips(.*)',
  '/api/trips(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

// app/(dashboard)/trips/page.tsx - Server Component validation
import { auth } from '@clerk/nextjs/server';

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch data with userId
  const trips = await getTripsForUser(userId);
  // ...
}

// src/db/queries/trips.ts - Data access layer validation
import { auth } from '@clerk/nextjs/server';

export async function getTripsForUser(userId: string) {
  const { userId: authUserId } = await auth();

  // Verify the requesting user matches
  if (authUserId !== userId) {
    throw new Error('Unauthorized');
  }

  return db.select().from(trips).where(eq(trips.userId, userId));
}
```

### Pattern 2: Server-First Data Fetching with Parallel Queries
**What:** Server Components fetch data in parallel to avoid waterfalls, selectively use Client Components for interactivity
**When to use:** Default pattern for all pages with data requirements
**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/fetching-data
// app/(dashboard)/trips/[id]/page.tsx
import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { getTripById, getEventsForTrip } from '@/db/queries/trips';
import { TripHeader } from '@/components/trips/trip-header';
import { EventsList } from '@/components/trips/events-list';
import { AddEventButton } from '@/components/trips/add-event-button';

export default async function TripDetailPage({
  params
}: {
  params: { id: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Parallel data fetching - initiate all at once
  const [trip, events] = await Promise.all([
    getTripById(params.id, userId),
    getEventsForTrip(params.id, userId),
  ]);

  return (
    <div>
      <TripHeader trip={trip} />

      <Suspense fallback={<EventsListSkeleton />}>
        <EventsList events={events} />
      </Suspense>

      {/* Client Component for interactivity */}
      <AddEventButton tripId={params.id} />
    </div>
  );
}
```

### Pattern 3: Type-Safe Environment Variables with T3 Env
**What:** Zod-validated environment variables with TypeScript inference and build-time checking
**When to use:** Always - set up before any feature development
**Example:**
```typescript
// Source: https://env.t3.gg/docs/nextjs
// src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  },
});

// next.config.ts - Validate at build time
import "./src/env";

const nextConfig: NextConfig = {
  // ... config
};

export default nextConfig;
```

### Pattern 4: Drizzle Schema with PostGIS and Timezone-Aware Timestamps
**What:** Type-safe database schema with proper timezone handling and spatial data support
**When to use:** All database table definitions
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/guides/postgis-geometry-point
// src/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  geometry
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID
  name: text('name').notNull(),
  startDate: timestamp('start_date', {
    withTimezone: true,  // CRITICAL: Use timestamptz
    mode: 'date'         // Returns JavaScript Date objects
  }).notNull(),
  endDate: timestamp('end_date', {
    withTimezone: true,
    mode: 'date'
  }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true
  }).notNull().defaultNow(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, {
    onDelete: 'cascade'
  }),
  name: text('name').notNull(),
  startTime: timestamp('start_time', {
    withTimezone: true,
    mode: 'date'
  }).notNull(),
  endTime: timestamp('end_time', {
    withTimezone: true,
    mode: 'date'
  }),
  location: geometry('location', {
    type: 'point',
    mode: 'xy',
    srid: 4326  // WGS 84 coordinate system
  }),
  address: text('address'),
  createdAt: timestamp('created_at', {
    withTimezone: true
  }).notNull().defaultNow(),
});

// Define relationships
export const tripsRelations = relations(trips, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  trip: one(trips, {
    fields: [events.tripId],
    references: [trips.id],
  }),
}));
```

### Pattern 5: Serverless Connection Pooling with Vercel Functions
**What:** Proper database connection pool management for serverless environments
**When to use:** Production deployment on Vercel or similar serverless platforms
**Example:**
```typescript
// Source: https://vercel.com/guides/connection-pooling-with-serverless-functions
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import * as schema from './schema';

// Global pool instance - reused across invocations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                    // Max connections in pool
  idleTimeoutMillis: 5000,   // Close idle connections after 5s
  connectionTimeoutMillis: 10000,
});

// Vercel-specific: ensures cleanup before function suspension
if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

export const db = drizzle({
  client: pool,
  schema,
});

// For edge functions, use Neon serverless driver instead:
// import { neon } from '@neondatabase/serverless';
// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(sql, { schema });
```

### Anti-Patterns to Avoid
- **Middleware-only authentication:** Never rely solely on middleware for security - always verify in Server Components and data access layers
- **`timestamp` without timezone:** Always use `timestamptz` - storing UTC without timezone metadata causes DST bugs
- **Client-side auth checks only:** Client validation is for UX, not security - always validate on server
- **Link prefetching to protected routes:** Add `prefetch={false}` to `<Link>` components pointing to protected pages to avoid console errors
- **Modifying migration history:** Never hand-edit migration files - generate new migrations for schema changes
- **Opening connections per request:** Use connection pooling - serverless functions must reuse connections
- **Storing timezone-converted dates:** Store all dates as UTC in database, convert only in UI
- **Route group folders as routes:** Route groups `(name)` organize code but don't affect URLs - don't assume `/dashboard/` prefix exists

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment variable validation | Manual `process.env` checks with string assertions | @t3-oss/env-nextjs with Zod | Build-time validation, type inference, prevents runtime env errors, catches missing vars before deployment |
| Session management | Custom JWT signing, refresh tokens, session storage | Clerk | Handles token rotation, refresh logic, session lifecycle, CSRF protection, secure cookie management |
| Password reset flows | Email sending, token generation, expiry logic | Clerk | Email delivery, secure token generation, proper expiry, rate limiting, template customization |
| OAuth integration | OAuth flow implementation, provider configs | Clerk | Pre-built OAuth for Google, GitHub, etc. - handles redirect URLs, state management, token exchange |
| Database migrations | Manual ALTER TABLE scripts, version tracking | Drizzle Kit | Generates type-safe migrations, tracks schema history, handles renames, rollbacks |
| Connection pooling | Manual pool management, cleanup logic | pg Pool + @vercel/functions attachDatabasePool | Handles connection lifecycle, prevents leaks, graceful shutdown in serverless |
| Spatial queries | String-based SQL with coordinates | PostGIS with Drizzle geometry types | Spatial indexes (GIST), distance calculations, proper projections, optimized queries |
| Timezone conversion | Manual offset calculations | PostgreSQL timestamptz + browser Intl API | Handles DST transitions, leap seconds, historical offset changes |

**Key insight:** Authentication, session management, and spatial/temporal data handling have complex edge cases that are easy to get wrong. Use battle-tested libraries that handle security, timezone DST transitions, OAuth redirect vulnerabilities, connection leaks, and migration conflicts. The time saved on initial development is minimal compared to debugging production issues from custom implementations.

## Common Pitfalls

### Pitfall 1: All Routes Public by Default
**What goes wrong:** Assuming routes are protected after installing Clerk - sensitive pages remain publicly accessible
**Why it happens:** `clerkMiddleware()` defaults to making all routes public. From Clerk docs: "By default, clerkMiddleware() will not protect any routes. All routes are public and you must opt-in to protection."
**How to avoid:** Explicitly define protected routes with `createRouteMatcher()` and call `auth.protect()` for matched routes
**Warning signs:** Can access `/trips` or `/api/trips` without signing in, no redirect to login page
```typescript
// WRONG - no protection
export default clerkMiddleware();

// CORRECT - explicit protection
const isProtectedRoute = createRouteMatcher(['/trips(.*)']);
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

### Pitfall 2: Using `timestamp` Instead of `timestamptz`
**What goes wrong:** Date queries return wrong results after DST changes, user sees wrong event times
**Why it happens:** PostgreSQL `timestamp` stores clock time without timezone, causing ambiguity during DST transitions
**How to avoid:** Always use `timestamp('column', { withTimezone: true })` in Drizzle schemas, verify with `\d+ table_name` showing `timestamp with time zone`
**Warning signs:** Events shift by 1 hour after DST change, date filters return unexpected results, dates display differently per user timezone
```typescript
// WRONG - loses timezone context
startDate: timestamp('start_date').notNull(),

// CORRECT - preserves timezone
startDate: timestamp('start_date', { withTimezone: true }).notNull(),
```

### Pitfall 3: Database Connection Exhaustion in Serverless
**What goes wrong:** Application works locally but fails in production with "too many connections" errors
**Why it happens:** Each serverless function invocation opens new database connections without cleanup, exhausting PostgreSQL connection limits
**How to avoid:** Use global connection pool with `attachDatabasePool()` (Vercel) or switch to HTTP-based driver (Neon) for edge environments
**Warning signs:** Works fine with low traffic, crashes under load, PostgreSQL connection count keeps growing, functions timeout
```typescript
// WRONG - creates new pool per request
export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  // ...
}

// CORRECT - global pool with cleanup
const pool = new Pool({ /* ... */ });
attachDatabasePool(pool);
export const db = drizzle({ client: pool });
```

### Pitfall 4: Missing ClerkProvider in Root Layout
**What goes wrong:** `auth()` throws error: "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"
**Why it happens:** Clerk components and hooks require `<ClerkProvider>` wrapping the component tree
**How to avoid:** Wrap entire app in root `layout.tsx` with `<ClerkProvider>`, verify middleware.ts exists and is correctly named
**Warning signs:** Auth hooks fail, `useUser()` returns undefined, console shows Clerk detection errors
```typescript
// WRONG - missing provider
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}

// CORRECT - wrapped with provider
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

### Pitfall 5: Not Validating Environment Variables at Build Time
**What goes wrong:** Missing environment variables cause runtime crashes in production after successful deployment
**Why it happens:** Next.js doesn't validate environment variables by default - missing vars only discovered when code executes
**How to avoid:** Import `env.ts` in `next.config.ts` to trigger validation during build, deployment fails fast with clear error messages
**Warning signs:** Build succeeds but app crashes on first request, generic "undefined is not a function" errors, hard to debug env-related issues
```typescript
// WRONG - no build-time check
const nextConfig = { /* ... */ };
export default nextConfig;

// CORRECT - validates on build
import "./src/env";  // Throws if env vars missing/invalid
const nextConfig = { /* ... */ };
export default nextConfig;
```

### Pitfall 6: Modifying Drizzle Migration History
**What goes wrong:** Migration conflicts, schema drift between environments, data loss in production
**Why it happens:** Developers hand-edit generated migration files or modify previously-applied migrations instead of creating new ones
**How to avoid:** Never edit files in `drizzle/` folder - always run `drizzle-kit generate` for schema changes, treat migrations as immutable after applied
**Warning signs:** Migration errors in production, `drizzle-kit push` says schema matches but tables don't exist, team members have different schemas
```bash
# WRONG - editing existing migration
vim drizzle/0001_add_column.sql  # Manual edits

# CORRECT - generate new migration
npm run drizzle-kit generate  # Creates new timestamped migration
```

### Pitfall 7: Fetching Data in Layouts
**What goes wrong:** Authentication checks in layouts don't re-run on navigation, causing stale auth state
**Why it happens:** Next.js layouts don't re-render during client-side navigation (performance optimization)
**How to avoid:** Perform auth checks in page components or Server Components that re-render, avoid critical logic in layouts
**Warning signs:** User logs out but layout still shows authenticated state, auth checks only work on hard refresh
```typescript
// WRONG - auth check in layout (doesn't re-run)
export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');  // Only runs on first load
  return <div>{children}</div>;
}

// CORRECT - auth check in page component
export default async function TripsPage() {
  const { userId } = await auth();  // Re-runs on every navigation
  if (!userId) redirect('/sign-in');
  // ...
}
```

## Code Examples

Verified patterns from official sources:

### Database Client Setup with Drizzle
```typescript
// Source: https://orm.drizzle.team/docs/get-started/postgresql-new
// src/db/index.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Creating PostGIS Extension and Spatial Index
```sql
-- Source: https://orm.drizzle.team/docs/guides/postgis-geometry-point
-- drizzle/0001_enable_postgis.sql (manual migration)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Generated by drizzle-kit from schema
CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "trip_id" uuid NOT NULL,
  "name" text NOT NULL,
  "location" geometry(Point, 4326),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "events_location_idx"
  ON "events" USING gist ("location");
```

### CRUD Operations with Drizzle
```typescript
// Source: https://orm.drizzle.team/docs/get-started/postgresql-new
// src/db/queries/trips.ts
import { db } from '@/db';
import { trips, events } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Create trip
export async function createTrip(userId: string, data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  const [trip] = await db.insert(trips).values({
    userId,
    ...data,
  }).returning();

  return trip;
}

// Get user's trips
export async function getTripsForUser(userId: string) {
  return db.select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(trips.startDate);
}

// Get single trip with authorization
export async function getTripById(tripId: string, userId: string) {
  const [trip] = await db.select()
    .from(trips)
    .where(and(
      eq(trips.id, tripId),
      eq(trips.userId, userId)  // Ownership check
    ));

  if (!trip) {
    throw new Error('Trip not found');
  }

  return trip;
}

// Update trip
export async function updateTrip(
  tripId: string,
  userId: string,
  data: Partial<typeof trips.$inferInsert>
) {
  const [updated] = await db.update(trips)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(trips.id, tripId),
      eq(trips.userId, userId)
    ))
    .returning();

  return updated;
}

// Delete trip (cascades to events)
export async function deleteTrip(tripId: string, userId: string) {
  await db.delete(trips)
    .where(and(
      eq(trips.id, tripId),
      eq(trips.userId, userId)
    ));
}

// Get events within date range with spatial data
export async function getEventsInRange(
  tripId: string,
  startDate: Date,
  endDate: Date
) {
  return db.select()
    .from(events)
    .where(and(
      eq(events.tripId, tripId),
      gte(events.startTime, startDate),
      lte(events.startTime, endDate)
    ))
    .orderBy(events.startTime);
}
```

### Spatial Query with PostGIS
```typescript
// Source: https://orm.drizzle.team/docs/guides/postgis-geometry-point
// src/db/queries/locations.ts
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { events } from '@/db/schema';

// Insert event with location
export async function createEventWithLocation(data: {
  tripId: string;
  name: string;
  startTime: Date;
  latitude: number;
  longitude: number;
  address?: string;
}) {
  const { latitude, longitude, ...eventData } = data;

  const [event] = await db.insert(events).values({
    ...eventData,
    location: { x: longitude, y: latitude },  // Note: x=long, y=lat
  }).returning();

  return event;
}

// Find events within radius (in meters)
export async function findEventsNearLocation(
  tripId: string,
  latitude: number,
  longitude: number,
  radiusMeters: number
) {
  return db.select()
    .from(events)
    .where(sql`
      ${events.tripId} = ${tripId}
      AND ST_DWithin(
        ${events.location},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
    `)
    .orderBy(sql`
      ST_Distance(
        ${events.location},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      )
    `);
}
```

### Clerk Authentication in Server Component
```typescript
// Source: https://clerk.com/docs/nextjs/guides/users/reading
// app/(dashboard)/trips/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTripsForUser } from '@/db/queries/trips';
import { TripCard } from '@/components/trips/trip-card';

export default async function TripsPage() {
  // Option 1: Get just userId
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Option 2: Get full user object (only if needed - makes network request)
  // const user = await currentUser();
  // const trips = await getTripsForUser(user.id);

  const trips = await getTripsForUser(userId);

  return (
    <div>
      <h1>My Trips</h1>
      {trips.length === 0 ? (
        <p>No trips yet. Create your first trip!</p>
      ) : (
        <div className="grid gap-4">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Protected API Route
```typescript
// Source: https://clerk.com/docs/references/nextjs/auth
// app/api/trips/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTrip } from '@/db/queries/trips';

const createTripSchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createTripSchema.parse(body);

    const trip = await createTrip(userId, {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Failed to create trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router with React Server Components | Next.js 13 (stable in 14) | Server-first by default, better performance, streaming, simplified data fetching |
| `getServerSideProps` | Direct async/await in Server Components | Next.js 13+ | No special data fetching API, simpler code, better TypeScript inference |
| `middleware.ts` Edge-only | `middleware.ts` with Node.js runtime support | Next.js 15.2 | Can use full Node.js APIs in middleware, better compatibility with auth libraries |
| `serial` for IDs | `identity` columns | PostgreSQL best practices 2025+ | Modern standard, better control, explicit semantics |
| NextAuth.js v4 | NextAuth.js v5 (Auth.js) or dedicated providers | 2024-2025 | Breaking changes in v5, many teams switching to Clerk/Auth0 for better DX |
| Manual env validation | T3 Env with Zod | Community standard 2024+ | Type safety, runtime validation, build-time errors |
| Connection per request | Global pool with `attachDatabasePool` | Vercel Functions API | Prevents connection exhaustion in serverless |
| `timestamp` for UTC | `timestamptz` (timestamp with time zone) | PostgreSQL best practices (always) | Proper timezone handling, DST-safe, no ambiguity |

**Deprecated/outdated:**
- **Pages Router patterns:** Not deprecated but App Router is recommended for new projects - better performance, simpler patterns
- **`getStaticProps`/`getServerSideProps`:** Replaced by Server Components with native async/await
- **Client-only auth checks:** Modern pattern requires defense-in-depth (middleware + server + data layer)
- **`serial` primary keys:** Use `identity` or UUID instead for modern PostgreSQL applications
- **Storing env vars in `next.config.js` publicly:** Security risk - use T3 Env to keep server vars truly private

## Open Questions

Things that couldn't be fully resolved:

1. **Email provider for password reset**
   - What we know: Clerk handles email sending for password reset flows
   - What's unclear: Default email provider, customization options, deliverability, whether SMTP configuration needed
   - Recommendation: Start with Clerk's default email service, evaluate deliverability in development, plan for custom SMTP if needed for production (likely not required unless white-label branding needed)

2. **PostGIS polygon support for future features**
   - What we know: Drizzle supports `geometry('column', { type: 'point' })`, polygons require custom type implementation
   - What's unclear: Exact implementation for polygon support, whether upcoming Drizzle version will add native support
   - Recommendation: Start with point geometry for Phase 1, defer polygon implementation to later phase when geographic boundaries needed (if at all)

3. **Multi-region deployment and database replication**
   - What we know: Serverless deployments benefit from edge locations, but PostgreSQL is typically single-region
   - What's unclear: Whether Vercel Edge Functions + Neon serverless driver provides acceptable latency, read replica strategy
   - Recommendation: Start single-region deployment, monitor P95/P99 latency, evaluate Neon branch/replica features if global users cause performance issues

4. **Clerk organization/tenant support for shared trips (future)**
   - What we know: Clerk supports organizations for multi-tenant applications
   - What's unclear: Whether trip sharing feature (future phase) should use Clerk organizations or custom sharing table
   - Recommendation: Use simple `userId` foreign key for Phase 1 (single-user trips), defer sharing architecture decision to future phase when requirements clarified

## Sources

### Primary (HIGH confidence)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) - Official setup guide
- [Clerk Middleware Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware) - Route protection patterns
- [Drizzle ORM PostgreSQL Getting Started](https://orm.drizzle.team/docs/get-started/postgresql-new) - Official setup and CRUD
- [Drizzle ORM PostGIS Guide](https://orm.drizzle.team/docs/guides/postgis-geometry-point) - Spatial data handling
- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - Official conventions
- [Next.js Server Components Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Component architecture
- [T3 Env Next.js Documentation](https://env.t3.gg/docs/nextjs) - Environment variable validation
- [Vercel Serverless Connection Pooling Guide](https://vercel.com/guides/connection-pooling-with-serverless-functions) - Database connections
- [PostgreSQL Timestamp Documentation](https://www.postgresql.org/docs/current/datatype-datetime.html) - Official datetime types
- [PostgreSQL Wiki: Don't Do This](https://wiki.postgresql.org/wiki/Don't_Do_This) - Anti-patterns

### Secondary (MEDIUM confidence)
- [Complete Authentication Guide for Next.js App Router](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) - Best practices overview
- [Clerk vs Auth0 Technical Comparison](https://clerk.com/articles/clerk-vs-auth0-for-nextjs) - Auth provider analysis
- [Drizzle ORM Best Practices Gist](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) - Community practices
- [Next.js App Router Advanced Patterns](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7) - 2026 architecture patterns
- [How to Store Time in PostgreSQL](https://www.bytebase.com/reference/postgres/how-to/how-to-store-time-postgres/) - Timezone best practices
- [Neon Guides: Drizzle with Serverless](https://neon.com/guides/drizzle-local-vercel) - Serverless setup patterns

### Tertiary (LOW confidence - community sources)
- WebSearch: "Next.js 15 with Clerk authentication best practices 2026" - Community articles
- WebSearch: "Drizzle ORM PostgreSQL common mistakes gotchas 2026" - Bug reports and gotchas
- WebSearch: "timezone handling best practices web applications 2026" - General web dev practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation, version numbers confirmed, installation steps tested
- Architecture patterns: HIGH - Patterns extracted from official docs and verified with multiple sources, code examples from authoritative sources
- Pitfalls: HIGH - Pitfalls sourced from official documentation (Clerk default behavior), PostgreSQL wiki, and verified community experiences

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable stack, but Next.js and Clerk update frequently)

**Critical security note:** Applications using Next.js 11.1.4 through 15.2.2 are vulnerable to CVE-2025-29927 in self-hosted deployments. Must upgrade to Next.js 15.2.3+, 14.2.25+, 13.5.9+, or 12.3.5+ immediately.
