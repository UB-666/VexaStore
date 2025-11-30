'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionWrapperProps {
  children: ReactNode
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1
          }
        }}
        exit={{ 
          opacity: 0,
          y: -30,
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
