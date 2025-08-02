'use client'

import Navigation from '@/components/ui/Navigation'
import { CartProvider } from '@/components/shop/CartProvider'
import ProductDetailContent from './ProductDetailContent'

export default function ProductDetailPage() {
  return (
    <CartProvider>
      <Navigation />
      <ProductDetailContent />
    </CartProvider>
  )
}