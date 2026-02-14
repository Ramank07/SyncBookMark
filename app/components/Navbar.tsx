'use client'

import { LogOut } from 'lucide-react'

type Props = {
  user: any
  signOut: () => Promise<void>
}

export default function Navbar({ user, signOut }: Props) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-200">
      <h1 className="text-xl font-bold text-slate-900">
        Smart Bookmark App
      </h1>

      <div className="flex gap-4 items-center">
        {user.user_metadata?.avatar_url && (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
        )}
        <span className="text-sm font-medium text-slate-600 hidden sm:block">
          {user.email}
        </span>
        
        <form action={signOut}>
          <button 
            type="submit"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}