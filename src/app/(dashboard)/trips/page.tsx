import Link from "next/link";
import { getAllTrips } from "@/db/queries/trips";
import { TripCard } from "@/components/trips/trip-card";

// Don't pre-render - needs database at runtime
export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await getAllTrips();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
        <Link
          href="/trips/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-8">
            No trips yet. Create your first trip to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
