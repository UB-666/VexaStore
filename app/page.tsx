'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import { useCartDispatch } from '@/components/CartContext'
import { useRouter, useSearchParams } from 'next/navigation'

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  image: string | null
  inventory: number
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)
  const [visibleCount, setVisibleCount] = useState(8) // Show 8 products initially
  const dispatch = useCartDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const urlSearchQuery = searchParams.get('search')

  // Set search query from URL on mount and scroll to products
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery)
      // Scroll to products section when search is performed
      setTimeout(() => {
        const productsSection = document.getElementById('products')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [urlSearchQuery])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching products:', error)
          // If error is about invalid URL, env vars are not set
          if (error.message?.includes('Invalid URL') || error.message?.includes('placeholder')) {
            setIsConfigured(false)
          }
        } else {
          setProducts(data || [])
          setFilteredProducts(data || [])
        }
      } catch (error: any) {
        console.error('Failed to fetch products:', error)
        // Check if error is related to missing configuration
        if (error?.message?.includes('Invalid URL') || error?.message?.includes('placeholder')) {
          setIsConfigured(false)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(query) ||
        (product.description?.toLowerCase() || '').includes(query)
      )
      setFilteredProducts(filtered)
    }
    // Reset visible count when filter changes
    setVisibleCount(8)
  }, [searchQuery, products])

  function handleSearch(query: string) {
    setSearchQuery(query)
    setVisibleCount(8) // Reset visible count on new search
  }

  function handleShowMore() {
    setVisibleCount(prev => prev + 8) // Load 8 more products
  }

  function handleShowLess() {
    setVisibleCount(8) // Reset to initial 8 products
    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById('products')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  function handleAddToCart(product: Product) {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        quantity: 1,
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
          <div className="text-lg text-gray-400 animate-pulse">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-cyan-900/30 to-blue-900/30 text-white overflow-hidden min-h-[80vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwNmI2ZDQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djJoLTJ2LTJoMnptMCA0djJoLTJ2LTJoMnptLTQgMHYyaC0ydi0yaDJ6bS00IDB2MmgtMnYtMmgyek0yMCAyMHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bS00IDB2MmgtMnYtMmgyek0xNiAyNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-slide-in">
              <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <span className="text-cyan-400 text-sm font-semibold">✨ Welcome to the Future of Shopping</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Discover Your
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-glow">
                  Perfect Style
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl animate-slide-in" style={{animationDelay: '0.2s'}}>
                Shop the latest trends with exclusive deals. Premium quality, unbeatable prices, and lightning-fast delivery.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-slide-in" style={{animationDelay: '0.4s'}}>
                <a href="#products" className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <span>Shop Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a href="#features" className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border-2 border-cyan-500/30 text-white rounded-full font-bold hover:bg-gray-800 hover:border-cyan-500/50 transition-all duration-300">
                  Learn More
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-cyan-400">10K+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-cyan-400">50K+</div>
                  <div className="text-sm text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-cyan-400">4.9★</div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="relative z-10">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Premium Quality</div>
                        <div className="text-sm text-gray-400">Verified Products</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Fast Shipping</div>
                        <div className="text-sm text-gray-400">2-3 Days Delivery</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Secure Payment</div>
                        <div className="text-sm text-gray-400">Stripe Protected</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorParam && (
        <div className="container mx-auto px-4 lg:px-8 pt-8">
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 animate-slide-in">
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                {errorParam === 'unauthorized' && (
                  <p className="font-semibold">Access Denied: You don't have permission to access the admin panel. Only developer accounts can access admin features.</p>
                )}
                {errorParam === 'auth_required' && (
                  <p className="font-semibold">Authentication Required: Please log in to access that page.</p>
                )}
                {errorParam === 'role_fetch_failed' && (
                  <p className="font-semibold">Error: Unable to verify your account role. Please try logging out and back in.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div id="products" className="container mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12 animate-slide-in">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Explore our handpicked collection of premium products, curated just for you
          </p>
          
          {/* Search Bar */}
          {products.length > 0 && (
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search products by name or description..."
            />
          )}
          
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                {filteredProducts.length === 0 ? (
                  <span className="text-yellow-400">No products found for &quot;{searchQuery}&quot;</span>
                ) : (
                  <span>
                    Found <strong className="text-cyan-400">{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

      {!isConfigured ? (
        <div className="text-center py-16 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-8 transition-colors duration-300">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Environment Variables Not Configured</h2>
          <div className="text-left max-w-2xl mx-auto space-y-4">
            <p className="text-gray-700 mb-4">To get started, you need to:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Add your Supabase and Stripe credentials to <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code></li>
              <li>Restart the development server (stop with Ctrl+C, then run <code className="bg-gray-200 px-2 py-1 rounded">pnpm dev</code>)</li>
            </ol>
            <div className="mt-6 bg-white p-4 rounded border">
              <p className="font-semibold mb-2">See the .env.local file in your project root</p>
              <p className="text-sm text-gray-600">Fill in your Supabase URL, keys, and Stripe keys</p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              See <strong>SETUP_GUIDE.md</strong> for detailed instructions.
            </p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">No products available yet.</p>
          <p className="text-gray-500 text-sm">
            Please add products via the admin panel or Supabase dashboard.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 animate-scale-in">
          <div className="text-6xl mb-4 animate-bounce-slow">🔍</div>
          <p className="text-gray-400 text-lg mb-4">No products found matching your search.</p>
          <button 
            onClick={() => handleSearch('')}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 hover:scale-105 transition-all duration-300"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.slice(0, visibleCount).map((product, index) => (
              <div key={product.id} className="stagger-item" style={{animationDelay: `${index * 0.05}s`}}>
                <ProductCard product={product} onAdd={handleAddToCart} />
              </div>
            ))}
          </div>
          
          {/* Show More / Show Less Buttons */}
          {filteredProducts.length > 8 && (
            <div className="flex justify-center gap-4 mt-12">
              {visibleCount < filteredProducts.length && (
                <button
                  onClick={handleShowMore}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <span>Show More</span>
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              
              {visibleCount > 8 && (
                <button
                  onClick={handleShowLess}
                  className="group px-8 py-4 bg-gray-800/50 border-2 border-cyan-500/30 text-cyan-400 rounded-full font-bold hover:bg-cyan-500/10 hover:border-cyan-500 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>Show Less</span>
                </button>
              )}
            </div>
          )}
          
          {/* Showing X of Y products */}
          {filteredProducts.length > 8 && (
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-cyan-400 font-semibold">{Math.min(visibleCount, filteredProducts.length)}</span> of <span className="text-cyan-400 font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>
          )}
        </>
      )}
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gradient-to-br from-gray-900 to-cyan-950/20 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-slide-in">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Why Shop With Us
            </h2>
            <p className="text-gray-400 text-lg">Experience the best online shopping with these amazing features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 text-center group animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-cyan-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">Secure Payments</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">100% secure payments powered by Stripe. Your data is always protected.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 text-center group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-pink-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">Fast Delivery</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Quick and reliable shipping to your doorstep. Track your order anytime.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 text-center group animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-cyan-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">Quality Guaranteed</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Premium products with satisfaction guarantee. Love it or return it!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-400 animate-pulse">Loading products...</div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
