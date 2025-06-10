// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    // pull exactly the fields your form sends
    const { first_name, last_name } = await request.json();

    // validate them
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required profile fields' },
        { status: 400 }
      );
    }

    // server-side Supabase client
    const supabase = await createClient();

    // get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // upsert will insert or update based on user_id
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          first_name,
          last_name,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('Error upserting profile:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Unexpected error in POST /api/profile:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // fetch the single profile row for this user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Unexpected error in GET /api/profile:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
