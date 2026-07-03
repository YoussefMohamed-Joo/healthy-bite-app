import { createClient } from '@supabase/supabase-js'

let _supabase = null

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) return null
    _supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _supabase
}
