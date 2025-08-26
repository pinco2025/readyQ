'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import type { Category, CategoryInsert, CategoryUpdate } from '@/lib/firebase-types'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  createCategory: (category: Omit<CategoryInsert, 'user_id'>) => Promise<{ category: Category | null; error: string | null }>
  updateCategory: (id: string, updates: CategoryUpdate) => Promise<{ category: Category | null; error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  refreshCategories: () => Promise<void>

}

export function useCategories(): UseCategoriesReturn {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  // Use ref to prevent unnecessary re-renders
  const categoriesRef = useRef<Category[]>([])
  const userRef = useRef(user?.uid)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Helper function to convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate()
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000)
    }
    return new Date(timestamp)
  }

  // Helper function to convert Category data from Firestore
  const convertCategoryFromFirestore = (doc: any): Category => ({
    id: doc.id,
    user_id: doc.data().user_id,
    name: doc.data().name,
    color: doc.data().color,
    created_at: convertTimestamp(doc.data().created_at)
  })

  // Set up real-time listener for categories
  useEffect(() => {
    if (!user?.uid) {
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Create query for user's categories
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot: any) => {
        const categoriesList: Category[] = []
        snapshot.forEach((doc: any) => {
          categoriesList.push(convertCategoryFromFirestore(doc))
        })
        
        setCategories(categoriesList)
        categoriesRef.current = categoriesList
        setLoading(false)
        

      },
      (error: any) => {
        console.error('Firestore listener error:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [user?.uid])

  // Create a new category
  const createCategory = async (categoryData: Omit<CategoryInsert, 'user_id'>): Promise<{ category: Category | null; error: string | null }> => {
    if (!user) {
      return { category: null, error: 'User not authenticated' }
    }

    try {
      const newCategory = {
        ...categoryData,
        user_id: user.uid,
        created_at: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'categories'), newCategory)

      
      // Real-time listener will automatically update the UI
      return { category: null, error: null }
    } catch (err: any) {
      console.error('Error creating category:', err)
      const errorMessage = err.message || 'Failed to create category'
      setError(errorMessage)
      return { category: null, error: errorMessage }
    }
  }

  // Update an existing category
  const updateCategory = async (id: string, updates: CategoryUpdate): Promise<{ category: Category | null; error: string | null }> => {
    if (!user) {
      return { category: null, error: 'User not authenticated' }
    }

    try {


      const categoryRef = doc(db, 'categories', id)
      await updateDoc(categoryRef, updates)


      
      // Real-time listener will automatically update the UI
      return { category: null, error: null }
    } catch (err: any) {
      console.error('Error updating category:', err)
      const errorMessage = err.message || 'Failed to update category'
      setError(errorMessage)
      return { category: null, error: errorMessage }
    }
  }

  // Delete a category
  const deleteCategory = async (id: string): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      const categoryRef = doc(db, 'categories', id)
      await deleteDoc(categoryRef)
      

      // Real-time listener will automatically update the UI
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting category:', err)
      const errorMessage = err.message || 'Failed to delete category'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Refresh categories (useful for manual refresh)
  const refreshCategories = async () => {
    // With Firebase real-time listeners, this is not needed
    // but keeping for API consistency

  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,

  }
}
