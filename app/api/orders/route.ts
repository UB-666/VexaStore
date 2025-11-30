import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { checkRateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (30 requests per minute for orders endpoint)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const rateLimit = checkRateLimit(`orders:${ip}`, 30, 60000)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
          }
        }
      )
    }

    // Get the authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError.message 
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated. Please log in.' 
      }, { status: 401 })
    }

    if (!user.email) {
      return NextResponse.json({ 
        error: 'User email not found' 
      }, { status: 400 })
    }

    // Fetch orders with order items using admin client to bypass RLS
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          product:products (
            id,
            title,
            slug,
            image
          )
        )
      `)
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json({ 
        error: 'Failed to fetch orders',
        message: ordersError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      orders: orders || []
    }, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })
  } catch (error: unknown) {
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 })
  }
}
