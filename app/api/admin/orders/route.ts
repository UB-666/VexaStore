import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { checkRateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (30 requests per minute for admin endpoints)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const rateLimit = checkRateLimit(`admin-orders:${ip}`, 30, 60000)
    
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

    // Get the authenticated user (using regular client for auth check)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a developer (using regular client)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'developer') {
      return NextResponse.json({ error: 'Forbidden: Developer access required' }, { status: 403 })
    }

    // Fetch all orders with their items and product details
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
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch orders. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({ orders }, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', error)
    } else {
      console.error('Admin orders API error')
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
