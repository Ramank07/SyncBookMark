'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Trash2, ExternalLink, Globe, Bookmark as BookmarkIcon, Loader2 } from 'lucide-react'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkList({ userId }: { userId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

  const handleDelete = async (id: string) => {
    // 1. SILENT UPDATE (Optimistic UI)
    // We store the current state in case we need to roll back
    const previousBookmarks = [...bookmarks];
    
    // Immediately remove from UI so the user feels it's instant
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    // 2. BACKGROUND SYNC
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Background delete failed:', error.message);
      // Rollback: Put the bookmarks back if the DB rejected the delete
      setBookmarks(previousBookmarks);
      alert("Sync failed. The bookmark was restored.");
    }
  }

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching bookmarks:', error);
          return;
        }
        
        if (data) {
          setBookmarks(data);
          console.log('Initial bookmarks loaded:', data.length);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitial();

    // REALTIME SUBSCRIPTION - Listen for all changes
    const channel = supabase
      .channel(`realtime-bookmarks-${userId}`, {
        config: { broadcast: { self: true } }
      })
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT',
          schema: 'public', 
          table: 'bookmarks', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          console.log('INSERT event received:', payload.new);
          const newItem = payload.new as Bookmark;
          setBookmarks((prev) => {
            // Prevent duplicates
            if (prev.find(b => b.id === newItem.id)) return prev;
            return [newItem, ...prev];
          });
        }
      )
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public', 
          table: 'bookmarks', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          console.log('UPDATE event received:', payload.new);
          const updatedItem = payload.new as Bookmark;
          setBookmarks((prev) => 
            prev.map(b => b.id === updatedItem.id ? updatedItem : b)
          );
        }
      )
      .on(
        'postgres_changes', 
        { 
          event: 'DELETE',
          schema: 'public', 
          table: 'bookmarks', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          console.log('DELETE event received:', payload.old.id);
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription failed. Check Realtime settings in Supabase.');
        }
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    }
  }, [userId, supabase])

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
}