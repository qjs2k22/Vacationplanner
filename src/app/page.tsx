import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If already logged in, redirect to trips
  if (userId) {
    redirect("/trips");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trip Coordinator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your bookings, build a wishlist, and let AI create the perfect
          itinerary for your trip.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-blue-600 px-6 py-3 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
