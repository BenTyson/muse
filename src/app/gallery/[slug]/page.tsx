'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import GalleryAccessForm from '@/components/gallery/GalleryAccessForm'
import { format } from 'date-fns'

interface Photo {
  id: string
  fileName: string
  originalUrl: string
  thumbnailUrl: string
  largeUrl: string
  mediumUrl: string
  smallUrl: string
  createdAt: string
}

interface Gallery {
  id: string
  name: string
  slug: string
  requiresPassword: boolean
  publicShareEnabled: boolean
  downloadEnabled: boolean
  socialShareEnabled: boolean
  watermarkEnabled: boolean
  expiresAt: string | null
  viewCount: number
  session: {
    sessionNumber: string
    sessionDate: string
    packageName: string
    customerName: string
    children: Array<{
      firstName: string
      lastName: string
    }>
  }
  photoCount: number
  photos?: Photo[]
}

export default function GalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleryInfo()
  }, [slug])

  const fetchGalleryInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/galleries/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery)
        setError(null)
      } else if (response.status === 404) {
        setError('Gallery not found')
      } else if (response.status === 410) {
        setError('This gallery has expired')
      } else {
        setError('Failed to load gallery')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAccessGranted = (galleryWithPhotos: Gallery) => {
    setGallery(galleryWithPhotos)
    setHasAccess(true)
  }

  const handleDownloadAll = async () => {
    if (!gallery?.downloadEnabled || !gallery.photos) return

    try {
      // Create a simple download link for each photo
      // In a real implementation, you might want to create a ZIP file
      gallery.photos.forEach((photo, index) => {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = photo.originalUrl
          link.download = photo.fileName
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 100) // Stagger downloads
      })
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error === 'Gallery not found' && "This gallery doesn't exist or may have been removed."}
            {error === 'This gallery has expired' && "This gallery is no longer available for viewing."}
            {error.includes('Failed') && "Please try again later or contact support if the problem persists."}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!gallery) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900">{gallery.name}</h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 space-y-1 sm:space-y-0 sm:space-x-4">
                  <span>Session #{gallery.session.sessionNumber}</span>
                  <span className="hidden sm:block">•</span>
                  <span>{format(new Date(gallery.session.sessionDate), 'MMMM d, yyyy')}</span>
                  <span className="hidden sm:block">•</span>
                  <span>{gallery.session.packageName}</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {gallery.session.children.map(child => `${child.firstName} ${child.lastName}`).join(', ')}
                </div>
              </div>
              
              {hasAccess && gallery.downloadEnabled && gallery.photos && gallery.photos.length > 0 && (
                <Button onClick={handleDownloadAll} className="shrink-0">
                  Download All ({gallery.photos.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasAccess && gallery.photos ? (
          <div>
            {/* Gallery Info */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {gallery.photos.length} Photo{gallery.photos.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">
                    Gallery viewed {gallery.viewCount} time{gallery.viewCount !== 1 ? 's' : ''}
                  </p>
                  {gallery.expiresAt && (
                    <p className="text-sm text-amber-600 mt-1">
                      Available until {format(new Date(gallery.expiresAt), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                  {gallery.socialShareEnabled && (
                    <Button variant="outline" size="sm">
                      Share Gallery
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            <PhotoGrid 
              photos={gallery.photos}
              downloadEnabled={gallery.downloadEnabled}
              watermarkEnabled={gallery.watermarkEnabled}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center MB-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
                <p className="text-gray-600 mb-6">
                  This gallery contains {gallery.photoCount} photo{gallery.photoCount !== 1 ? 's' : ''} from your session.
                  Please enter your access code{gallery.requiresPassword ? ' and password' : ''} to view.
                </p>
              </div>

              <GalleryAccessForm
                slug={slug}
                requiresPassword={gallery.requiresPassword}
                onAccessGranted={handleAccessGranted}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}