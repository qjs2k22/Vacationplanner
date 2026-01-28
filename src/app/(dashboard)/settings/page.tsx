"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CLAUDE_API_KEY_STORAGE_KEY = "claude_api_key";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const stored = localStorage.getItem(CLAUDE_API_KEY_STORAGE_KEY);
    if (stored) {
      setSavedKey(stored);
      setApiKey(stored);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setMessage(null);

    try {
      if (apiKey.trim()) {
        localStorage.setItem(CLAUDE_API_KEY_STORAGE_KEY, apiKey.trim());
        setSavedKey(apiKey.trim());
        setMessage({ type: "success", text: "API key saved successfully!" });
      } else {
        localStorage.removeItem(CLAUDE_API_KEY_STORAGE_KEY);
        setSavedKey("");
        setMessage({ type: "success", text: "API key removed." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save API key." });
    } finally {
      setIsSaving(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Claude API Key
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Required for AI itinerary generation. Get your key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                console.anthropic.com
              </a>
            </p>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {savedKey && (
              <p className="text-sm text-gray-500 mt-2">
                Current key: {maskApiKey(savedKey)}
              </p>
            )}
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save API Key"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
          <p className="text-sm text-gray-500">
            Your API key is stored locally in your browser and never sent to our servers.
            It&apos;s only used to communicate directly with Claude for generating itineraries.
          </p>
        </div>
      </div>
    </div>
  );
}
