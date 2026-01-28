"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@/db/schema";

// Format Date object to YYYY-MM-DD for input[type="date"]
// Defined outside component to avoid hoisting issues with useState
function formatDateForInput(date: Date): string {
  const isoString = new Date(date).toISOString();
  return isoString.split("T")[0] ?? "";
}

interface TripFormProps {
  trip?: Trip; // If provided, form is in edit mode
}

export function TripForm({ trip }: TripFormProps) {
  const router = useRouter();
  const isEditing = !!trip;

  // Form state
  const [name, setName] = useState(trip?.name ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [startDate, setStartDate] = useState(
    trip?.startDate ? formatDateForInput(trip.startDate) : ""
  );
  const [endDate, setEndDate] = useState(
    trip?.endDate ? formatDateForInput(trip.endDate) : ""
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }

      if (new Date(endDate) < new Date(startDate)) {
        throw new Error("End date must be after start date");
      }

      const body = {
        name: name.trim(),
        description: description.trim() || null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      const url = isEditing ? `/api/trips/${trip.id}` : "/api/trips";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save trip");
      }

      const savedTrip = await response.json();

      // Redirect to trip detail page
      router.push(`/trips/${savedTrip.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Trip Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Summer vacation in Europe"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional notes about your trip..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            min={startDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEditing
              ? "Update Trip"
              : "Create Trip"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
