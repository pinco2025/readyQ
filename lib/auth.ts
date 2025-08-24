import { supabase } from './supabase'
import { Database } from './supabase'

export type User = Database['public']['Tables']['tasks']['Row']['user_id']

export interface AuthError {
  message: string
}

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      return { user: null, error: { message: error.message } }
    }

    return { user: data.user?.id || null, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
    }
  }
}

// Sign in with email and password
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: { message: error.message } }
    }

    return { user: data.user?.id || null, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
    }
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: { message: error.message } }
    }

    return { error: null }
  } catch (error) {
    return { 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
    }
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { session: null, error: { message: error.message } }
    }

    return { session, error: null }
  } catch (error) {
    return { 
      session: null, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
    }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, error: { message: error.message } }
    }

    return { user, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
    }
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
