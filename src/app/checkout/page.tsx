'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Navigation from '@/components/ui/Navigation'
import { CartProvider, useCart } from '@/components/shop/CartProvider'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock } from 'lucide-react'

function CheckoutContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address')
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login?redirectTo=/checkout')
    }
  }, [status])

  useEffect(() => {
    // Redirect if cart is empty
    if (state.items.length === 0 && step !== 'success') {
      router.push('/shop')
    }
  }, [state.items.length, step, router])

  const handleOrderComplete = (order: any) => {
    setOrderData(order)
    setStep('success')
    clearCart()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (state.items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to continue with checkout.</p>
          <Button onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => step === 'address' ? router.push('/shop') : setStep('address')}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {step === 'address' ? 'Back to Shop' : 'Back'}
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {step === 'success' ? 'Order Complete!' : 'Checkout'}
                  </h1>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4 mr-1" />
                    Secure checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step !== 'success' && (
          /* Progress Steps */
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'address' ? 'bg-red-600 text-white' : 
                  step === 'payment' || step === 'success' ? 'bg-green-600 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step === 'payment' || step === 'success' ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Shipping Info</span>
              </div>
              <div className={`h-1 w-16 ${step === 'payment' || step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'payment' ? 'bg-red-600 text-white' : 
                  step === 'success' ? 'bg-green-600 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step === 'success' ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' ? (
          /* Success Page */
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your order! We'll start processing it right away and send you updates via email.
            </p>
            
            {orderData && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">${orderData.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{orderData.items?.length || 0} items</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto"
              >
                View Orders
              </Button>
              <div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/shop')}
                  className="w-full sm:w-auto"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <CheckoutForm
                step={step}
                onStepChange={setStep}
                onOrderComplete={handleOrderComplete}
                cartItems={state.items}
                cartTotal={state.total}
              />
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={state.items}
                total={state.total}
                itemCount={state.itemCount}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <Navigation />
      <CheckoutContent />
    </CartProvider>
  )
}