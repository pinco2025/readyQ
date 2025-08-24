'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface UseRealtimeReturn {
  subscribeToTasks: (callback: (payload: any) => void) => () => void
  subscribeToCategories: (callback: (payload: any) => void) => () => void
  isConnected: boolean
  retryConnection: () => void
  enableRealtime: () => void
  disableRealtime: () => void
  isRealtimeEnabled: boolean
}

export function useRealtime(): UseRealtimeReturn {
  const { user } = useAuth()
  const subscriptionsRef = useRef<{ tasks?: any; categories?: any }>({})
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true)
  const [errorCount, setErrorCount] = useState(0)
  const maxRetries = 3
  const maxErrors = 5

  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('count').limit(1)
      if (error) {
        console.warn('Supabase connection check failed:', error)
        setIsConnected(false)
        return false
      } else {
        setIsConnected(true)
        setRetryCount(0) // Reset retry count on successful connection
        setErrorCount(0) // Reset error count on successful connection
        return true
      }
    } catch (err) {
      console.warn('Supabase connection check error:', err)
      setIsConnected(false)
      return false
    }
  }, [])

  // Retry connection
  const retryConnection = useCallback(async () => {
    if (retryCount >= maxRetries) {
      console.warn('Max retry attempts reached for realtime connection')
      return
    }

    console.log(`Retrying realtime connection (attempt ${retryCount + 1}/${maxRetries})`)
    setRetryCount(prev => prev + 1)
    
    const success = await checkConnection()
    if (success) {
      console.log('Realtime connection restored successfully')
    }
  }, [retryCount, maxRetries, checkConnection])

  // Enable realtime
  const enableRealtime = useCallback(() => {
    setIsRealtimeEnabled(true)
    setErrorCount(0)
    setRetryCount(0)
    console.log('Realtime enabled')
  }, [])

  // Disable realtime (fallback to polling)
  const disableRealtime = useCallback(() => {
    setIsRealtimeEnabled(false)
    setIsConnected(false)
    
    // Clean up existing subscriptions
    try {
      if (subscriptionsRef.current.tasks) {
        supabase.removeChannel(subscriptionsRef.current.tasks)
        subscriptionsRef.current.tasks = undefined
      }
      if (subscriptionsRef.current.categories) {
        supabase.removeChannel(subscriptionsRef.current.categories)
        subscriptionsRef.current.categories = undefined
      }
    } catch (error) {
      console.warn('Error cleaning up subscriptions when disabling realtime:', error)
    }
    
    console.log('Realtime disabled - falling back to polling')
  }, [])

  // Subscribe to real-time task updates
  const subscribeToTasks = useCallback((callback: (payload: any) => void) => {
    if (!user || !isRealtimeEnabled) {
      console.warn('Cannot subscribe to tasks: User not authenticated or realtime disabled')
      return () => {}
    }

    // Clean up existing subscription
    if (subscriptionsRef.current.tasks) {
      try {
        supabase.removeChannel(subscriptionsRef.current.tasks)
      } catch (error) {
        console.warn('Error removing existing tasks subscription:', error)
      }
    }

    try {
      // Create new subscription with minimal error handling
      const subscription = supabase
        .channel(`tasks-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Simple callback without complex processing
            try {
              console.log('Task real-time update received:', payload)
              callback(payload)
            } catch (error) {
              console.warn('Error in task realtime callback:', error)
              // Don't increment error count for callback errors
            }
          }
        )
        .subscribe((status) => {
          console.log('Tasks subscription status:', status)
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setRetryCount(0)
            setErrorCount(0)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Tasks subscription failed:', status)
            setIsConnected(false)
            setErrorCount(prev => prev + 1)
            
            if (errorCount >= maxErrors) {
              console.warn('Too many realtime errors, disabling realtime')
              disableRealtime()
            }
          }
        })

      subscriptionsRef.current.tasks = subscription

      return () => {
        try {
          if (subscriptionsRef.current.tasks) {
            supabase.removeChannel(subscriptionsRef.current.tasks)
            subscriptionsRef.current.tasks = undefined
          }
        } catch (error) {
          console.warn('Error cleaning up tasks subscription:', error)
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to tasks:', error)
      setErrorCount(prev => prev + 1)
      return () => {}
    }
  }, [user, isRealtimeEnabled, errorCount, maxErrors, disableRealtime])

  // Subscribe to real-time category updates
  const subscribeToCategories = useCallback((callback: (payload: any) => void) => {
    if (!user || !isRealtimeEnabled) {
      console.warn('Cannot subscribe to categories: User not authenticated or realtime disabled')
      return () => {}
    }

    // Clean up existing subscription
    if (subscriptionsRef.current.categories) {
      try {
        supabase.removeChannel(subscriptionsRef.current.categories)
      } catch (error) {
        console.warn('Error removing existing categories subscription:', error)
      }
    }

    try {
      // Create new subscription with minimal error handling
      const subscription = supabase
        .channel(`categories-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'categories',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Simple callback without complex processing
            try {
              console.log('Category real-time update received:', payload)
              callback(payload)
            } catch (error) {
              console.warn('Error in category realtime callback:', error)
              // Don't increment error count for callback errors
            }
          }
        )
        .subscribe((status) => {
          console.log('Categories subscription status:', status)
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setRetryCount(0)
            setErrorCount(0)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Categories subscription failed:', status)
            setIsConnected(false)
            setErrorCount(prev => prev + 1)
            
            if (errorCount >= maxErrors) {
              console.warn('Too many realtime errors, disabling realtime')
              disableRealtime()
            }
          }
        })

      subscriptionsRef.current.categories = subscription

      return () => {
        try {
          if (subscriptionsRef.current.categories) {
            supabase.removeChannel(subscriptionsRef.current.categories)
            subscriptionsRef.current.categories = undefined
          }
        } catch (error) {
          console.warn('Error cleaning up categories subscription:', error)
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to categories:', error)
      setErrorCount(prev => prev + 1)
      return () => {}
    }
  }, [user, isRealtimeEnabled, errorCount, maxErrors, disableRealtime])

  // Check connection and clean up subscriptions when user changes or component unmounts
  useEffect(() => {
    if (user && isRealtimeEnabled) {
      checkConnection()
    }
    
    return () => {
      try {
        if (subscriptionsRef.current.tasks) {
          supabase.removeChannel(subscriptionsRef.current.tasks)
        }
        if (subscriptionsRef.current.categories) {
          supabase.removeChannel(subscriptionsRef.current.categories)
        }
      } catch (error) {
        console.warn('Error cleaning up subscriptions on unmount:', error)
      }
    }
  }, [user, checkConnection, isRealtimeEnabled])

  return {
    subscribeToTasks,
    subscribeToCategories,
    isConnected,
    retryConnection,
    enableRealtime,
    disableRealtime,
    isRealtimeEnabled,
  }
}
