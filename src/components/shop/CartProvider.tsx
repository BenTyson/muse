'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

interface CartItem {
  id: string
  photoId?: string
  productVariantId: string
  productName: string
  variantName: string
  price: number
  quantity: number
  customization?: {
    size?: string
    color?: string
    material?: string
    [key: string]: any
  }
  productImage?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.productVariantId === action.payload.productVariantId &&
          item.photoId === action.payload.photoId &&
          JSON.stringify(item.customization) === JSON.stringify(action.payload.customization)
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        // Add new item
        newItems = [...state.items, action.payload]
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 }

    case 'LOAD_CART': {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      return { items, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('electric-muse-cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('electric-muse-cart', JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const cartItem: CartItem = {
      ...item,
      id: `${item.productVariantId}-${item.photoId || 'no-photo'}-${Date.now()}`,
    }
    dispatch({ type: 'ADD_ITEM', payload: cartItem })
  }

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}