// components/RatingStars.tsx
"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  podcastId: string;
}

export default function RatingStars({ podcastId }: RatingStarsProps) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing rating on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("ratings")
      .select("user_rating")
      .eq("podcast_id", podcastId)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching rating:", error.message);
        } else if (data) {
          setRating(data.user_rating);
        }
      });
  }, [podcastId, supabase, user]);

  const saveRating = async (value: number) => {
    if (!user) {
      setError("You must be signed in to rate.");
      return;
    }
    // Optimistic UI update
    setRating(value);
    setHoverRating(0);
    setLoading(true);
    setError(null);

    const { error: upsertError } = await supabase
      .from("ratings")
      .upsert(
        {
          podcast_id: podcastId,
          user_id: user.id,
          user_rating: value,
        },
        { onConflict: ["podcast_id", "user_id"] }
      )
      .select()
      .single();

    setLoading(false);
    if (upsertError) {
      console.error("Failed to save rating:", upsertError.message);
      setError("Unable to save rating");
    }
  };

  return (
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
        const isFilled = hoverRating >= star || rating >= star;
        return (
          <Star
            key={star}
            size={24}
            style={{
              fill: isFilled ? "currentColor" : "transparent",
              stroke: "currentColor",
            }}
            className={`cursor-pointer transition-colors ${
              isFilled ? "text-yellow-400" : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => saveRating(star)}
          />
        );
      })}
      {loading && <span className="ml-2 text-sm">Saving…</span>}
      {error && <span className="ml-2 text-sm text-red-600">{error}</span>}
    </div>
  );
}
