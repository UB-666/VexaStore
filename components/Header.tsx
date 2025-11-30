'use client'

import Link from 'next/link'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const { items } = useCart()
  const { user, userRole, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setShowMobileMenu(false)
    setShowSearch(false)
    setTimeout(() => router.push(href), 150)
  }

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowMobileMenu(false)
    setShowSearch(false)
    
    if (pathname === '/') {
      // Already on home page, just scroll to products
      const productsSection = document.getElementById('products')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to home page with products hash
      router.push('/#products')
      // After navigation, scroll to products
      setTimeout(() => {
        const productsSection = document.getElementById('products')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0))
    }
  }, [items, mounted])

  useEffect(() => {
    // Close mobile menu when route changes
    setShowMobileMenu(false)
    setShowSearch(false)
  }, [pathname])

  async function handleSignOut() {
    setShowUserMenu(false)
    setShowMobileMenu(false)
    await signOut()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery)
      setShowSearch(false)
      setSearchQuery('')
      
      if (pathname === '/') {
        // Already on home page, update URL and scroll to products
        router.push(`/?search=${query}`)
        setTimeout(() => {
          const productsSection = document.getElementById('products')
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        // Navigate to home page with search query
        router.push(`/?search=${query}`)
        // After navigation, scroll to products
        setTimeout(() => {
          const productsSection = document.getElementById('products')
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/70 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5 transition-all duration-500">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className="relative w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-cyan-500/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              VexaStore
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
            </Link>
            <a href="/#products" onClick={handleProductsClick} className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group cursor-pointer">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
            </a>
            {user && (
              <Link href="/orders" className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group">
                Orders
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
              </Link>
            )}
            <Link href="/about" className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
            </Link>
            {userRole === 'developer' && (
              <Link href="/admin" className="text-gray-300 hover:text-cyan-400 font-medium transition-all duration-500 relative group">
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500"></span>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Button */}
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-gray-800/50 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500 transition-all duration-500"
              title="Search Products"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-800/50 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>

            {/* User Menu or Login/Signup - Hidden on mobile */}
            {!loading && (
              user ? (
                <div className="hidden md:block relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500 transition-all duration-500 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                    <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3 border-b border-cyan-500/20">
                          <p className="text-sm text-gray-400">Signed in as</p>
                          <p className="text-white font-medium truncate">{user.email}</p>
                          <p className="text-xs text-cyan-400 capitalize mt-1">{userRole} Account</p>
                        </div>
                        <div className="py-2">
                          {userRole === 'developer' && (
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <motion.button
                      className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/signup">
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </div>
              )
            )}

            {/* Cart Button */}
            <Link href="/cart" className="relative">
              <motion.div
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-500 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <motion.span 
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="mt-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-800/50 border-2 border-cyan-500/30 text-white rounded-xl px-4 py-3 pr-12 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none placeholder-gray-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              >
                Home
              </Link>
              <a
                href="/#products"
                onClick={handleProductsClick}
                className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
              >
                Products
              </a>
              {user && (
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                >
                  My Orders
                </Link>
              )}
              <Link
                href="/about"
                className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              >
                Contact
              </Link>
              {userRole === 'developer' && (
                <Link
                  href="/admin"
                  className="block px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                >
                  Admin Panel
                </Link>
              )}
              
              {/* Mobile User Section */}
              {!loading && (
                <div className="pt-4 border-t border-cyan-500/20">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-400">
                        Signed in as <span className="text-cyan-400 font-medium">{user.email}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-center text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg transition-all font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
