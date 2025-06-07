// app/api/profile/getUser/route.ts

export const dynamic = 'force-dynamic';       // ← ensure this route can use dynamic cookies
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // Pass the raw `cookies` into the helper
  const supabase = createRouteHandlerClient({ cookies });

  // Now this will correctly read the JWT from the sb-…-auth-token cookie
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch or create their profile row as before
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }

  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id:    user.id,
        first_name: 'First Name',
        last_name:  'Last Name',
        avatar_url: '',
        updated_at: new Date().toISOString(),
      })
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }
    profile = newProfile;
  }

  return NextResponse.json({ user, profile }, { status: 200 });
}
