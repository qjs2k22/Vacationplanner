# Trip Coordinator

AI-powered trip planning app. Upload bookings, build a wishlist, and let Claude generate optimized itineraries.

## Current Status

**Phase 1 of 8 complete** — Core infrastructure built, ready for deployment.

### What's Built

- Trip management (create, view, edit, delete trips)
- PostgreSQL database with Drizzle ORM
- Settings page for Claude API key
- Netlify deployment configuration

### What's NOT Built Yet

- Event/booking management (Phase 2)
- Google Places / Yelp integration (Phase 3)
- AI itinerary generation (Phase 4)
- Map and timeline views (Phase 5)
- Document parsing for bookings (Phase 6)
- Drag-and-drop editing (Phase 7)
- Calendar export and sharing (Phase 8)

## Setup

### 1. Create Database (Neon - free tier)

1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string (starts with `postgresql://`)

### 2. Configure Environment

Create `.env.local` in project root:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 3. Create Tables

```bash
npm install
npm run db:push
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Add environment variable: `DATABASE_URL`
4. Deploy

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS v4
- **AI**: Claude API (user provides their own key)
- **Hosting**: Netlify

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── trips/          # Trip list, detail, edit pages
│   │   └── settings/       # Claude API key configuration
│   └── api/trips/          # REST API endpoints
├── components/trips/       # Trip UI components
├── db/
│   ├── schema.ts          # Database schema
│   ├── queries/           # Database query functions
│   └── index.ts           # Database client
└── lib/
    └── validations.ts     # Zod schemas for API validation
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

The Claude API key is entered by users in the app's Settings page and stored in their browser's localStorage.
