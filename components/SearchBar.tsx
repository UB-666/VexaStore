'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = 'Search products...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="w-full max-w-2xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative group">
        <motion.div 
          className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
          animate={{ 
            scale: query ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          <svg
            className="w-5 h-5 text-cyan-400 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.div>
        <motion.input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 bg-gray-800/50 border-2 border-cyan-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-cyan-500/50"
          whileFocus={{ scale: 1.01 }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 rounded-full hover:bg-cyan-500/10"
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
          <motion.button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            Search
          </motion.button>
        </div>
      </div>
    </motion.form>
  )
}
