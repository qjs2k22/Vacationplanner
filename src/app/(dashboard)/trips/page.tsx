import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TripsPage() {
  // Defense-in-depth auth check (RESEARCH.md Pattern 1)
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled
        >
          New Trip
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          No trips yet. Create your first trip to get started!
        </p>
      </div>
    </div>
  );
}
