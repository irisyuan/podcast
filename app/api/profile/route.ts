// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Profile fetch error' }, { status: 500 });
    }

    // Fetch user ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('podcast_id, user_rating, review_text')
      .eq('user_id', user.id);
    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
      return NextResponse.json({ error: 'Ratings fetch error' }, { status: 500 });
    }

    return NextResponse.json({ profile, ratings });
  } catch (err) {
    console.error('Unexpected error in GET /api/profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { first_name, last_name } = await request.json();

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, first_name, last_name }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Error upserting profile:', upsertError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Unexpected error in POST /api/profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
