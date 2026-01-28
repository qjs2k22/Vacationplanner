// src/app/api/trips/route.ts
import { NextResponse } from 'next/server';
import { createTrip, getAllTrips } from '@/db/queries/trips';
import { createTripSchema } from '@/lib/validations';

/**
 * GET /api/trips - Get all trips
 */
export async function GET() {
  try {
    const trips = await getAllTrips();
    return NextResponse.json(trips);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips - Create a new trip
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createTripSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, startDate, endDate } = validated.data;

    const trip = await createTrip({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
