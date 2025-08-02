'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { Button } from '@/components/ui/button'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold">Your Cart</h2>
              {state.itemCount > 0 && (
                <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-1 rounded-full">
                  {state.itemCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-4">Add some awesome products to get started!</p>
                <Button onClick={onClose} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-2xl">📸</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {item.variantName}
                      </p>
                      
                      {item.customization && (
                        <div className="flex gap-2 mt-1">
                          {item.customization.size && (
                            <span className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-600">
                              {item.customization.size}
                            </span>
                          )}
                          {item.customization.color && (
                            <span className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-600">
                              {item.customization.color}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-red-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-red-500 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {state.items.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={clearCart}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${state.total.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Checkout
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}