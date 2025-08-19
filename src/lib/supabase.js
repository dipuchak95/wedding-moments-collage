import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://etxysagzkvaormcvvmns.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eHlzYWd6a3Zhb3JtY3Z2bW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3MzcsImV4cCI6MjA3MTE3MDczN30.M03DfOHXQgKX7hbFmcHjhj5ho8KJCMAox09ITF1O54w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)