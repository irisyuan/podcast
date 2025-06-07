import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { Heart, History, Headphones } from "lucide-react";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm" className="text-sm">
        <Link href="/pods/friends" className="flex items-center gap-1">
          <Heart className="h-4 w-4" /> Friends
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="text-sm">
        <Link href="/pods/profile" className="flex items-center gap-1">
          <Headphones className="h-4 w-4" /> My Profile
        </Link>
      </Button>
      <span>
        {user.email}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2 items-center">
      <Link href="/sign-in" className="text-sm">Log in</Link>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up" className="btn-primary">Sign up</Link>
      </Button>
    </div>
  );
}
