import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
    }
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (process.env.NODE_ENV === 'development') {
      console.error('Webhook signature verification failed:', message)
    }
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      console.log('🎯 Webhook: checkout.session.completed received')
      const session = event.data.object as Stripe.Checkout.Session
      const { id: stripeSessionId, customer_email, amount_total, metadata } = session

      console.log('📧 Customer email:', customer_email)
      console.log('💰 Amount:', amount_total)

      if (!customer_email) {
        console.error('❌ No customer email in session')
        return NextResponse.json({ error: 'No customer email' }, { status: 400 })
      }

      // Look up user_id from email using admin auth API
      let userId: string | null = null
      try {
        console.log('🔍 Looking up user by email:', customer_email)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const foundUser = users.find(u => u.email === customer_email)
        userId = foundUser?.id || null
        console.log('👤 Found user_id:', userId)
      } catch (error) {
        console.log('⚠️  Could not find user for email:', customer_email)
      }

      // Create order
      console.log('📝 Creating order in database...')
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([
          {
            stripe_session_id: stripeSessionId,
            user_id: userId,
            email: customer_email,
            amount: amount_total ? amount_total / 100.0 : 0,
            status: 'paid',
            customer_name: metadata?.customerName || null,
            phone: metadata?.phone || null,
            address_line1: metadata?.addressLine1 || null,
            address_line2: metadata?.addressLine2 || null,
            city: metadata?.city || null,
            state: metadata?.state || null,
            postal_code: metadata?.postalCode || null,
            country: metadata?.country || null,
            metadata: metadata || {},
          },
        ])
        .select()
        .single()

      if (orderError) {
        console.error('❌ Failed to create order:', orderError.message)
        console.error('Error details:', JSON.stringify(orderError, null, 2))
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      console.log('✅ Order created successfully! Order ID:', orderData.id)

      // Parse items from metadata and create order_items
      if (metadata?.items) {
        try {
          const items = JSON.parse(metadata.items)

          // Validate items is an array
          if (!Array.isArray(items) || items.length === 0) {
            console.error('Webhook: Invalid items format in metadata')
            return NextResponse.json({ received: true })
          }

          // Fetch product details for each item
          const productIds = items.map((item: any) => item.productId)
          const { data: products } = await supabaseAdmin
            .from('products')
            .select('id, title, price, image')
            .in('id', productIds)

          if (products && products.length > 0) {
            // Create order items with product details
            const orderItems = items.map((item: any) => {
              const product = products.find(p => p.id === item.productId)
              return {
                order_id: orderData.id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: product?.price || 0
              }
            })

            const { error: itemsError } = await supabaseAdmin
              .from('order_items')
              .insert(orderItems)

            if (itemsError) {
              console.error('Webhook: Failed to create order items:', itemsError.message)
            }
          }
        } catch (parseError) {
          // Log but don't expose details
          if (process.env.NODE_ENV === 'development') {
            console.error('Webhook: Failed to parse items:', parseError)
          } else {
            console.error('Webhook: Failed to parse order items')
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook error:', message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
