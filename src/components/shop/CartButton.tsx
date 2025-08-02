'use client'

import { useCart } from './CartProvider'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

interface CartButtonProps {
  onClick: () => void
  className?: string
}

export default function CartButton({ onClick, className = '' }: CartButtonProps) {
  const { state } = useCart()

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`relative ${className}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {state.itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {state.itemCount > 99 ? '99+' : state.itemCount}
        </span>
      )}
      <span className="ml-2 hidden sm:inline">
        Cart {state.itemCount > 0 && `(${state.itemCount})`}
      </span>
    </Button>
  )
}