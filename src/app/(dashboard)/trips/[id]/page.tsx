import { notFound } from "next/navigation";
import Link from "next/link";
import { getTripById } from "@/db/queries/trips";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";

// Don't pre-render - needs database at runtime
export const dynamic = "force-dynamic";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const trip = await getTripById(id);

  if (!trip) {
    notFound();
  }

  // Format dates for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const startDate = formatDate(trip.startDate);
  const endDate = formatDate(trip.endDate);

  // Calculate trip duration
  const durationMs =
    new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/trips"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to trips
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{trip.name}</h2>
            <Link
              href={`/trips/${trip.id}/edit`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Edit
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {durationDays} {durationDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Dates</h3>
            <p className="text-gray-900">
              {startDate} &mdash; {endDate}
            </p>
          </div>

          {trip.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <p className="text-gray-900 whitespace-pre-wrap">
                {trip.description}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <DeleteTripButton tripId={trip.id} tripName={trip.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
