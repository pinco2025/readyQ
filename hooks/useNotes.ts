import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Note, NoteInsert, NoteUpdate } from '@/lib/firebase-types'
import { useCategories } from './useCategories'

export function useNotes(userId: string | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showPersonalOnly, setShowPersonalOnly] = useState(false)

  const { categories } = useCategories()

  // Filter notes based on search query and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategoryId || note.category_id === selectedCategoryId
    const matchesPersonal = !showPersonalOnly || note.is_personal
    
    return matchesSearch && matchesCategory && matchesPersonal
  })

  // Sort notes: pinned first, then by updated_at
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  // Fetch notes from Firestore
  useEffect(() => {
    if (!userId) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const q = query(
      collection(db, 'notes'),
      where('user_id', '==', userId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData: Note[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          notesData.push({
            id: doc.id,
            user_id: data.user_id,
            title: data.title,
            content: data.content,
            category_id: data.category_id || null,
            is_personal: data.is_personal || false,
            is_pinned: data.is_pinned || false,
            created_at: data.created_at?.toDate() || new Date(),
            updated_at: data.updated_at?.toDate() || new Date(),
          })
        })
        setNotes(notesData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching notes:', err)
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load notes'
        
        if (err.code === 'permission-denied') {
          errorMessage = 'Access denied. Please check your Firebase permissions.'
        } else if (err.code === 'unavailable') {
          errorMessage = 'Firebase is temporarily unavailable. Please try again.'
        } else if (err.code === 'unauthenticated') {
          errorMessage = 'You are not authenticated. Please log in again.'
        } else if (err.code === 'not-found') {
          errorMessage = 'Notes collection not found. Please check your Firebase setup.'
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Add a new note
  const addNote = useCallback(async (noteData: Omit<NoteInsert, 'user_id'>) => {
    if (!userId) {
      const error = new Error('User not authenticated')
      console.error('Add note error:', error)
      setError('You are not authenticated. Please log in again.')
      throw error
    }

    try {
      setError(null)
      const newNote: NoteInsert = {
        ...noteData,
        user_id: userId,
        category_id: noteData.category_id || null,
        is_personal: noteData.is_personal || false,
        is_pinned: noteData.is_pinned || false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      await addDoc(collection(db, 'notes'), {
        ...newNote,
        created_at: Timestamp.fromDate(newNote.created_at!),
        updated_at: Timestamp.fromDate(newNote.updated_at!),
      })
    } catch (err: any) {
      console.error('Error adding note:', err)
      
      let errorMessage = 'Failed to add note'
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Access denied. Please check your Firebase permissions.'
      } else if (err.code === 'unavailable') {
        errorMessage = 'Firebase is temporarily unavailable. Please try again.'
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'You are not authenticated. Please log in again.'
      } else if (err.message) {
        errorMessage = `Error adding note: ${err.message}`
      }
      
      setError(errorMessage)
      throw err
    }
  }, [userId])

  // Update an existing note
  const updateNote = useCallback(async (noteId: string, updates: NoteUpdate) => {
    if (!userId) {
      const error = new Error('User not authenticated')
      console.error('Update note error:', error)
      setError('You are not authenticated. Please log in again.')
      throw error
    }

    try {
      setError(null)
      const noteRef = doc(db, 'notes', noteId)
      const updateData = {
        ...updates,
        updated_at: Timestamp.fromDate(new Date()),
      }

      await updateDoc(noteRef, updateData)
    } catch (err: any) {
      console.error('Error updating note:', err)
      
      let errorMessage = 'Failed to update note'
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Access denied. Please check your Firebase permissions.'
      } else if (err.code === 'not-found') {
        errorMessage = 'Note not found. It may have been deleted.'
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'You are not authenticated. Please log in again.'
      } else if (err.message) {
        errorMessage = `Error updating note: ${err.message}`
      }
      
      setError(errorMessage)
      throw err
    }
  }, [userId])

  // Delete a note
  const deleteNote = useCallback(async (noteId: string) => {
    if (!userId) {
      const error = new Error('User not authenticated')
      console.error('Delete note error:', error)
      setError('You are not authenticated. Please log in again.')
      throw error
    }

    try {
      setError(null)
      const noteRef = doc(db, 'notes', noteId)
      await deleteDoc(noteRef)
    } catch (err: any) {
      console.error('Error deleting note:', err)
      
      let errorMessage = 'Failed to delete note'
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Access denied. Please check your Firebase permissions.'
      } else if (err.code === 'not-found') {
        errorMessage = 'Note not found. It may have already been deleted.'
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'You are not authenticated. Please log in again.'
      } else if (err.message) {
        errorMessage = `Error deleting note: ${err.message}`
      }
      
      setError(errorMessage)
      throw err
    }
  }, [userId])

  // Toggle pin status
  const togglePin = useCallback(async (noteId: string, isPinned: boolean) => {
    await updateNote(noteId, { is_pinned: !isPinned })
  }, [updateNote])

  // Clear search and filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategoryId(null)
    setShowPersonalOnly(false)
  }, [])

  return {
    notes: sortedNotes,
    categories,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    showPersonalOnly,
    setShowPersonalOnly,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    clearFilters,
  }
}
