// app/pods/[podcastId]/page.tsx

import { notFound } from "next/navigation";
import RatingStars from "@/components/RatingStars";

interface Show {
  collectionName: string;
  artistName: string;
  releaseDate: string;
  feedUrl: string;
  artworkUrl100?: string;
}

export const revalidate = 60; // ISR cache for 60s

// Destructure `podcastId` directly out of `params`
export default async function PodcastPage({
  params: { podcastId },
}: {
  params: { podcastId: string };
}) {
  // 1) iTunes Lookup
  const lookupRes = await fetch(
    `https://itunes.apple.com/lookup?id=${podcastId}`,
    { next: { revalidate: 60 } }
  );
  if (!lookupRes.ok) notFound();
  const lookupJson = await lookupRes.json();
  const show: Show = lookupJson.results[0];
  if (!show || !show.feedUrl) notFound();

  // 2) Fetch RSS feed description (stripped/sanitized as before)...
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
    /* ignore */
  }
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
    <div className="max-w-2xl mx-auto px-6 py-6 pb-12 flex flex-col md:flex-row gap-6">
      {show.artworkUrl100 && (
        <img
          src={show.artworkUrl100}
          alt={show.collectionName}
          className="w-32 h-32 rounded"
        />
      )}
      <div className="flex-1">
      <h1> 
        {/* ⭐️ Star rating UI */}
        <RatingStars podcastId={podcastId} /></h1>



        <h1 className="text-3xl font-bold mb-2">{show.collectionName}</h1>
        <p className="text-sm text-gray-600 mb-4">
          By {show.artistName} • Released{" "}
          {new Date(show.releaseDate).toLocaleDateString()}
        </p>



        {description && (
          <div className="prose mb-6">
            <p>{description}</p>
          </div>
        )}

      
      </div>
    </div>
  );
}
