import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors (happens in Server Components)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors (happens in Server Components)
          }
        },
      },
    }
  )
}

// Helper function to get user role (server-side only)
export async function getUserRole(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data?.role as 'customer' | 'developer' | null
}

// Helper function to check if user is developer (server-side only)
export async function isDeveloper(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'developer'
}
