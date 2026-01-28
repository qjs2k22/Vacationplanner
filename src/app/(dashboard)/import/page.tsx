import Link from "next/link";
import { DocumentUpload } from "@/components/document-upload";

export default function ImportPage() {
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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Import Booking
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a screenshot or PDF of your booking confirmation. Claude will
          extract the details automatically.
        </p>

        <DocumentUpload />

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Supported formats
          </h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Screenshots (PNG, JPG, WebP)</li>
            <li>• PDF booking confirmations</li>
            <li>• Flight, hotel, restaurant, activity bookings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
