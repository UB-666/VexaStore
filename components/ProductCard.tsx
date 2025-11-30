'use client'

import Link from 'next/link'
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

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 flex flex-col hover-lift h-full">
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden">
        <div className="relative w-full h-64 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cyan-500/50">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>
      
      <div className="p-5 flex-1 flex flex-col">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-all duration-300 mb-2 line-clamp-1">
            {product.title}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2 flex-1 transition-colors duration-300">{product.description}</p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent transition-all duration-300">
              ${Number(product.price).toFixed(2)}
            </div>
            {product.inventory <= 10 && product.inventory > 0 && (
              <div className="text-xs text-orange-400 font-medium mt-1 transition-colors duration-300 animate-pulse">
                Only {product.inventory} left!
              </div>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 font-semibold text-sm disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100 group/btn"
            disabled={product.inventory <= 0}
          >
            {product.inventory > 0 ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </span>
            ) : (
              'Sold Out'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
