import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // 1) Grab the cookie store exactly once:
  const cookieStore = cookies();

  // 2) Pass that store into Supabase's helper:
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 3) Now get the user from Supabase Auth:
    const {
      data: { user },
    error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 4) Parse JSON body (your front end must send Content-Type: application/json)
  let body: { first_name?: string; last_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { first_name: firstName, last_name: lastName } = body;
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: 'Both first_name and last_name are required' },
      { status: 400 }
    );
  }

  // 5) Perform the update on the `profiles` table:
    const { error: updateError } = await supabase
      .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
        updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

    if (updateError) {
    console.error('Failed to update profile:', updateError);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

  // 6) Return success
  return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
} 
