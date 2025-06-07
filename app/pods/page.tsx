import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PodsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 px-8 mx-auto text-left">
      <div className="flex flex-col gap-4 items-center mt-4">
        <h2 className="font-bold text-2xl">Podcast Episodes</h2>
        <input
          type="text"
          placeholder="Search podcast name, episode, description..."
          className="w-full max-w-md p-2 border rounded-md bg-white"
        />
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Title</th>
              <th className="py-2">Description</th>
              <th className="py-2">Date</th>
              <th className="py-2">Review</th>
            </tr>
          </thead>
          <tbody>
            {/* Podcast episodes will be populated here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
