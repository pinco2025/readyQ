// Firebase Firestore types for our application

export interface Task {
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
  created_at: Date
  updated_at: Date
}

export interface TaskInsert {
  user_id: string
  name: string
  description?: string | null
  priority: 'high' | 'medium' | 'low'
  is_personal?: boolean
  completion_type?: 'done' | 'percentage' | 'stages'
  completion_value?: string | null
  status?: 'todo' | 'in_progress' | 'done'
  category_id?: string | null
  created_at?: Date
  updated_at?: Date
}

export interface TaskUpdate {
  name?: string
  description?: string | null
  priority?: 'high' | 'medium' | 'low'
  is_personal?: boolean
  completion_type?: 'done' | 'percentage' | 'stages'
  completion_value?: string | null
  status?: 'todo' | 'in_progress' | 'done'
  category_id?: string | null
  updated_at?: Date
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: Date
}

export interface CategoryInsert {
  user_id: string
  name: string
  color: string
  created_at?: Date
}

export interface CategoryUpdate {
  name?: string
  color?: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  category_id: string | null
  is_personal: boolean
  is_pinned: boolean
  created_at: Date
  updated_at: Date
}

export interface NoteInsert {
  user_id: string
  title: string
  content: string
  category_id?: string | null
  is_personal?: boolean
  is_pinned?: boolean
  created_at?: Date
  updated_at?: Date
}

export interface NoteUpdate {
  title?: string
  content?: string
  category_id?: string | null
  is_personal?: boolean
  is_pinned?: boolean
  updated_at?: Date
}
