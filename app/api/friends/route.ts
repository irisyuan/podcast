// app/api/friends/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all friends for this user, and join into profiles on friend_id = profiles.user_id
  const { data: friends, error } = await supabase
    .from('friends')
    .select(`
      friend_id,
      profiles (
        first_name,
        last_name
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to load friends' }, { status: 500 });
  }

  // friends will be an array of:
  // { friend_id: '...', profiles: { first_name: '...', last_name: '...' } }
  return NextResponse.json({ friends });
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { friend_id } = await request.json()
  if (!friend_id) {
    return NextResponse.json({ error: 'Missing friend_id' }, { status: 400 })
  }

  const { data: inserted, error } = await supabase
    .from('friends')
    .insert({ user_id: user.id, friend_id })
    .select()        // return the new row
    .single()

  if (error) {
    console.error('Error adding friend:', error)
    return NextResponse.json({ error: 'Could not add friend' }, { status: 500 })
  }

  return NextResponse.json({ friend: inserted })
}