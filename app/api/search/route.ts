// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term')?.trim();

  if (!term) {
    return NextResponse.json(
      { error: 'Missing `?term=` query parameter' },
      { status: 400 }
    );
  }

  // Call iTunes Search API for podcasts:
  const itunesRes = await fetch(
    `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(term)}`
  );
  if (!itunesRes.ok) {
    return NextResponse.json(
      { error: `iTunes API error (${itunesRes.status})` },
      { status: 502 }
    );
  }

  const data: any = await itunesRes.json();
  // Return just the array of results
  return NextResponse.json(data.results);
}
