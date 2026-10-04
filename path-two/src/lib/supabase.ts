import {createClient} from '@supabase/supabase-js'

// Supabase expects the project root URL here, not the REST endpoint.
// Normalize common copied values so `/rest/v1` can never get duplicated
// into auth requests such as `/rest/v1/auth/v1/token`.
const rawSupabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseUrl = rawSupabaseUrl
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/i, '')

const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
