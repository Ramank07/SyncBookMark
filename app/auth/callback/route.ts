import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) return NextResponse.redirect(url.origin)

  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('AUTH CALLBACK ERROR:', error.message)
  }

  return NextResponse.redirect(url.origin)
}
