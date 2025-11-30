import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  const error = '❌ CRITICAL: Missing STRIPE_SECRET_KEY in environment variables'
  console.error(error)
  console.error('Please add STRIPE_SECRET_KEY to your .env.local file')
  console.error('Get your secret key from: https://dashboard.stripe.com/apikeys')
  throw new Error(error)
}

// Validate that it's a proper Stripe key format
if (!stripeSecretKey.startsWith('sk_')) {
  const error = '❌ CRITICAL: Invalid STRIPE_SECRET_KEY format (must start with sk_)'
  console.error(error)
  throw new Error(error)
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})
