import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          priority: 'high' | 'medium' | 'low'
          is_personal: boolean
          completion_type: 'done' | 'percentage' | 'stages'
          completion_value: string | null
          status: 'todo' | 'in_progress' | 'done'
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          priority: 'high' | 'medium' | 'low'
          is_personal?: boolean
          completion_type?: 'done' | 'percentage' | 'stages'
          completion_value?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          priority?: 'high' | 'medium' | 'low'
          is_personal?: boolean
          completion_type?: 'done' | 'percentage' | 'stages'
          completion_value?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}
