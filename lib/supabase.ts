'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use the standard ANON_KEY name we fixed in the .env.local
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}