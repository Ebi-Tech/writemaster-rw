import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    await supabase.auth.signOut()
  }
  
  return NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })
}