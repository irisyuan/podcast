// app/api/ratings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const {
      podcast_id,
      title,
      description,
      release_date,
      cover_art_url,
      user_rating,
      review_text,
    } = await request.json();

    if (!podcast_id || typeof user_rating !== 'number') {
      return NextResponse.json(
        { error: 'Missing required rating fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 1) Upsert podcast metadata
    const { error: podError } = await supabase
      .from('podcasts')
      .upsert(
        {
          id: podcast_id,
          title,
          description,
          release_date,
          cover_art_url,
        },
        { onConflict: ['id'] }
      )
      .select();
    if (podError) {
      console.error('Error upserting podcast metadata:', podError);
      return NextResponse.json(
        { error: 'Failed to save podcast metadata' },
        { status: 500 }
      );
    }

    // 2) Upsert user rating
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert(
        {
          podcast_id,
          user_id: user.id,
          user_rating,
          review_text: review_text ?? '',
        },
        { onConflict: ['podcast_id', 'user_id'] }
      );
    if (upsertError) {
      console.error('Error upserting rating:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Rating and metadata saved' });
  } catch (err) {
    console.error('Unexpected error in POST /api/ratings:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const podcast_id = url.searchParams.get('podcast_id');

    if (!podcast_id) {
      return NextResponse.json(
        { error: 'Missing podcast_id' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch single rating for this user and podcast
    const { data: rating, error } = await supabase
      .from('ratings')
      .select('user_rating, review_text')
      .eq('podcast_id', podcast_id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching rating:', error);
      return NextResponse.json({ rating: null });
    }

    return NextResponse.json({ rating });
  } catch (err) {
    console.error('Unexpected error in GET /api/ratings:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
