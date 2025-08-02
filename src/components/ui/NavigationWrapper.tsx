'use client'

import Navigation from './Navigation'
import { CartProvider } from '@/components/shop/CartProvider'

export default function NavigationWrapper() {
  return (
    <CartProvider>
      <Navigation />
    </CartProvider>
  )
}