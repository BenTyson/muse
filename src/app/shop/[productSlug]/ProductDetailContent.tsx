'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/components/shop/CartProvider'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Minus, ShoppingCart, Heart, Star, Check } from 'lucide-react'

interface ProductVariant {
  id: string
  name: string
  price: number
  size?: string
  color?: string
  material?: string
  sku: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  basePrice: number
  featured: boolean
  productImage?: string
  sizeOptions?: string[]
  colorOptions?: string[]
  materialOptions?: string[]
  variants: ProductVariant[]
}

export default function ProductDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToCart } = useCart()
  
  const productSlug = params.productSlug as string
  const selectedPhotoId = searchParams.get('photo')
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{
    size?: string
    color?: string
    material?: string
  }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productSlug])

  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Auto-select the first variant or find matching variant based on selected options
      const matchingVariant = product.variants.find(variant => {
        return (!selectedOptions.size || variant.size === selectedOptions.size) &&
               (!selectedOptions.color || variant.color === selectedOptions.color) &&
               (!selectedOptions.material || variant.material === selectedOptions.material)
      })
      
      setSelectedVariant(matchingVariant || product.variants[0])
    }
  }, [product, selectedOptions])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productSlug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        
        // Parse options from JSON strings
        if (data.sizeOptions) {
          data.sizeOptions = JSON.parse(data.sizeOptions)
        }
        if (data.colorOptions) {
          data.colorOptions = JSON.parse(data.colorOptions)
        }
        if (data.materialOptions) {
          data.materialOptions = JSON.parse(data.materialOptions)
        }
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return

    addToCart({
      photoId: selectedPhotoId || undefined,
      productVariantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      customization: selectedOptions,
      productImage: product.productImage,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleOptionChange = (optionType: 'size' | 'color' | 'material', value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/shop')}>
            Return to Shop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {product.productImage ? (
                <Image
                  src={product.productImage}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-8xl">
                  {product.category === 'prints' ? '📸' : 
                   product.category === 'canvas' ? '🎨' : 
                   product.category === 'metal' ? '✨' : 
                   product.category === 'apparel' ? '👕' : '☕'}
                </div>
              )}
            </div>
            
            {selectedPhotoId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📸 <strong>Your photo will be applied to this product</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Photo ID: {selectedPhotoId}
                </p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Popular
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.shortDescription}</p>
            </div>

            {/* Price */}
            <div className="border-b pb-6">
              <div className="text-3xl font-bold text-gray-900">
                ${selectedVariant?.price.toFixed(2) || product.basePrice.toFixed(2)}
              </div>
              {product.variants.length > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  Prices from ${Math.min(...product.variants.map(v => v.price)).toFixed(2)}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Size Options */}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleOptionChange('size', size)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedOptions.size === size
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleOptionChange('color', color)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                          selectedOptions.color === color
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {color.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Options */}
              {product.materialOptions && product.materialOptions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Material</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materialOptions.map((material) => (
                      <button
                        key={material}
                        onClick={() => handleOptionChange('material', material)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                          selectedOptions.material === material
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-red-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-red-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className={`w-full py-3 text-lg font-medium transition-all ${
                  addedToCart
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                {selectedVariant ? selectedVariant.name : 'Select options above'}
              </p>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}