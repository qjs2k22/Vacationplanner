"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface ParsedBooking {
  type: "flight" | "hotel" | "restaurant" | "activity" | "other";
  name: string | null;
  confirmationNumber: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  notes: string | null;
}

const CLAUDE_API_KEY_STORAGE_KEY = "claude_api_key";

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedBooking | null>(null);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getApiKey = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CLAUDE_API_KEY_STORAGE_KEY);
    }
    return null;
  };

  const processFile = async (file: File) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      setError("Please add your Claude API key in Settings first.");
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an image (JPG, PNG, GIF, WebP) or PDF file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setRawResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("apiKey", apiKey);

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse document");
      }

      if (data.parsed) {
        setResult(data.data);
      } else {
        setRawResult(data.raw);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearResult = () => {
    setResult(null);
    setRawResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${isProcessing ? "opacity-50 cursor-wait" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-600">Reading document with Claude...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Screenshot or PDF of booking confirmation
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          {error.includes("Settings") && (
            <Link
              href="/settings"
              className="block mt-2 text-red-800 underline font-medium"
            >
              Go to Settings
            </Link>
          )}
        </div>
      )}

      {/* Parsed Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-green-800">Extracted Information</h3>
            <button
              onClick={clearResult}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{result.type || "—"}</span>

              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{result.name || "—"}</span>

              <span className="text-gray-600">Confirmation #:</span>
              <span className="font-medium">{result.confirmationNumber || "—"}</span>

              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{result.date || "—"}</span>

              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {result.startTime || "—"}
                {result.endTime && ` - ${result.endTime}`}
              </span>

              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{result.location || "—"}</span>
            </div>
            {result.notes && (
              <div className="pt-2 border-t border-green-200">
                <span className="text-gray-600">Notes:</span>
                <p className="font-medium mt-1">{result.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Result (when JSON parsing failed) */}
      {rawResult && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-yellow-800">Claude&apos;s Response</h3>
            <button
              onClick={clearResult}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              Clear
            </button>
          </div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700">
            {rawResult}
          </pre>
        </div>
      )}
    </div>
  );
}
