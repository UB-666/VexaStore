'use client'

import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react'

export interface CartItem {
  productId: string
  title: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'INIT'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QTY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR' }

const CartStateContext = createContext<CartState | undefined>(undefined)
const CartDispatchContext = createContext<React.Dispatch<CartAction> | undefined>(undefined)

const initialState: CartState = {
  items: [],
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INIT': {
      return { ...state, items: action.payload || [] }
    }
    case 'ADD_ITEM': {
      const item = action.payload
      const exists = state.items.find(i => i.productId === item.productId)
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, item] }
    }
    case 'UPDATE_QTY': {
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(i => i.productId !== action.payload.productId),
      }
    }
    case 'CLEAR': {
      return { ...state, items: [] }
    }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart')
      if (raw) {
        const parsed = JSON.parse(raw)

        // Validate structure before using
        if (Array.isArray(parsed)) {
          // Filter out invalid items and only keep valid ones
          const validItems = parsed.filter(item =>
            item &&
            typeof item === 'object' &&
            typeof item.productId === 'string' &&
            item.productId.length > 0 &&
            typeof item.title === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0 &&
            item.quantity < 1000 &&
            (typeof item.image === 'string' || item.image === undefined) &&
            (typeof item.slug === 'string' || item.slug === undefined)
          )

          if (validItems.length > 0) {
            dispatch({ type: 'INIT', payload: validItems })
          }
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
      // Clear corrupted cart data
      localStorage.removeItem('cart')
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, [state.items])

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartStateContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext)
  if (context === undefined) {
    throw new Error('useCartDispatch must be used within a CartProvider')
  }
  return context
}
