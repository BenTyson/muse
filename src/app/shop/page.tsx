'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/shop/ProductGrid'
import Navigation from '@/components/ui/Navigation'
import { CartProvider } from '@/components/shop/CartProvider'
import { Button } from '@/components/ui/button'
import { Filter, Search, X } from 'lucide-react'

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

const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  { id: 'prints', name: 'Photo Prints', icon: '📸' },
  { id: 'canvas', name: 'Canvas Art', icon: '🎨' },
  { id: 'metal', name: 'Metal Prints', icon: '✨' },
  { id: 'apparel', name: 'Apparel', icon: '👕' },
  { id: 'accessories', name: 'Accessories', icon: '☕' },
]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const selectedPhoto = searchParams.get('photo')
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured') // featured, price-low, price-high, name

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-high':
        filtered = filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'name':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
      default:
        filtered = filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.basePrice - b.basePrice
        })
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <CartProvider>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rock Star Shop</h1>
                <p className="mt-2 text-gray-600">
                  {selectedPhoto
                    ? 'Transform your photos into amazing products'
                    : 'Browse our collection of premium photo products'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>

              <hr className="my-6" />

              <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="featured">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchQuery && ` found for "${searchQuery}"`}
                {selectedCategory !== 'all' && (
                  <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
                )}
              </div>
              
              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} selectedPhoto={selectedPhoto} />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  View All Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </CartProvider>
  )
}