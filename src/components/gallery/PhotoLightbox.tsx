'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

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

interface PhotoLightboxProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
  downloadEnabled: boolean
  watermarkEnabled: boolean
}

export default function PhotoLightbox({ 
  photos, 
  initialIndex, 
  onClose, 
  downloadEnabled,
  watermarkEnabled 
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)

  const currentPhoto = photos[currentIndex]

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
    setIsLoading(true)
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
    setIsLoading(true)
  }, [photos.length])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
    }
  }, [onClose, goToPrevious, goToNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentPhoto.originalUrl
    link.download = currentPhoto.fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timer)
      setTimeout(() => setShowControls(false), 3000)
    }

    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [currentIndex])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className={`
          absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white 
          hover:bg-opacity-70 transition-all duration-200
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Photo Counter */}
      <div className={`
        absolute top-4 left-4 z-10 px-3 py-2 rounded-full bg-black bg-opacity-50 text-white text-sm
        transition-all duration-200
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
        {currentIndex + 1} of {photos.length}
      </div>

      {/* Download Button */}
      {downloadEnabled && (
        <div className={`
          absolute top-4 left-1/2 transform -translate-x-1/2 z-10
          transition-all duration-200
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}>
          <Button onClick={handleDownload} size="sm" className="bg-black bg-opacity-50 hover:bg-opacity-70">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>
        </div>
      )}

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`
              absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
              bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200
              ${showControls ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className={`
              absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
              bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200
              ${showControls ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Photo */}
      <div className="relative max-w-full max-h-full flex items-center justify-center p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        
        <img
          src={currentPhoto.largeUrl}
          alt={currentPhoto.fileName}
          className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />

        {watermarkEnabled && (
          <div className="absolute bottom-4 right-4 text-white text-sm opacity-70 bg-black bg-opacity-30 px-2 py-1 rounded">
            Electric Muse Photography
          </div>
        )}
      </div>

      {/* Photo Info */}
      <div className={`
        absolute bottom-4 left-4 z-10 px-3 py-2 rounded bg-black bg-opacity-50 text-white text-sm max-w-xs
        transition-all duration-200
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="font-medium truncate">{currentPhoto.fileName}</div>
        <div className="text-xs opacity-75">
          {new Date(currentPhoto.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Thumbnail Strip (for mobile) */}
      {photos.length > 1 && (
        <div className={`
          absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10
          flex space-x-2 bg-black bg-opacity-50 p-2 rounded
          transition-all duration-200 sm:hidden
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}>
          {photos.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((photo, index) => {
            const actualIndex = Math.max(0, currentIndex - 2) + index
            return (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(actualIndex)}
                className={`
                  w-8 h-8 rounded overflow-hidden border-2
                  ${actualIndex === currentIndex ? 'border-white' : 'border-transparent'}
                `}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}