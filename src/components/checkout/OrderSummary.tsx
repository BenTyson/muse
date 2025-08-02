'use client'

import Image from 'next/image'

interface CartItem {
  id: string
  photoId?: string
  productVariantId: string
  productName: string
  variantName: string
  price: number
  quantity: number
  customization?: any
  productImage?: string
}

interface OrderSummaryProps {
  items: CartItem[]
  total: number
  itemCount: number
}

export default function OrderSummary({ items, total, itemCount }: OrderSummaryProps) {
  const subtotal = total
  const taxAmount = subtotal * 0.08 // 8% tax
  const shippingAmount = subtotal > 75 ? 0 : 12.99 // Free shipping over $75
  const orderTotal = subtotal + taxAmount + shippingAmount

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h3>

      {/* Items List */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {item.variantName}
              </p>
              
              {item.customization && (
                <div className="flex gap-1 mt-1">
                  {item.customization.size && (
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                      {item.customization.size}
                    </span>
                  )}
                  {item.customization.color && (
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                      {item.customization.color}
                    </span>
                  )}
                </div>
              )}

              {item.photoId && (
                <div className="mt-1">
                  <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                    📸 Custom Photo
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                <span className="font-medium text-sm text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shippingAmount === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${shippingAmount.toFixed(2)}`
            )}
          </span>
        </div>

        {subtotal < 75 && shippingAmount > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Add ${(75 - subtotal).toFixed(2)} more for free shipping
          </div>
        )}
        
        <div className="border-t pt-2 mt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ${orderTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-xs text-gray-600">
          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your payment information is secure and encrypted
        </div>
      </div>
    </div>
  )
}