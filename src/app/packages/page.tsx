'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PackageAddon {
  id: string
  name: string
  description: string | null
  price: number
  addonType: string
}

interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  basePrice: number
  durationMinutes: number
  maxChildren: number
  includesStyling: boolean
  maxOutfitChanges: number
  includedPhotos: number
  photoEditingLevel: string | null
  includesPrint: boolean
  printSize: string | null
  addons: PackageAddon[]
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/packages')
        if (!response.ok) {
          throw new Error('Failed to fetch packages')
        }
        const data = await response.json()
        setPackages(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Loading starburst */}
            <div className="relative w-24 h-24 mx-auto">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-cyan-400 to-transparent animate-pulse"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 16px',
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-white font-oswald text-lg">LOADING PACKAGES...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">SOMETHING WENT WRONG</h2>
          <p className="text-gray-300 font-oswald mb-6">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative py-24 px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 opacity-10">
          <div className="relative w-full h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-24 bg-gradient-to-t from-transparent via-pink-500 to-transparent"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 48px',
                  transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute top-10 right-10 w-64 h-64 opacity-10">
          <div className="relative w-full h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-24 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 48px',
                  transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight mb-8">
            <span className="block text-white">CHOOSE YOUR</span>
            <span className="block bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              ELECTRIC
            </span>
            <span className="block text-white">PACKAGE</span>
          </h1>
          
          {/* Scrolling text banner */}
          <div className="relative my-12">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-400 h-12 -skew-y-1"></div>
            <div className="relative flex items-center h-12 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-black font-bold text-lg mx-4">PROFESSIONAL STYLING //</span>
                <span className="text-black font-bold text-lg mx-4">PUNK ROCK VIBES //</span>
                <span className="text-black font-bold text-lg mx-4">AUTHENTIC MOMENTS //</span>
                <span className="text-black font-bold text-lg mx-4">PROFESSIONAL STYLING //</span>
                <span className="text-black font-bold text-lg mx-4">PUNK ROCK VIBES //</span>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 font-oswald max-w-3xl mx-auto">
            Transform your little one into a rock legend with our professional photography packages. 
            Each session includes styling, instruments, and attitude coaching.
          </p>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="relative group"
            >
              {/* Background starburst for each package */}
              <div className="absolute -inset-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="relative w-full h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-32 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 64px',
                        transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Package Card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-3xl overflow-hidden group-hover:border-pink-500/50 transition-all duration-300 group-hover:scale-105">
                {/* Price badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center transform rotate-12 z-20">
                  <div className="text-center">
                    <div className="text-black font-black text-xs">${pkg.basePrice}</div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Package Name */}
                  <h3 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                    {pkg.name.toUpperCase()}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 font-oswald text-lg mb-8 leading-relaxed">
                    {pkg.shortDescription}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-4"></div>
                      <span className="text-white font-oswald">{pkg.durationMinutes} MINUTE SESSION</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-4"></div>
                      <span className="text-white font-oswald">UP TO {pkg.maxChildren} {pkg.maxChildren === 1 ? 'CHILD' : 'CHILDREN'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-4"></div>
                      <span className="text-white font-oswald">{pkg.includedPhotos} EDITED DIGITAL PHOTOS</span>
                    </div>
                    
                    {pkg.includesStyling && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-4"></div>
                        <span className="text-white font-oswald">PROFESSIONAL STYLING INCLUDED</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-4"></div>
                      <span className="text-white font-oswald">{pkg.maxOutfitChanges} OUTFIT {pkg.maxOutfitChanges === 1 ? 'CHANGE' : 'CHANGES'}</span>
                    </div>
                    
                    {pkg.includesPrint && pkg.printSize && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-4"></div>
                        <span className="text-white font-oswald">COMPLIMENTARY {pkg.printSize.toUpperCase()} PRINT</span>
                      </div>
                    )}
                  </div>

                  {/* Add-ons */}
                  {pkg.addons && pkg.addons.length > 0 && (
                    <div className="mb-8 p-4 bg-black/50 rounded-2xl border border-gray-700">
                      <h4 className="text-lg font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                        AVAILABLE ADD-ONS
                      </h4>
                      <div className="space-y-2">
                        {pkg.addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-sm">
                            <span className="text-gray-300 font-oswald">{addon.name}</span>
                            <span className="text-white font-bold">+${addon.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Description */}
                  {pkg.description && (
                    <p className="text-gray-400 font-oswald text-sm mb-8 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}

                  {/* Book Button */}
                  <Link href={`/booking?package=${pkg.slug}`} className="block">
                    <button className="w-full px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full hover:scale-105 transition-transform duration-300">
                      BOOK THIS PACKAGE
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-24">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            READY TO ROCK?
          </h2>
          <p className="text-gray-300 font-oswald text-xl mb-8 max-w-2xl mx-auto">
            Can't decide? Our team can help you choose the perfect package for your rock star.
          </p>
          <Link href="/contact">
            <button className="px-12 py-4 text-xl font-bold text-black bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full hover:scale-105 transition-transform duration-300">
              GET HELP CHOOSING
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}