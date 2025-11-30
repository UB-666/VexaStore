import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabaseServer'
import {
  validateEmail,
  validateCartItems,
  validateShippingInfo,
  sanitizeString,
  checkRateLimit,
  validateUUID
} from '@/lib/security'
import { validateContentType, parseRequestBody } from '@/lib/apiUtils'

export async function POST(request: NextRequest) {
  try {
    // Validate Content-Type
    const contentTypeError = validateContentType(request)
    if (contentTypeError) {
      return NextResponse.json(
        { error: contentTypeError.error },
        { status: contentTypeError.status }
      )
    }

    // Rate limiting (10 requests per minute per IP)
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = checkRateLimit(`checkout:${ip}`, 10, 60000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Parse and validate request body size
    const { data: body, error: parseError } = await parseRequestBody(request, 50000)

    if (parseError) {
      return NextResponse.json({ error: parseError.message }, { status: parseError.status })
    }

    const { items, email, shippingInfo } = body as { items: any; email: string; shippingInfo: any }


    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    // Validate cart items
    const itemsValidation = validateCartItems(items)
    if (!itemsValidation.valid) {
      return NextResponse.json({
        error: 'Invalid cart items',
        details: itemsValidation.errors
      }, { status: 400 })
    }

    // Validate shipping info
    const shippingValidation = validateShippingInfo(shippingInfo)
    if (!shippingValidation.valid) {
      return NextResponse.json({
        error: 'Invalid shipping information',
        details: shippingValidation.errors
      }, { status: 400 })
    }

    // Validate all product IDs are UUIDs
    for (const item of items) {
      if (!validateUUID(item.productId)) {
        return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
      }
    }

    // Use server-side Supabase client
    const supabase = await createClient()

    const ids = items.map((i: { productId: string }) => i.productId)
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase error:', error)
      }
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Verify all products exist and have sufficient inventory
    const line_items = items.map((item: { productId: string; quantity: number }) => {
      const product = products?.find((p: { id: string }) => p.id === item.productId)
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }

      // Check inventory
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for product: ${product.title}`)
      }

      // Validate product data
      if (typeof product.price !== 'number' || product.price <= 0 || product.price > 999999) {
        throw new Error('Invalid product price')
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sanitizeString(product.title, 200),
            description: product.description ? sanitizeString(product.description, 500) : undefined,
            images: product.image ? [product.image] : undefined,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Sanitize shipping info for metadata
    const sanitizedShipping = {
      customerName: sanitizeString(shippingInfo.name, 100),
      phone: sanitizeString(shippingInfo.phone, 20),
      addressLine1: sanitizeString(shippingInfo.addressLine1, 200),
      addressLine2: shippingInfo.addressLine2 ? sanitizeString(shippingInfo.addressLine2, 200) : '',
      city: sanitizeString(shippingInfo.city, 100),
      state: sanitizeString(shippingInfo.state, 100),
      postalCode: sanitizeString(shippingInfo.postalCode, 20),
      country: sanitizeString(shippingInfo.country, 2).toUpperCase(),
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      customer_email: email,
      metadata: {
        items: JSON.stringify(items.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity
        }))),
        ...sanitizedShipping,
      },
    })

    return NextResponse.json({ url: session.url, id: session.id }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error && err.message.length < 100
      ? err.message
      : 'Failed to create checkout session. Please try again.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
