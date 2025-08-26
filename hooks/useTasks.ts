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
import type { Task, TaskInsert, TaskUpdate } from '@/lib/firebase-types'

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  createTask: (task: Omit<TaskInsert, 'user_id'>) => Promise<{ task: Task | null; error: string | null }>
  updateTask: (id: string, updates: TaskUpdate) => Promise<{ task: Task | null; error: string | null }>
  deleteTask: (id: string) => Promise<{ error: string | null }>
  toggleTaskCompletion: (id: string) => Promise<{ error: string | null }>
  refreshTasks: () => Promise<void>

}

export function useTasks(): UseTasksReturn {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  // Use ref to prevent unnecessary re-renders
  const tasksRef = useRef<Task[]>([])
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

  // Helper function to convert Task data from Firestore
  const convertTaskFromFirestore = (doc: any): Task => ({
    id: doc.id,
    user_id: doc.data().user_id,
    name: doc.data().name,
    description: doc.data().description || null,
    priority: doc.data().priority || 'medium',
    is_personal: doc.data().is_personal || false,
    completion_type: doc.data().completion_type || 'done',
    completion_value: doc.data().completion_value || null,
    status: doc.data().status || 'todo',
    category_id: doc.data().category_id || null,
    created_at: convertTimestamp(doc.data().created_at),
    updated_at: convertTimestamp(doc.data().updated_at)
  })

  // Set up real-time listener for tasks
  useEffect(() => {
    if (!user?.uid) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Create query for user's tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot: any) => {
        const tasksList: Task[] = []
        snapshot.forEach((doc: any) => {
          tasksList.push(convertTaskFromFirestore(doc))
        })
        
        setTasks(tasksList)
        tasksRef.current = tasksList
        
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

  // Create a new task
  const createTask = async (taskData: Omit<TaskInsert, 'user_id'>): Promise<{ task: Task | null; error: string | null }> => {
    if (!user) {
      return { task: null, error: 'User not authenticated' }
    }

    try {
      const newTask = {
        ...taskData,
        user_id: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'tasks'), newTask)

      
      // Real-time listener will automatically update the UI
      return { task: null, error: null }
    } catch (err: any) {
      console.error('Error creating task:', err)
      const errorMessage = err.message || 'Failed to create task'
      setError(errorMessage)
      return { task: null, error: errorMessage }
    }
  }

  // Update an existing task
  const updateTask = async (id: string, updates: TaskUpdate): Promise<{ task: Task | null; error: string | null }> => {
    if (!user) {
      return { task: null, error: 'User not authenticated' }
    }

    // Check if this is a drag-and-drop operation (priority/status change)
    const isDragAndDrop = (updates.priority && Object.keys(updates).length === 1) || 
                         (updates.status && Object.keys(updates).length === 1)

    try {
      
      if (!isDragAndDrop) {
        // For non-drag-and-drop updates, apply optimistic update immediately
        setTasks(prev => {
          const updated = prev.map(task => 
            task.id === id ? { ...task, ...updates, updated_at: new Date() } : task
          )
          tasksRef.current = updated

          return updated
        })
      }

      const taskRef = doc(db, 'tasks', id)
      await updateDoc(taskRef, {
        ...updates,
        updated_at: serverTimestamp()
      })


      
      // Real-time listener will automatically update the UI
      return { task: null, error: null }
    } catch (err: any) {
      console.error('Error updating task:', err)
      const errorMessage = err.message || 'Failed to update task'
      setError(errorMessage)
      
      // Revert optimistic update on error
      if (!isDragAndDrop) {
        setTasks(prev => {
          const reverted = prev.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
          tasksRef.current = reverted
          return reverted
        })
      }
      
      return { task: null, error: errorMessage }
    }
  }

  // Delete a task
  const deleteTask = async (id: string): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'User not authenticated' }
    }

    try {
      const taskRef = doc(db, 'tasks', id)
      await deleteDoc(taskRef)
      

      // Real-time listener will automatically update the UI
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting task:', err)
      const errorMessage = err.message || 'Failed to delete task'
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
      

      
      // Optimistic update - update local state immediately
      setTasks(prev => {
        const updated = prev.map(task => 
          task.id === id ? { ...task, status: newStatus, updated_at: new Date() } : task
        )
        tasksRef.current = updated
        
        return updated
      })
      
      const taskRef = doc(db, 'tasks', id)
      await updateDoc(taskRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      })


      
      // Real-time listener will automatically update the UI
      return { error: null }
    } catch (err: any) {
      console.error('Error toggling task completion:', err)
      const errorMessage = err.message || 'Failed to toggle task completion'
      setError(errorMessage)
      
      // Revert optimistic update on error
      setTasks(prev => {
        const reverted = prev.map(task => 
          task.id === id ? { ...task, status: tasks.find(t => t.id === id)?.status || 'todo' } : task
        )
        tasksRef.current = reverted
        return reverted
      })
      
      return { error: errorMessage }
    }
  }

  // Refresh tasks (useful for manual refresh)
  const refreshTasks = async () => {
    // With Firebase real-time listeners, this is not needed
    // but keeping for API consistency

  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refreshTasks,

  }
}
