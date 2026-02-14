'use client'

import { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Trash2, ExternalLink, Globe, Bookmark as BookmarkIcon } from 'lucide-react'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export interface BookmarkListRef {
  refreshBookmarks: () => Promise<void>
}

const BookmarkList = forwardRef<BookmarkListRef, { userId: string }>(({ userId }, ref) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

 const fetchBookmarks = useCallback(async () => {
  setLoading(true)

  const { data, error } = await supabase
    .from('bookmarks')
    .select('id,title,url,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!error && data) {
    setBookmarks(data)
  } else {
    console.error(error)
  }

  setLoading(false)
}, [supabase, userId])


  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refreshBookmarks: fetchBookmarks
  }))

 useEffect(() => {
  const load = async () => {
    await fetchBookmarks()
  }

  load()

  const channel = supabase
  .channel(`bookmarks-${userId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${userId}`,
    },
    async () => {
      await fetchBookmarks()
    }
  )
  .subscribe((status) => {
    console.log('Realtime status:', status)
  })


  return () => {
    supabase.removeChannel(channel)
  }
}, [fetchBookmarks, supabase, userId])



  const handleDelete = async (id: string) => {
    const previousBookmarks = [...bookmarks]
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete failed:', error.message)
      setBookmarks(previousBookmarks)
      alert('Delete failed. Please try again.')
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-indigo-500" />
          My Library
          <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        </h2>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
          <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No bookmarks saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark.id} 
              className="group relative bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-slate-900 truncate pr-8">
                  {bookmark.title}
                </h3>
                <button 
                  onClick={() => handleDelete(bookmark.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate mb-4">{bookmark.url}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-slate-300 font-mono">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </span>
                <a 
                  href={bookmark.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

BookmarkList.displayName = 'BookmarkList'

export default BookmarkList