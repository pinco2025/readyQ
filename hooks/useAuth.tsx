'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email, password: '***' })
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('Sign in successful:', userCredential.user.email)
      setUser(userCredential.user)
      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      return { error: error.message || 'Failed to sign in' }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: name
      })
      
      // Wait a moment for Firebase to process the profile update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Force reload the user profile to get the latest data
      await userCredential.user.reload()
      
      // Refresh the user state with the updated profile
      setUser({ ...userCredential.user })
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: error.message || 'Failed to sign up' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
      return { error: null }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      return { error: error.message || 'Failed to sign in with Google' }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }



  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
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
