"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ratings, setRatings] = useState<
    { id: string; user_rating: number; review_text: string; podcasts: { title: string } }[]
  >([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

      // load existing profile
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (!fetchError && profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
      }

      // load user ratings with podcast titles
      const { data: userRatings, error: ratingsError } = await supabase
        .from("ratings")
        .select(`id, 
          user_rating, 
          review_text, 
   podcasts!inner(
    id,
     title
   )`)  
        .eq("user_id", user.id);

      if (!ratingsError && userRatings) {
        setRatings(userRatings as any);
      }

      setLoading(false);
    }

    init();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaveMessage(null);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!res.ok) {
      console.error("Failed to update profile:", await res.text());
      setSaveMessage("Error saving profile");
      return;
    }

    setSaveMessage("Saved!");
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="w-full px-4 mt-8 grid grid-cols-3 gap-6">
      {/* Profile Form - 1/3 width */}
      <div className="col-span-1 p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium">First Name</label>
            <input
              className="mt-1 block w-full border px-2 py-1 rounded bg-white"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Last Name</label>
            <input
              className="mt-1 block w-full border px-2 py-1 rounded bg-white"
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
              required
            />
          </div>

          <div className="flex items-center">
            <button type="submit" className="btn-primary px-4 py-2 rounded">
              Save Profile
            </button>
            {saveMessage && <span className="ml-4 text-green-600">{saveMessage}</span>}
          </div>
        </form>
      </div>

      {/* User Ratings Table - 2/3 width */}
      <div className="col-span-2 p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-4">Your Podcast Ratings</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border-b px-2 py-1 text-left">Podcast</th>
              <th className="border-b px-2 py-1 text-left">Rating</th>
              <th className="border-b px-2 py-1 text-left">Review</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-center">
                  You haven't reviewed any podcasts yet.
                </td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border-b px-2 py-2">


                  <Link
                  href={`/pods/${r.podcasts.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {r.podcasts.title}
                </Link></td>
                  <td className="border-b px-2 py-2">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => {
                        const filled = i < r.user_rating;
                        return (
                          <Star
                            key={i}
                            size={16}
                            fill={filled ? "currentColor" : "none"}
                            stroke="currentColor"
                            className="mr-1"
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="border-b px-2 py-2">{r.review_text}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
