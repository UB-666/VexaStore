import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = '❌ Missing Supabase environment variables!'
  console.error(error)
  console.error('Please create a .env.local file with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.error('\nSee .env.local.example for full configuration')
  
  if (typeof window !== 'undefined') {
    // In browser, throw error to prevent app from running with invalid config
    throw new Error(error)
  }
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  const error = '❌ NEXT_PUBLIC_SUPABASE_URL must start with https://'
  console.error(error)
  if (typeof window !== 'undefined') {
    throw new Error(error)
  }
}

// Validate anon key format (basic check)
if (supabaseAnonKey && supabaseAnonKey.length < 100) {
  const error = '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)'
  console.error(error)
  if (typeof window !== 'undefined') {
    throw new Error(error)
  }
}

// Use SSR-compatible client that properly handles cookies
export const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use PKCE flow for better security
    }
  }
)
