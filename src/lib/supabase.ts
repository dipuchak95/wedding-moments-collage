import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Photo {
  id: string
  filename: string
  storage_path: string
  uploaded_by?: string
  uploaded_at: string
  file_size?: number
  mime_type?: string
}