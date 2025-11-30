import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { checkRateLimit, validateUUID, sanitizeString } from '@/lib/security'
import { validateContentType, parseRequestBody } from '@/lib/apiUtils'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Validate Content-Type
    const contentTypeError = validateContentType(request)
    if (contentTypeError) {
      return NextResponse.json(
        { error: contentTypeError.error },
        { status: contentTypeError.status }
      )
    }

    // Rate limiting (20 requests per minute for admin order updates)
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = checkRateLimit(`admin-order-update:${ip}`, 20, 60000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
          }
        }
      )
    }

    // Get the authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a developer
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'developer') {
      return NextResponse.json({ error: 'Forbidden: Developer access required' }, { status: 403 })
    }

    // Await params
    const params = await context.params

    // Validate order ID
    const orderId = params.id
    if (!validateUUID(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Parse request body
    const { data: body, error: parseError } = await parseRequestBody(request, 10000)
    if (parseError) {
      return NextResponse.json({ error: parseError.message }, { status: parseError.status })
    }

    const { status } = body as { status?: string }

    // Validate status
    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['paid', 'processing', 'shipped', 'shipping', 'delivered', 'completed', 'cancelled', 'canceled']
    const sanitizedStatus = sanitizeString(status.toLowerCase(), 50)

    if (!validStatuses.includes(sanitizedStatus)) {
      return NextResponse.json({
        error: 'Invalid status. Must be one of: paid, processing, shipped, delivered, completed, cancelled'
      }, { status: 400 })
    }

    // Update order status using admin client
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: sanitizedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating order:', updateError)
      }

      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({
        error: 'Failed to update order status'
      }, { status: 500 })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Order ${orderId} status updated to ${sanitizedStatus} by user ${user.email}`)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    }, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', error)
    } else {
      console.error('Admin order update API error')
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
