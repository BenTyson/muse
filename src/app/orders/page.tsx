'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/ui/Navigation'
import { Button } from '@/components/ui/button'
import { Package, Eye, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  fulfillmentStatus: string
  productVariant: {
    name: string
    product: {
      name: string
      category: string
    }
  }
  photo?: {
    filename: string
  }
  customizationData?: any
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  shippingAddress: any
  trackingNumbers?: string[]
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        setError('Failed to load orders')
      }
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'printed':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-green-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received'
      case 'processing':
        return 'Processing'
      case 'printed':
        return 'Printed'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
                  <p className="mt-2 text-gray-600">
                    Track and manage your Electric Muse orders
                  </p>
                </div>
                <Link href="/shop">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                When you place your first order, it will appear here.
              </p>
              <Link href="/shop">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getStatusText(order.status)} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {item.photo ? (
                              <div className="text-sm">📸</div>
                            ) : (
                              <div className="text-sm">
                                {item.productVariant.product.category === 'prints' ? '📸' : 
                                 item.productVariant.product.category === 'canvas' ? '🎨' : 
                                 item.productVariant.product.category === 'metal' ? '✨' : 
                                 item.productVariant.product.category === 'apparel' ? '👕' : '☕'}
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.productVariant.product.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.productVariant.name}
                            </p>
                            
                            {item.customizationData && (
                              <div className="flex gap-2 mt-1">
                                {item.customizationData.size && (
                                  <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                    {item.customizationData.size}
                                  </span>
                                )}
                                {item.customizationData.color && (
                                  <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                    {item.customizationData.color}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.photo && (
                              <div className="mt-1">
                                <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                                  📸 Custom Photo Applied
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-500">
                                Qty: {item.quantity} • ${item.unitPrice.toFixed(2)} each
                              </span>
                              <span className="font-medium text-gray-900">
                                ${item.totalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                          <div>{order.shippingAddress.address1}</div>
                          {order.shippingAddress.address2 && (
                            <div>{order.shippingAddress.address2}</div>
                          )}
                          <div>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>${order.taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>
                              {order.shippingAmount === 0 ? 'FREE' : `$${order.shippingAmount.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1 mt-2">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumbers && order.trackingNumbers.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Tracking Information
                        </h4>
                        <div className="text-sm text-gray-600">
                          {order.trackingNumbers.map((tracking, index) => (
                            <div key={index} className="font-mono">
                              {tracking}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estimated Delivery */}
                    {order.estimatedDelivery && !order.deliveredAt && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Estimated Delivery:</strong> {format(new Date(order.estimatedDelivery), 'EEEE, MMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    {/* Delivered */}
                    {order.deliveredAt && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          <strong>Delivered</strong> on {format(new Date(order.deliveredAt), 'EEEE, MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}