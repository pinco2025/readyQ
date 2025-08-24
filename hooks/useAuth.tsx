'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange } from '@/lib/auth'
import { SignInData, SignUpData, AuthError } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (data: SignInData) => Promise<{ user: string | null; error: AuthError | null }>
  signUp: (data: SignUpData) => Promise<{ user: string | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user, error } = await getCurrentUser()
        if (error) {
          // Only log non-session-missing errors to reduce console noise
          if (error.message !== 'Auth session missing!') {
            console.error('Error getting current user:', error.message)
          }
          // This is normal - no user is logged in yet
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Unexpected error getting current user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'No user')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (data: SignInData) => {
    const result = await signIn(data)
    if (result.user) {
      // User will be set via the auth state change listener
    }
    return result
  }

  const handleSignUp = async (data: SignUpData) => {
    const result = await signUp(data)
    if (result.user) {
      // User will be set via the auth state change listener
    }
    return result
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.error) {
      setUser(null)
    }
    return result
  }

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
