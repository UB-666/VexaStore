'use client'

import { useState } from 'react'
import { useCart, useCartDispatch } from '@/components/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items } = useCart()
  const dispatch = useCartDispatch()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleCheckout() {
    // Validate required fields
    if (!email) {
      alert('Please enter your email address')
      return
    }
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.addressLine1 || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.postalCode) {
      alert('Please fill in all required shipping information')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          email,
          shippingInfo,
        }),
      })

      const data = await res.json()
      
      if (data && data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session: ' + (data.error || 'Unknown error'))
        setLoading(false)
      }
    } catch (error) {
      // Don't log the full error in production as it may contain sensitive info
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout error:', error)
      }
      alert('Failed to initiate checkout. Please try again.')
      setLoading(false)
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
    } else {
      dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } })
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Shopping Cart
            </span>
          </h1>
          <p className="text-gray-400">Review your items and proceed to checkout</p>
        </div>

      {items.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl shadow-lg p-16 text-center animate-fade-in">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added any items yet</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={item.productId} className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 p-6 flex flex-col sm:flex-row items-center gap-6 hover-lift stagger-item" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link href={`/product/${item.slug}`} className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                    {item.title}
                  </Link>
                  <div className="text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-lg font-semibold text-cyan-400">${item.price.toFixed(2)}</span>
                    <span className="text-sm">per item</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-800/50 rounded-full p-1 border border-cyan-500/20">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-gray-700 shadow-md flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all font-bold text-white"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-700 shadow-md flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all font-bold text-white"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Total</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { productId: item.productId } })}
                    className="p-3 text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-300 hover:scale-110"
                    title="Remove item"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl shadow-lg p-8 sticky top-24 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Items</span>
                  <span className="font-semibold text-white">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-sm text-green-400 font-medium">FREE</span>
                </div>
                <div className="border-t-2 border-cyan-500/20 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                  required
                />
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingInfo.addressLine1}
                      onChange={(e) => setShippingInfo({...shippingInfo, addressLine1: e.target.value})}
                      placeholder="123 Main St"
                      className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={shippingInfo.addressLine2}
                      onChange={(e) => setShippingInfo({...shippingInfo, addressLine2: e.target.value})}
                      placeholder="Apt, Suite, etc."
                      className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        placeholder="New York"
                        className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        placeholder="NY"
                        className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        placeholder="10001"
                        className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                        className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none"
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        <option value="CN">China</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="NO">Norway</option>
                        <option value="DK">Denmark</option>
                        <option value="FI">Finland</option>
                        <option value="NZ">New Zealand</option>
                        <option value="SG">Singapore</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="ZA">South Africa</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !email || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.addressLine1 || !shippingInfo.city || !shippingInfo.state || !shippingInfo.postalCode}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 font-bold text-lg disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Proceed to Checkout
                  </>
                )}
              </button>

              <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-cyan-300">Secure Checkout</p>
                    <p className="text-xs text-cyan-400/80 mt-1">Powered by Stripe. Your payment info is encrypted and secure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
