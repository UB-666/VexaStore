import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// This middleware protects the admin panel with role-based authentication
// Only users with 'developer' role can access /admin routes
// Also adds security headers to all responses

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers to all responses
  const headers = response.headers

  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.stripe.com; " +
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;"
  )

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Strict Transport Security (HTTPS enforcement)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.nextUrl.protocol === 'http:') {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl)
  }

  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get authenticated user (verifies with Supabase Auth server)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Admin access attempt:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
      })
    }

    // No user or authentication failed? Redirect to login
    if (authError || !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      redirectUrl.searchParams.set('error', 'auth_required')
      return NextResponse.redirect(redirectUrl)
    }

    // Fetch user role from database
    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Middleware] Error fetching user role:', error)
      }
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('error', 'role_fetch_failed')
      return NextResponse.redirect(redirectUrl)
    }

    // Only 'developer' role can access admin panel
    if (roleData?.role !== 'developer') {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }

    // User is authenticated and has developer role - allow access
    return response
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    // API routes for security headers
    '/api/:path*',
    // All pages for security headers
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
