'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartDispatch } from '@/components/CartContext'
import { motion } from 'framer-motion'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useCartDispatch()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const session_id = searchParams.get('session_id')
    setSessionId(session_id)
    
    if (session_id) {
      dispatch({ type: 'CLEAR' })
    }
  }, [searchParams, dispatch])

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950/30 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-3xl shadow-2xl p-12 text-center">
            <motion.div 
              className="mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 100,
                  damping: 12,
                  delay: 0.7 
                }}
              >
                <motion.svg 
                  className="w-16 h-16 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Order Successful!
                </span>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Thank you for your purchase 🎉
              </motion.p>
            </motion.div>

            {sessionId && (
              <motion.div 
                className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <p className="text-sm font-semibold text-cyan-300 mb-2">Order Reference</p>
                <p className="text-xs font-mono text-cyan-400 break-all bg-gray-800/50 rounded-lg p-3">{sessionId}</p>
              </motion.div>
            )}

            <motion.div 
              className="space-y-6 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.9
                  }
                }
              }}
            >
              <motion.div 
                className="flex items-start gap-4 text-left bg-gray-800/50 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-white">Email Confirmation Sent</p>
                  <p className="text-sm text-gray-400">Check your inbox for order details and receipt</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 text-left bg-gray-800/50 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <p className="font-semibold text-white">Processing Your Order</p>
                  <p className="text-sm text-gray-400">We'll notify you when it ships</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-xl hover:shadow-cyan-500/50 transition-all font-bold text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-8 pt-8 border-t border-cyan-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-cyan-500/20 rounded-full">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-400">
                  Demo store • Test mode • No real charges
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
