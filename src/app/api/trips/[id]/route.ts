// src/app/api/trips/[id]/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getTripById, updateTrip, deleteTrip } from '@/db/queries/trips';
import { updateTripSchema } from '@/lib/validations';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/trips/[id] - Get a single trip
 */
export async function GET(
  req: Request,
  { params }: RouteParams
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const trip = await getTripById(id, userId);

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[id] - Update a trip
 */
export async function PATCH(
  req: Request,
  { params }: RouteParams
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = updateTripSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Build update data, converting dates if provided
    const updateData: Parameters<typeof updateTrip>[2] = {};

    if (validated.data.name !== undefined) {
      updateData.name = validated.data.name;
    }
    if (validated.data.description !== undefined) {
      updateData.description = validated.data.description;
    }
    if (validated.data.startDate !== undefined) {
      updateData.startDate = new Date(validated.data.startDate);
    }
    if (validated.data.endDate !== undefined) {
      updateData.endDate = new Date(validated.data.endDate);
    }

    const trip = await updateTrip(id, userId, updateData);

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Failed to update trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[id] - Delete a trip
 */
export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const deleted = await deleteTrip(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
