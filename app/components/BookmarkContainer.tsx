'use client'

import { useRef } from 'react'
import BookmarkForm from './BookmarkForm'
import BookmarkList, { BookmarkListRef } from './BookmarkList'

export default function BookmarkContainer({ userId }: { userId: string }) {
  const bookmarkListRef = useRef<BookmarkListRef>(null)

  const handleFormSuccess = async () => {
    // Refresh the bookmark list immediately after adding a bookmark
    if (bookmarkListRef.current) {
      await bookmarkListRef.current.refreshBookmarks()
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <BookmarkForm userId={userId} onSuccess={handleFormSuccess} />
      <BookmarkList ref={bookmarkListRef} userId={userId} />
    </div>
  )
}
