// app/api/friends/search/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim() || ''

  console.log('[friends/search] query:', query)
  if (query.length < 3) {
    return NextResponse.json([], { status: 200 })
  }

  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name')
    // match either first_name or last_name
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10)

  console.log('[friends/search] profiles:', profiles, 'error:', error)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = profiles.map(u => ({
    id: u.user_id,
    first_name: u.first_name,
    last_name: u.last_name,
  }))

  return NextResponse.json(results)
}
