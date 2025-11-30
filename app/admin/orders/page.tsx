'use client'

import { useState, useEffect } from 'react'
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
  stripe_session_id: string
  email: string
  amount: number
  status: string
  customer_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  created_at: string
  metadata: any
  order_items?: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, statusFilter, dateFilter, orders])

  async function fetchOrders() {
    try {
      // Fetch orders from API route (server-side)
      const response = await fetch('/api/admin/orders')
      const data = await response.json()

      if (!response.ok) {
        console.error('Error fetching orders:', data.error)
        alert('Failed to fetch orders: ' + data.error)
      } else {
        setOrders(data.orders || [])
        setFilteredOrders(data.orders || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      alert('Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }

      alert('Order status updated successfully!')
    } catch (error: any) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status: ' + error.message)
    } finally {
      setUpdatingStatus(null)
    }
  }

  function filterOrders() {
    let filtered = [...orders]

    // Search filter (email, customer name, or amount)
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.amount.toString().includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at)
        const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dateFilter === 'today') return daysDiff === 0
        if (dateFilter === 'week') return daysDiff <= 7
        if (dateFilter === 'month') return daysDiff <= 30
        return true
      })
    }

    setFilteredOrders(filtered)
  }

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0)
  const recentOrders = filteredOrders.slice(0, 5)

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-gray-400 mt-2">View and manage all customer orders</p>
            </div>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-800/50 border-2 border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500 transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Total Orders</h3>
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{filteredOrders.length}</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Total Revenue</h3>
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Avg Order Value</h3>
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">
              ${filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length).toFixed(2) : '0.00'}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, name, amount, or order ID..."
                className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500/20 rounded-2xl p-16 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-gray-400">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cyan-500/10 border-b-2 border-cyan-500/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-cyan-500/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-mono">
                          {order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {order.customer_name || 'N/A'}
                          </div>
                          <div className="text-sm text-cyan-400">
                            <a href={`mailto:${order.email}`} className="hover:text-cyan-300">
                              {order.email}
                            </a>
                          </div>
                          {order.phone && (
                            <div className="text-xs text-gray-400 mt-1">
                              {order.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-green-400">
                          ${order.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all outline-none cursor-pointer ${
                            order.status === 'paid' || order.status === 'processing'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                              : order.status === 'shipped' || order.status === 'shipping'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30'
                              : order.status === 'delivered' || order.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
                          } ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="paid">PAID</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border-2 border-cyan-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-cyan-300 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Order ID</div>
                      <div className="text-white font-mono">{selectedOrder.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-2">Status</div>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus === selectedOrder.id}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-bold border transition-all outline-none cursor-pointer ${
                          selectedOrder.status === 'paid' || selectedOrder.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                            : selectedOrder.status === 'shipped' || selectedOrder.status === 'shipping'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30'
                            : selectedOrder.status === 'delivered' || selectedOrder.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
                        } ${updatingStatus === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="paid">PAID</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-gray-400">Amount</div>
                      <div className="text-green-400 font-bold text-lg">${selectedOrder.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Date</div>
                      <div className="text-white">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-blue-300 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-400">Name</div>
                      <div className="text-white font-medium">{selectedOrder.customer_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Email</div>
                      <div className="text-cyan-400">
                        <a href={`mailto:${selectedOrder.email}`} className="hover:text-cyan-300">
                          {selectedOrder.email}
                        </a>
                      </div>
                    </div>
                    {selectedOrder.phone && (
                      <div>
                        <div className="text-gray-400">Phone</div>
                        <div className="text-white">{selectedOrder.phone}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.address_line1 && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-purple-300 mb-3">Shipping Address</h3>
                    <div className="text-white space-y-1">
                      <div>{selectedOrder.address_line1}</div>
                      {selectedOrder.address_line2 && <div>{selectedOrder.address_line2}</div>}
                      <div>
                        {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}
                      </div>
                      <div>{selectedOrder.country}</div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-orange-300 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                          {item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded-lg border border-orange-500/30"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.product.title}</div>
                            <div className="text-gray-400 text-sm">
                              Quantity: <span className="text-white">{item.quantity}</span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              Unit Price: <span className="text-green-400 font-medium">${item.unit_price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 text-sm">Subtotal</div>
                            <div className="text-green-400 font-bold text-lg">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-orange-500/30 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-300 font-medium">Total Items:</div>
                          <div className="text-white font-bold">
                            {selectedOrder.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-gray-300 font-medium text-lg">Order Total:</div>
                          <div className="text-green-400 font-bold text-2xl">
                            ${selectedOrder.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Info */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-green-300 mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-400">Stripe Session ID</div>
                      <div className="text-white font-mono break-all">{selectedOrder.stripe_session_id}</div>
                    </div>
                    <div>
                      <a
                        href={`https://dashboard.stripe.com/test/payments/${selectedOrder.stripe_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-medium mt-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View in Stripe Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
