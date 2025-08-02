'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { CreditCard, Truck, User } from 'lucide-react'

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

interface CheckoutFormProps {
  step: 'address' | 'payment'
  onStepChange: (step: 'address' | 'payment' | 'success') => void
  onOrderComplete: (order: any) => void
  cartItems: CartItem[]
  cartTotal: number
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export default function CheckoutForm({
  step,
  onStepChange,
  onOrderComplete,
  cartItems,
  cartTotal,
}: CheckoutFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  })

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [orderNotes, setOrderNotes] = useState('')

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address1', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress])

    if (missingFields.length > 0) {
      setError('Please fill in all required shipping information.')
      return
    }

    onStepChange('payment')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          photoId: item.photoId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          customizationData: item.customization,
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        subtotal: cartTotal,
        taxAmount: cartTotal * 0.08, // 8% tax for example
        shippingAmount: cartTotal > 75 ? 0 : 12.99, // Free shipping over $75
        totalAmount: cartTotal + (cartTotal * 0.08) + (cartTotal > 75 ? 0 : 12.99),
        notes: orderNotes,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        onOrderComplete(order)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: keyof ShippingAddress, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {step === 'address' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Truck className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
          </div>

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.firstName}
                  onChange={(e) => handleAddressChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.lastName}
                  onChange={(e) => handleAddressChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Address Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={shippingAddress.address1}
                onChange={(e) => handleAddressChange('address1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={shippingAddress.address2}
                onChange={(e) => handleAddressChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Special instructions for your order..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
              Continue to Payment
            </Button>
          </form>
        </div>
      )}

      {step === 'payment' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <CreditCard className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Billing Address */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Billing address same as shipping
                </span>
              </label>
            </div>

            {!sameAsShipping && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Billing Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingAddress.firstName}
                      onChange={(e) => handleBillingChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingAddress.lastName}
                      onChange={(e) => handleBillingChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                
                {/* Add other billing address fields here if needed */}
              </div>
            )}

            {/* Payment Method Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> This is a demonstration checkout. No real payment will be processed. 
                Your order will be created for testing purposes.
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}