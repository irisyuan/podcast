// components/PodcastSearch.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PodcastSearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear results and errors when term is emptied
  useEffect(() => {
    if (term.trim() === "") {
      setResults([]);
      setError(null);
    }
  }, [term]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    if (!term.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || res.statusText);
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-2/3 mb-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          placeholder="Search podcast name…"
          value={term}
          onChange={(e) => setTerm(e.currentTarget.value)}
          className="
            flex-1
            border border-gray-300
            px-4
            h-12
            rounded-lg
            bg-white
            text-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
        <Button
          type="submit"
          className="btn-primary h-12 !px-4 !py-0 text-lg"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {results.length > 0 && (
        <ul
          className="
            mt-4
            w-full
            bg-white rounded-lg shadow-lg
            max-h-[60vh] overflow-auto
            divide-y divide-gray-200
          "
        >
          {results.map((show) => (
            <li key={show.collectionId}>
              <Link
                href={`/pods/${show.collectionId}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <img
                  src={show.artworkUrl100}
                  alt={show.collectionName}
                  className="w-16 h-16 rounded"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {show.collectionName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {show.artistName}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
