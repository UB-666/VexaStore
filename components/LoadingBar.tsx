'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoadingBar() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timeout)
  }, [pathname])

  if (!isLoading) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 z-50 shadow-lg shadow-cyan-500/50"
      initial={{ scaleX: 0, transformOrigin: 'left' }}
      animate={{ scaleX: 1 }}
      exit={{ scaleX: 0, transformOrigin: 'right' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}
