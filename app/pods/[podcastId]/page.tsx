// app/pods/[podcastId]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RatingStars from "@/components/RatingStars";
import { Star } from "lucide-react";

interface Show {
  collectionName: string;
  artistName: string;
  releaseDate: string;
  feedUrl: string;
  artworkUrl100?: string;
}

interface PodcastPageProps {
  params: { podcastId: string };
}

export const revalidate = 60; // ISR cache for 60s

export default async function PodcastPage({ params }: PodcastPageProps) {
  const { podcastId } = params;
  const supabase = await createClient();

  // 1) iTunes Lookup
  const lookupRes = await fetch(
    `https://itunes.apple.com/lookup?id=${podcastId}`,
    { next: { revalidate } }
  );
  if (!lookupRes.ok) notFound();
  const lookupJson = await lookupRes.json();
  const show: Show = lookupJson.results[0];
  if (!show?.feedUrl) notFound();

  // 2) Fetch RSS feed description
  let rawDescription = "";
  try {
    const rssRes = await fetch(show.feedUrl);
    if (rssRes.ok) {
      const rssText = await rssRes.text();
      const match = rssText.match(
        /<channel>[\s\S]*?<description>([\s\S]*?)<\/description>/i
      );
      if (match) {
        rawDescription = match[1]
          .replace(/<!\[CDATA\[(.*?)\]\]>/i, "$1")
          .trim();
      }
    }
  } catch {
    /* ignore parsing errors */
  }

  // 3) Fetch ratings for this podcast
  // 3) Fetch ratings for this podcast, and pull in the reviewer's name
const { data: ratings = [], error } = await supabase
.from("ratings")
.select(`
  id,
  user_id,
  user_rating,
  review_text,

  profiles (
    first_name,
    last_name
  )
`)
.eq("podcast_id", podcastId)
.order("created_at", { ascending: false })

if (error) {
console.error("Error fetching ratings:", error)
} else {
console.log("Ratings with reviewer names:", ratings)
}


  // 4) Sanitize description
  const description = rawDescription
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

    return (
      <>
        {/* Full-width container */}
        <div className="w-full px-6 py-6">
          {/* 1-col on mobile → 3-cols on lg: main is 2 cols, sidebar is 1 col */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* === Main show info (left, 2/3 width on lg) === */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {show.artworkUrl100 && (
                  <img
                    src={show.artworkUrl100}
                    alt={show.collectionName}
                    className="w-32 h-32 rounded"
                  />
                )}
                <div className="flex-1 space-y-4">
                  
  
                  <h1 className="text-3xl font-bold">
                    {show.collectionName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    By {show.artistName} • Released{" "}
                    {new Date(show.releaseDate).toLocaleDateString()}
                  </p>
  
                  {description && (
                    <div className="prose">
                      <p>{description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {/* === Ratings & Reviews (right, 1/3 width on lg) === */}
            <aside className="lg:col-span-1 space-y-4">
              <h2 className="text-2xl font-semibold">
                Ratings & Reviews
              </h2>
              <RatingStars
                    podcastId={podcastId}
                    title={show.collectionName}
                    description={description}
                    releaseDate={show.releaseDate}
                    coverArtUrl={show.artworkUrl100}
                  />
              {ratings.length > 0 ? (
                <ul className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {ratings.map((r) => (
                    <li
                      key={r.id}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        {Array.from({ length: r.user_rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-500 fill-current"
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">
                          {r.user_rating}/5
                        </span>
                      </div>
                      {r.review_text ? (
                        <p className="text-gray-700">{r.review_text} - {r.profiles.first_name} {r.profiles.last_name}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No review text.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No ratings or reviews yet.</p>
              )}
            </aside>
          </div>
        </div>
      </>
    )
  }