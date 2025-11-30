'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  image: string | null
  inventory: number
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    image: '',
    inventory: '100',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        alert('Failed to fetch products: ' + error.message)
      } else {
        setProducts(data || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      alert('Failed to fetch products. Make sure your Supabase credentials are configured.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.slug || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const productData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image: formData.image || null,
        inventory: parseInt(formData.inventory) || 100,
      }

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)

        if (error) throw error
        alert('Product updated successfully!')
        setEditingId(null)
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        alert('Product created successfully!')
      }

      setFormData({
        title: '',
        slug: '',
        description: '',
        price: '',
        image: '',
        inventory: '100',
      })
      fetchProducts()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error saving product:', error)
      alert('Failed to save product: ' + message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
      alert('Product deleted successfully!')
      fetchProducts()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error deleting product:', error)
      alert('Failed to delete product: ' + message)
    }
  }

  function handleEdit(product: Product) {
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      inventory: product.inventory.toString(),
    })
    setEditingId(product.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setFormData({
      title: '',
      slug: '',
      description: '',
      price: '',
      image: '',
      inventory: '100',
    })
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-400 animate-pulse">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </h1>
            <p className="text-gray-400">Manage your products and orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            View Orders
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl shadow-xl p-6 sticky top-4 hover:border-cyan-500/40 transition-all duration-300">
            <motion.h2 
              className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              key={editingId}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </motion.h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50"
                  placeholder="Blue Hoodie"
                  required
                />
              </motion.div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug * (URL-friendly)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50"
                  placeholder="blue-hoodie"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price * (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50"
                  placeholder="49.99"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Inventory
                </label>
                <input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500 hover:border-cyan-500/50 resize-none"
                  rows={3}
                  placeholder="Comfortable blue hoodie perfect for any season..."
                />
              </div>

              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingId ? '💾 Update Product' : '✨ Create Product'}
                </motion.button>
                {editingId && (
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-800/50 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✕ Cancel
                  </motion.button>
                )}
              </motion.div>
            </form>
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl shadow-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              📦 Products ({products.length})
            </h2>
            
            {products.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4 animate-bounce-slow">📦</div>
                <p className="text-gray-400 text-lg">No products yet. Create your first product!</p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-4 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                    variants={staggerItem}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl overflow-hidden border border-cyan-500/20">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400/50 text-xs">
                          📷
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg">{product.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">🔗 {product.slug}</p>
                      <p className="text-sm text-cyan-400 font-semibold">💰 ${product.price}</p>
                      <p className="text-sm text-gray-400">📦 Stock: {product.inventory}</p>
                      {product.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        onClick={() => handleEdit(product)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✏️ Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🗑️ Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
