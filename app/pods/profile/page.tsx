"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ratings, setRatings] = useState<
    { uuid: string; podcast_id: string; user_rating: number; review_text: string }[]
  >([]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.log("No user found, redirecting to login");
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

      // load user ratings
      const { data: userRatings, error: ratingsError } = await supabase
        .from("ratings")
        .select("uuid, podcast_id, user_rating, review_text")
        .eq("user_id", user.id);

      if (!ratingsError && userRatings) {
        setRatings(userRatings);
      }

      setLoading(false);
    }

    init();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      alert("Error saving profile");
      return;
    }

    alert("Profile saved!");
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="w-full mx-auto mt-0 grid grid-cols-3 gap-6">
      {/* Profile Form */}
      <div className="p-4 border rounded bg-white col-span-1">
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

          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* User Ratings Table */}
      <div className="p-4 border rounded bg-white col-span-2">
        <h2 className="text-xl font-semibold mb-4">Your Podcast Ratings</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border-b px-2 py-1 text-left">Podcast ID</th>
              <th className="border-b px-2 py-1 text-left">Rating</th>
              <th className="border-b px-2 py-1 text-left">Review</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-center">
                  You haven't reviewed any podcasts yet! <a href="/pods">Get started.</a>
                </td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.uuid} className="hover:bg-gray-50">
                  <td className="border-b px-2 py-2">{r.podcast_id}</td>
                  <td className="border-b px-2 py-2">{r.user_rating}</td>
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
