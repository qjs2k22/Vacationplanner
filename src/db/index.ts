// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Check for Vercel environment to use proper connection handling
const isVercel = !!process.env.VERCEL;

// Create connection pool - reused across requests
// In serverless, this pool persists across warm invocations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                      // Max connections in pool
  idleTimeoutMillis: 5000,      // Close idle connections after 5s
  connectionTimeoutMillis: 10000, // Connection timeout
});

// For Vercel, attach cleanup handler
// This ensures connections are properly released before function suspension
if (isVercel) {
  // Dynamic import to avoid issues in non-Vercel environments
  import('@vercel/functions').then(({ attachDatabasePool }) => {
    attachDatabasePool(pool);
  }).catch(() => {
    // @vercel/functions not available - likely local dev
  });
}

// Export the Drizzle database instance
export const db = drizzle({
  client: pool,
  schema,
});

// Re-export schema for convenience
export * from './schema';
