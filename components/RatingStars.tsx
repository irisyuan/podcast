"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";

interface RatingStarsProps {
  podcastId: string;       // iTunes ID as text
  title: string;           // Podcast name
  description: string;     // Podcast description
  releaseDate: string;     // Podcast release date
  coverArtUrl?: string;    // Podcast artwork URL
}

export default function RatingStars({
  podcastId,
  title,
  description,
  releaseDate,
  coverArtUrl,
}: RatingStarsProps) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Load existing rating and review if any
      const { data: existing, error: rError } = await supabase
        .from("ratings")
        .select("user_rating, review_text")
        .eq("podcast_id", podcastId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!rError && existing) {
        setRating(existing.user_rating);
        setReviewText(existing.review_text || "");
      }
    }

    init();
  }, [supabase, router, podcastId]);

  const saveRating = async (value: number) => {
    if (!user) {
      setError("You must be signed in to rate.");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    setSavedMessage(null);

    try {
      setRating(value);
      setHoverRating(0);

      // 1) Upsert podcast metadata along with ID
      const { error: podError } = await supabase
        .from("podcasts")
        .upsert(
          {
            id: podcastId,
            title,
            description,
            release_date: releaseDate,
            cover_art_url: coverArtUrl,
          },
          { onConflict: ['id'] }
        )
        .select();

      if (podError) {
        console.error("Error saving podcast metadata:", podError);
        throw podError;
      }

      // 2) Upsert user rating and review
      const { error: upsertError } = await supabase
        .from("ratings")
        .upsert(
          {
            podcast_id: podcastId,
            user_id: user.id,
            user_rating: value,
            review_text: reviewText,
          },
          { onConflict: ['podcast_id', 'user_id'] }
        );

      if (upsertError) {
        console.error("Error saving rating:", upsertError);
        throw upsertError;
      }

      setSavedMessage("Saved!");
    } catch (err) {
      console.error("Error saving rating:", err);
      setError("Unable to save rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
          const isFilled = hoverRating >= star || rating >= star;
          return (
            <Star
              key={star}
              size={24}
              className={`cursor-pointer transition-colors ${
                isFilled ? "text-yellow-400" : "text-gray-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => saveRating(star)}
              style={{
                fill: isFilled ? "currentColor" : "transparent",
                stroke: "currentColor",
              }}
            />
          );
        })}
        {loading && <span className="ml-2 text-sm">Saving…</span>}
      </div>
      <textarea
        className="w-full border rounded p-2 resize-none bg-white text-black"
        placeholder="Write a review (optional)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
      />
      <div className="flex items-center gap-2">
        <button
          className="btn-primary px-4 py-2 rounded"
          onClick={() => saveRating(rating)}
          disabled={loading}
        >
          Save Review
        </button>
        {savedMessage && <span className="text-green-600 text-sm">{savedMessage}</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
}
