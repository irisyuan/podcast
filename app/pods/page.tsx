import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PodcastSearch from "@/components/PodcastSearch";
import { Star } from "lucide-react";
import Link from "next/link";


export default async function PodsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

 // Fetch all ratings with full podcast metadata
 const { data: ratings, error } = await supabase
 .from("ratings")
 .select(`
   id,
   user_rating,
   review_text,

   podcasts!inner(
    id,
     title,
     description,
     release_date,
     cover_art_url
   )
 `)
 .order("created_at", { ascending: false });


 return (
  <div className="flex-1 w-full flex flex-col gap-12 px-8 mx-auto text-left">
    <div className="flex flex-col gap-4 items-center mt-4">
      <h2 className="font-bold text-2xl">Podcasts</h2>

      {/* ← Search UI */}
      <PodcastSearch />

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Cover</th>
            <th className="py-2 px-4 text-left">Title</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-left">Release Date</th>
            <th className="py-2 px-4 text-left">Rating & Review</th>
            <th className="py-2 px-4 text-left">Added By</th>

          </tr>
        </thead>
        <tbody>
          {(!ratings || ratings.length === 0) && (
            <tr>
              <td colSpan={5} className="py-4 text-center">
                No ratings yet.
              </td>
            </tr>
          )}
          {ratings?.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border-b px-4 py-2">
                {r.podcasts.cover_art_url && (
                  <img
                    src={r.podcasts.cover_art_url}
                    alt={r.podcasts.title}
                    className="w-16 h-16 rounded"
                  />
                )}
              </td>
              <td className="border-b px-4 py-2">
                <Link
                  href={`/pods/${r.podcasts.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {r.podcasts.title}
                </Link>
              </td>
              <td className="border-b px-4 py-2 text-sm">
                {r.podcasts.description.length > 200
                  ? r.podcasts.description.slice(0, 200) + "..."
                  : r.podcasts.description}
              </td>
              <td className="border-b px-4 py-2">
                {new Date(r.podcasts.release_date).toLocaleDateString()}
              </td>
              <td className="border-b px-4 py-2">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < r.user_rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      className="mr-1"
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-700">
                  {r.review_text || <em>No review provided</em>}
                </div>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}