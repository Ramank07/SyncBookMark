'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Link as LinkIcon, Type, Loader2 } from 'lucide-react'

type Props = { userId: string }

export default function BookmarkForm({ userId }: Props) {
  const supabaseRef = useRef(createClient())
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setError('Please fill in both fields');
      return;
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabaseRef.current
        .from('bookmarks')
        .insert([
          { 
            title: title.trim(), 
            url: url.trim(), 
            user_id: userId
          }
        ])
        .select()

      if (insertError) {
        console.error('Insert Error:', insertError);
        throw insertError;
      }

      if (data && data.length > 0) {
        console.log('Bookmark created successfully:', data[0]);
      }

      // Clear form on success
      setTitle('')
      setUrl('')
      setError(null)
    } catch (err: any) {
      console.error('Bookmark creation failed:', err)
      setError(err.message || 'Failed to create bookmark. Check RLS policies.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-1 mb-2">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-1">
        <div className="relative flex-1 w-full">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Bookmark title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none"
            disabled={loading}
            required
          />
        </div>
        <div className="relative flex-[1.5] w-full border-t md:border-t-0 md:border-l border-slate-100">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="url"
            placeholder="Paste URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none"
            disabled={loading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !title || !url}
          className="w-full md:w-auto px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2 px-3 pb-2">{error}</p>}
    </div>
  )
}