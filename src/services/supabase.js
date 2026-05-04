import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url){
  if (!url) return ''
  let u = url.trim()
  u = u.replace(/\/rest\/v1\/?$/i, '')
  u = u.replace(/\/+$/,'')
  return u
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
