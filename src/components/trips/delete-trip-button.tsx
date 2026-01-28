"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteTripButtonProps {
  tripId: string;
  tripName: string;
}

export function DeleteTripButton({ tripId, tripName }: DeleteTripButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete trip");
      }

      // Redirect to trips list
      router.push("/trips");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        {error && (
          <div className="text-red-700 text-sm mb-3">{error}</div>
        )}
        <p className="text-sm text-gray-700 mb-3">
          Are you sure you want to delete <strong>{tripName}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            onClick={() => {
              setIsConfirming(false);
              setError(null);
            }}
            disabled={isDeleting}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      Delete trip
    </button>
  );
}
