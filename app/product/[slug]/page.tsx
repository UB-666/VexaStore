'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartDispatch } from '@/components/CartContext'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  image: string | null
  inventory: number
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const dispatch = useCartDispatch()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', params.slug)
          .single()

        if (error) {
          console.error('Error fetching product:', error)
        } else {
          setProduct(data)
        }
      } catch (error: any) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  function handleAddToCart() {
    if (!product) return

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        quantity,
        image: product.image || '/placeholder.jpg',
        slug: product.slug,
      },
    })
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-400 animate-pulse">Loading product...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950/30 py-8">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16 animate-scale-in">
            <div className="text-6xl mb-4 animate-bounce-slow">😞</div>
            <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950/30 py-8">
      <div className="container mx-auto px-4 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-full shadow-md hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-cyan-400 font-medium hover:scale-105 animate-slide-in-left"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </button>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-gray-800 to-cyan-900/30 overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-center animate-slide-in-right">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {product.title}
              </span>
            </h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ${Number(product.price).toFixed(2)}
              </div>
              {product.inventory <= 10 && product.inventory > 0 && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold animate-pulse">
                  Only {product.inventory} left!
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-8 pb-8 border-b border-cyan-500/20">
                <h2 className="text-lg font-bold text-white mb-3">About this product</h2>
                <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className={`w-6 h-6 ${product.inventory > 0 ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className={`text-lg font-semibold ${
                  product.inventory > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <label className="text-white font-bold text-lg">Quantity:</label>
              <div className="flex items-center gap-3 bg-gray-800/50 rounded-full p-1 border border-cyan-500/30">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-gray-700/50 shadow-md flex items-center justify-center hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all font-bold text-xl text-gray-300"
                  disabled={product.inventory <= 0}
                >
                  −
                </button>
                <span className="w-16 text-center font-bold text-2xl text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="w-12 h-12 rounded-full bg-gray-700/50 shadow-md flex items-center justify-center hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition-all font-bold text-xl text-gray-300"
                  disabled={product.inventory <= 0}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className="w-full px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 font-bold text-xl disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
            >
              {product.inventory > 0 ? (
                <>
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              ) : (
                'Out of Stock'
              )}
            </button>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-3 text-sm text-cyan-400">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Free shipping on orders over $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
