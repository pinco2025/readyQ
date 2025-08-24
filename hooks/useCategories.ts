'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useRealtime } from './useRealtime'
import type { Database } from '@/lib/supabase'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Category | null
  old: Category | null
  table: string
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  createCategory: (category: Omit<CategoryInsert, 'user_id'>) => Promise<{ category: Category | null; error: string | null }>
  updateCategory: (id: string, updates: CategoryUpdate) => Promise<{ category: Category | null; error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  refreshCategories: () => Promise<void>
  realtimeStatus: {
    isConnected: boolean
    lastUpdate: Date | null
    updateCount: number
  }
}

export function useCategories(): UseCategoriesReturn {
  const { user } = useAuth()
  const { subscribeToCategories, isConnected } = useRealtime()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateCount, setUpdateCount] = useState(0)

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setCategories(data || [])
      setLastUpdate(new Date())
      console.log(`Fetched ${data?.length || 0} categories for user ${user.id}`)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Handle real-time updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToCategories((payload: RealtimePayload) => {
      console.log('Real-time category update received:', payload)
      setLastUpdate(new Date())
      setUpdateCount(prev => prev + 1)
      
      if (payload.eventType === 'INSERT') {
        // New category created
        const newCategory = payload.new as Category
        if (newCategory && newCategory.user_id === user.id) {
          setCategories(prev => {
            // Check if category already exists to avoid duplicates
            if (prev.find(category => category.id === newCategory.id)) {
              return prev
            }
            return [newCategory, ...prev]
          })
          console.log('Category added via realtime:', newCategory.name)
        }
      } else if (payload.eventType === 'UPDATE') {
        // Category updated
        const updatedCategory = payload.new as Category
        if (updatedCategory && updatedCategory.user_id === user.id) {
          setCategories(prev => prev.map(category => 
            category.id === updatedCategory.id ? updatedCategory : category
          ))
          console.log('Category updated via realtime:', updatedCategory.name)
        }
      } else if (payload.eventType === 'DELETE') {
        // Category deleted
        const deletedCategoryId = payload.old?.id
        if (deletedCategoryId) {
          setCategories(prev => prev.filter(category => category.id !== deletedCategoryId))
          console.log('Category deleted via realtime:', deletedCategoryId)
        }
      }
    })

    return unsubscribe
  }, [user, subscribeToCategories])

  // Create a new category
  const createCategory = async (categoryData: Omit<CategoryInsert, 'user_id'>): Promise<{ category: Category | null; error: string | null }> => {
    if (!user) {
      return { category: null, error: 'User not authenticated' }
    }

    try {
      const newCategory: CategoryInsert = {
        ...categoryData,
        user_id: user.id,
      }

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      console.log('Category created successfully:', data.name)
      // Note: Real-time update will handle adding to local state
      return { category: data, error: null }
    } catch (err) {
      console.error('Error creating category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category'
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
      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own categories
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      console.log('Category updated successfully:', data.name)
      // Note: Real-time update will handle updating local state
      return { category: data, error: null }
    } catch (err) {
      console.error('Error updating category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category'
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
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only delete their own categories

      if (deleteError) {
        throw deleteError
      }

      console.log('Category deleted successfully:', id)
      // Note: Real-time update will handle removing from local state
      return { error: null }
    } catch (err) {
      console.error('Error deleting category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Refresh categories (useful for manual refresh)
  const refreshCategories = async () => {
    await fetchCategories()
  }

  // Fetch categories when user changes or component mounts
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    realtimeStatus: {
      isConnected,
      lastUpdate,
      updateCount,
    },
  }
}
