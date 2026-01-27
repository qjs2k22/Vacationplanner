// src/components/trips/trip-card.tsx
import Link from "next/link";
import type { Trip } from "@/db/schema";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  // Format dates for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const startDate = formatDate(trip.startDate);
  const endDate = formatDate(trip.endDate);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{trip.name}</h3>

      <p className="text-sm text-gray-600 mb-3">
        {startDate} - {endDate}
      </p>

      {trip.description && (
        <p className="text-gray-500 text-sm line-clamp-2">{trip.description}</p>
      )}

      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
        View trip
        <svg
          className="ml-1 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
