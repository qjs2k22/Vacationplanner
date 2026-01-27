// src/db/queries/trips.ts
import { eq, and, desc } from 'drizzle-orm';
import { db, trips, type Trip, type NewTrip } from '@/db';

/**
 * Create a new trip for a user
 */
export async function createTrip(
  userId: string,
  data: {
    name: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
  }
): Promise<Trip> {
  const [trip] = await db
    .insert(trips)
    .values({
      userId,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    .returning();

  return trip;
}

/**
 * Get all trips for a user, ordered by start date descending
 */
export async function getTripsForUser(userId: string): Promise<Trip[]> {
  return db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.startDate));
}

/**
 * Get a single trip by ID, verifying ownership
 * Returns null if trip doesn't exist or doesn't belong to user
 */
export async function getTripById(
  tripId: string,
  userId: string
): Promise<Trip | null> {
  const [trip] = await db
    .select()
    .from(trips)
    .where(
      and(
        eq(trips.id, tripId),
        eq(trips.userId, userId) // Ownership check - defense in depth
      )
    );

  return trip ?? null;
}

/**
 * Update a trip, verifying ownership
 * Returns updated trip or null if not found/not owned
 */
export async function updateTrip(
  tripId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
  }>
): Promise<Trip | null> {
  const [updated] = await db
    .update(trips)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(trips.id, tripId),
        eq(trips.userId, userId) // Ownership check - defense in depth
      )
    )
    .returning();

  return updated ?? null;
}

/**
 * Delete a trip, verifying ownership
 * Returns true if deleted, false if not found/not owned
 */
export async function deleteTrip(
  tripId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(trips)
    .where(
      and(
        eq(trips.id, tripId),
        eq(trips.userId, userId) // Ownership check - defense in depth
      )
    )
    .returning({ id: trips.id });

  return result.length > 0;
}
