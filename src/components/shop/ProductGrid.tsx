'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  category: string
  basePrice: number
  featured: boolean
  productImage?: string
  variants: Array<{
    id: string
    name: string
    price: number
    size?: string
    color?: string
  }>
}

interface ProductGridProps {
  products: Product[]
  selectedPhoto?: string // Photo ID that will be applied to products
}

export default function ProductGrid({ products, selectedPhoto }: ProductGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { addToCart } = useCart()

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0]
    if (defaultVariant) {
      addToCart({
        photoId: selectedPhoto || undefined,
        productVariantId: defaultVariant.id,
        productName: product.name,
        variantName: defaultVariant.name,
        price: defaultVariant.price,
        quantity: 1,
        productImage: product.productImage,
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prints': return '📸'
      case 'canvas': return '🎨'
      case 'metal': return '✨'
      case 'apparel': return '👕'
      case 'accessories': return '☕'
      default: return '🛍️'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {product.productImage ? (
              <Image
                src={product.productImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl">
                {getCategoryIcon(product.category)}
              </div>
            )}
            
            {/* Featured Badge */}
            {product.featured && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Popular
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
              {product.category}
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  favorites.has(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600'
                }`}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {product.name}
              </h3>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${product.basePrice}
                </div>
                {product.variants.length > 1 && (
                  <div className="text-xs text-gray-500">
                    from ${Math.min(...product.variants.map(v => v.price))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDescription}
            </p>

            {/* Size/Color Options Preview */}
            {product.variants.length > 1 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">
                  {product.variants.some(v => v.size) && 'Sizes: '}
                  {product.variants.some(v => v.color) && 'Colors: '}
                  Available
                </div>
                <div className="flex gap-1 flex-wrap">
                  {product.variants.slice(0, 4).map((variant, index) => (
                    <div
                      key={variant.id}
                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                    >
                      {variant.size || variant.color || `Option ${index + 1}`}
                    </div>
                  ))}
                  {product.variants.length > 4 && (
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                      +{product.variants.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/shop/${product.slug}${selectedPhoto ? `?photo=${selectedPhoto}` : ''}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full text-sm hover:bg-gray-50"
                >
                  Customize
                </Button>
              </Link>
              <Button
                onClick={() => handleAddToCart(product)}
                className="bg-red-600 hover:bg-red-700 text-white px-4"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}