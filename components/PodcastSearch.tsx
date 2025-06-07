// components/PodcastSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PodcastSearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear results when term is cleared
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
    <div className="w-full max-w-md mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search podcast name…"
          value={term}
          onChange={(e) => setTerm(e.currentTarget.value)}
          className="flex-1 border px-2 py-1 rounded bg-white"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-4 space-y-3 max-h-64 overflow-auto">
          {results.map((show) => (
            <li key={show.collectionId} className="flex items-center gap-4">
              <img
                src={show.artworkUrl100}
                alt={show.collectionName}
                className="w-12 h-12 rounded"
              />
              <div>
                <p className="font-semibold">{show.collectionName}</p>
                <p className="text-sm text-gray-600">{show.artistName}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
