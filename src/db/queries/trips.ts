// src/db/queries/trips.ts
import { eq, desc } from 'drizzle-orm';
import { db, trips, type Trip } from '@/db';

/**
 * Create a new trip
 */
export async function createTrip(data: {
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
}): Promise<Trip> {
  const [trip] = await db
    .insert(trips)
    .values({
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    .returning();

  if (!trip) {
    throw new Error('Failed to create trip');
  }

  return trip;
}

/**
 * Get all trips, ordered by start date descending
 */
export async function getAllTrips(): Promise<Trip[]> {
  return db
    .select()
    .from(trips)
    .orderBy(desc(trips.startDate));
}

/**
 * Get a single trip by ID
 */
export async function getTripById(tripId: string): Promise<Trip | null> {
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId));

  return trip ?? null;
}

/**
 * Update a trip
 */
export async function updateTrip(
  tripId: string,
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
    .where(eq(trips.id, tripId))
    .returning();

  return updated ?? null;
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: string): Promise<boolean> {
  const result = await db
    .delete(trips)
    .where(eq(trips.id, tripId))
    .returning({ id: trips.id });

  return result.length > 0;
}
