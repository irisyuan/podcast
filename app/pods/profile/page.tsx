// app/pods/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfilePage() {
  const supabase = createClientComponentClient();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // 1) Load the session and log it
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("Supabase session object:", data.session);
      console.log("Logged-in user ID:", data.session?.user.id);
      setSession(data.session);
      setLoading(false);
    });
  }, [supabase]);

  // 2) Once we have a session, load the profile row and log it
  useEffect(() => {
    if (!session) return;

    console.log("Fetching profile for user id:", session.user.id);
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data, error }) => {
        console.log("Profile fetch result:", { data, error });
        if (data) {
          setFirstName(data.first_name);
          setLastName(data.last_name);
        }
      });
  }, [session, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    console.log("Updating profile for user id:", session.user.id);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id:    session.user.id,
        first_name: firstName,
        last_name:  lastName
      });

    console.log("Upsert error (if any):", error);
    if (!error) alert("Profile saved!");
  };

  if (loading) return <p className="p-4">Checking authentication…</p>;
  if (!session) return <p className="p-4">Please sign in to edit your profile.</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">
        {session.user.email}'s Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">First Name</label>
          <input
            className="mt-1 block w-full border px-2 py-1 rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input
            className="mt-1 block w-full border px-2 py-1 rounded"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
