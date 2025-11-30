'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  product: {
    id: string
    title: string
    slug: string
    image: string | null
  }
}

interface Order {
  id: string
  created_at: string
  email: string
  amount: number
  status: string
  customer_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  order_items?: OrderItem[]
  metadata: {
    items?: string
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/orders', {
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch orders')
      }
      
      setOrders(data.orders || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped':
      case 'shipping':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'processing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'shipped':
      case 'shipping':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      case 'delivered':
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'cancelled':
      case 'canceled':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  function parseOrderItems(metadata: any): OrderItem[] {
    try {
      if (metadata?.items && typeof metadata.items === 'string') {
        return JSON.parse(metadata.items)
      }
    } catch (e) {
      console.error('Error parsing order items:', e)
    }
    return []
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-900/30 to-blue-900/30">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/30 to-blue-900/30 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              My Orders
            </span>
          </h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/#products">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Products
              </motion.button>
            </Link>
          </motion.div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const items = parseOrderItems(order.metadata)
              
              return (
                <motion.div
                  key={order.id}
                  className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-cyan-400">
                        ${order.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Shipping Address
                      </h4>
                      <div className="text-gray-300 space-y-1">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm">{order.address_line1}</p>
                        {order.address_line2 && <p className="text-sm">{order.address_line2}</p>}
                        <p className="text-sm">{order.city}, {order.state} {order.postal_code}</p>
                        <p className="text-sm">{order.country}</p>
                        <p className="text-sm text-cyan-400 mt-2">{order.phone}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.order_items && order.order_items.length > 0 ? (
                          order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-gray-300 text-sm bg-gray-800/50 rounded-lg p-3">
                              {item.product.image && (
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="w-12 h-12 object-cover rounded border border-cyan-500/30"
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-white">{item.product.title}</div>
                                <div className="text-xs text-gray-400">
                                  ${item.unit_price.toFixed(2)} × {item.quantity}
                                </div>
                              </div>
                              <div className="text-cyan-400 font-semibold">
                                ${(item.unit_price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No items information available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="mt-6 pt-6 border-t border-cyan-500/20">
                    <h4 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Order Status
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Current status:</span>
                      <span className="text-cyan-400 font-semibold">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
