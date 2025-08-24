'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useRealtime } from './useRealtime'
import type { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  createTask: (task: Omit<TaskInsert, 'user_id'>) => Promise<{ task: Task | null; error: string | null }>
  updateTask: (id: string, updates: TaskUpdate) => Promise<{ task: Task | null; error: string | null }>
  deleteTask: (id: string) => Promise<{ error: string | null }>
  toggleTaskCompletion: (id: string) => Promise<{ error: string | null }>
  refreshTasks: () => Promise<void>
  testOptimisticUpdate: () => Promise<void>
  realtimeStatus: {
    isConnected: boolean
    lastUpdate: Date | null
    updateCount: number
  }
}

export function useTasks(): UseTasksReturn {
  const { user } = useAuth()
  const { subscribeToTasks, isConnected } = useRealtime()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateCount, setUpdateCount] = useState(0)

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTasks(data || [])
      setLastUpdate(new Date())
      console.log(`Fetched ${data?.length || 0} tasks for user ${user.id}`)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Handle real-time updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks((payload: any) => {
      console.log('Real-time task update received:', payload)
      setLastUpdate(new Date())
      setUpdateCount(prev => prev + 1)
      
      if (payload.eventType === 'INSERT') {
        // New task created
        const newTask = payload.new as Task
        if (newTask && newTask.user_id === user.id) {
          setTasks(prev => {
            // Check if task already exists to avoid duplicates
            if (prev.find(task => task.id === newTask.id)) {
              return prev
            }
            return [newTask, ...prev]
          })
          console.log('Task added via realtime:', newTask.name)
        }
      } else if (payload.eventType === 'UPDATE') {
        // Task updated
        const updatedTask = payload.new as Task
        if (updatedTask && updatedTask.user_id === user.id) {
          setTasks(prev => prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          ))
          console.log('Task updated via realtime:', updatedTask.name)
        }
      } else if (payload.eventType === 'DELETE') {
        // Task deleted
        const deletedTaskId = payload.old?.id
        if (deletedTaskId) {
          setTasks(prev => prev.filter(task => task.id !== deletedTaskId))
          console.log('Task deleted via realtime:', deletedTaskId)
        }
      }
    })

    // Fallback: Poll for updates every 10 seconds if realtime fails
    const pollInterval = setInterval(() => {
      fetchTasks()
    }, 10000)

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [user, subscribeToTasks, fetchTasks])

  // Create a new task
  const createTask = async (taskData: Omit<TaskInsert, 'user_id'>): Promise<{ task: Task | null; error: string | null }> => {
    if (!user) {
      return { task: null, error: 'User not authenticated' }
    }

    try {
      const newTask: TaskInsert = {
        ...taskData,
        user_id: user.id,
        status: 'todo', // Default status for new tasks
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      console.log('Task created successfully:', data.name)
      
      // Trigger a refresh to ensure all views are updated
      setTimeout(() => fetchTasks(), 100)
      
      return { task: data, error: null }
    } catch (err) {
      console.error('Error creating task:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      return { task: null, error: errorMessage }
    }
  }

  // Update an existing task
  const updateTask = async (id: string, updates: TaskUpdate): Promise<{ task: Task | null; error: string | null }> => {
    if (!user) {
      return { task: null, error: 'User not authenticated' }
    }

    try {
      console.log('Starting task update:', id, updates)
      
      // Optimistic update - update local state immediately
      setTasks(prev => {
        const updated = prev.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
        console.log('Optimistic update applied:', updated.find(t => t.id === id))
        return updated
      })

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own tasks
        .select()
        .single()

      if (updateError) {
        console.error('Supabase update failed, reverting optimistic update:', updateError)
        // Revert optimistic update on error
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, ...updates } : task
        ))
        throw updateError
      }

      console.log('Task updated successfully in Supabase:', data.name)
      
      // Update local state with the actual data from server
      setTasks(prev => prev.map(task => 
        task.id === id ? data : task
      ))
      
      // Trigger a refresh to ensure all views are updated
      console.log('Triggering refresh after successful update')
      setTimeout(() => fetchTasks(), 100)
      
      return { task: data, error: null }
    } catch (err) {
      console.error('Error updating task:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
      return { task: null, error: errorMessage }
    }
  }

  // Delete a task
  const deleteTask = async (id: string): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only delete their own tasks

      if (deleteError) {
        throw deleteError
      }

      console.log('Task deleted successfully:', id)
      // Note: Real-time update will handle removing from local state
      return { error: null }
    } catch (err) {
      console.error('Error deleting task:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Toggle task completion
  const toggleTaskCompletion = async (id: string): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      // Find the current task to get its current status
      const currentTask = tasks.find(task => task.id === id)
      if (!currentTask) {
        return { error: 'Task not found' }
      }

      // Toggle between todo and done
      const newStatus: 'todo' | 'in_progress' | 'done' = currentTask.status === 'done' ? 'todo' : 'done'
      
      console.log('Starting task completion toggle:', id, currentTask.status, '->', newStatus)
      
      // Optimistic update - update local state immediately
      setTasks(prev => {
        const updated = prev.map(task => 
          task.id === id ? { ...task, status: newStatus } : task
        )
        console.log('Optimistic completion update applied:', updated.find(t => t.id === id))
        return updated
      })
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Supabase completion toggle failed, reverting optimistic update:', updateError)
        // Revert optimistic update on error
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, status: currentTask.status } : task
        ))
        throw updateError
      }

      console.log('Task completion toggled successfully in Supabase:', currentTask.name, '->', newStatus)
      
      // Update local state with the actual data from server
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ))
      
      // Trigger a refresh to ensure all views are updated
      console.log('Triggering refresh after successful completion toggle')
      setTimeout(() => fetchTasks(), 100)
      
      return { error: null }
    } catch (err) {
      console.error('Error toggling task completion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task completion'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Refresh tasks (useful for manual refresh)
  const refreshTasks = async () => {
    await fetchTasks()
  }

  // Test function to verify optimistic updates
  const testOptimisticUpdate = async () => {
    if (!user || tasks.length === 0) return
    
    const testTask = tasks[0]
    console.log('Testing optimistic update on task:', testTask.name)
    
    // Test updating the task name
    await updateTask(testTask.id, { name: `${testTask.name} (TEST ${Date.now()})` })
  }

  // Fetch tasks when user changes or component mounts
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refreshTasks,
    testOptimisticUpdate,
    realtimeStatus: {
      isConnected,
      lastUpdate,
      updateCount,
    },
  }
}
