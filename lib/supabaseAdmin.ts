import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
// This bypasses Row Level Security (RLS) - use carefully!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for admin client')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must start with https://')
}

// Validate service key format (basic check)
if (supabaseServiceKey.length < 100) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)')
}

// Ensure service key is never exposed to client
if (typeof window !== 'undefined') {
  throw new Error('⚠️ CRITICAL: supabaseAdmin cannot be used in browser! Service role key would be exposed.')
}

// Create admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
