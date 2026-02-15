// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0


import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'

import BookmarkContainer from './components/BookmarkContainer'
import Navbar from './components/Navbar'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  // const cookieStore = await cookies()

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       getAll() {
  //         return cookieStore.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         try {
  //           cookiesToSet.forEach(({ name, value, options }) =>
  //             cookieStore.set(name, value, options)
  //           )
  //         } catch { /* Safe to ignore in Server Components */ }
  //       },
  //     },
  //   }
  // )
  const supabase = await createSupabaseServer()

const { data: { session } } = await supabase.auth.getSession()
const user = session?.user ?? null


  async function signIn() {
    'use server'
    // const cookieStore = await cookies()
    // const supabaseServer = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     cookies: {
    //       getAll() { return cookieStore.getAll() },
    //       setAll(cookiesToSet) {
    //         cookiesToSet.forEach(({ name, value, options }) =>
    //           cookieStore.set(name, value, options)
    //         )
    //       },
    //     },
    //   }
    // )
    const supabaseServer = await createSupabaseServer()

    const { data, error } = await supabaseServer.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        // redirectTo: 'http://localhost:3000/auth/callback',
      },
    })

    if (error) return redirect('/')
    if (data.url) return redirect(data.url)
  }

  // ✅ NEW LOGOUT SERVER ACTION
async function signOut() {
  'use server'

  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()

  redirect('/')
}



  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center">
          <h1 className="text-3xl font-extrabold mb-2 text-slate-900">Smart Bookmarks</h1>
          <p className="text-slate-500 mb-8">Save your favorite links in real-time.</p>
          <form action={signIn}>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-3 w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto p-6">
        <Navbar user={user} signOut={signOut} />
        <BookmarkContainer userId={user.id} />
      </div>
    </main>
  )
}