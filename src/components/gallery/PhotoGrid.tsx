'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PhotoLightbox from './PhotoLightbox'

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

interface PhotoGridProps {
  photos: Photo[]
  downloadEnabled: boolean
  watermarkEnabled: boolean
}

export default function PhotoGrid({ photos, downloadEnabled, watermarkEnabled }: PhotoGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const handlePhotoClick = (index: number) => {
    if (selectionMode) {
      togglePhotoSelection(photos[index].id)
    } else {
      setSelectedPhotoIndex(index)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos)
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId)
    } else {
      newSelection.add(photoId)
    }
    setSelectedPhotos(newSelection)
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedPhotos(new Set())
    }
  }

  const selectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)))
    }
  }

  const downloadSelected = () => {
    const selectedPhotosList = photos.filter(photo => selectedPhotos.has(photo.id))
    
    selectedPhotosList.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.originalUrl
        link.download = photo.fileName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 100)
    })
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
        <p className="text-gray-600">
          Photos from your session will appear here once they're uploaded.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={toggleSelectionMode}
            className="shrink-0"
          >
            {selectionMode ? 'Cancel Selection' : 'Select Photos'}
          </Button>
          
          {selectionMode && (
            <>
              <Button
                variant="outline"
                onClick={selectAll}
                size="sm"
              >
                {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              {selectedPhotos.size > 0 && downloadEnabled && (
                <Button
                  onClick={downloadSelected}
                  size="sm"
                >
                  Download Selected ({selectedPhotos.size})
                </Button>
              )}
            </>
          )}
        </div>

        {selectionMode && (
          <div className="text-sm text-gray-600">
            {selectedPhotos.size} of {photos.length} selected
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`
              relative aspect-square overflow-hidden rounded-lg cursor-pointer group
              ${selectionMode ? 'ring-2 ring-transparent hover:ring-red-300' : ''}
              ${selectedPhotos.has(photo.id) ? 'ring-2 ring-red-500' : ''}
            `}
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Selection Overlay */}
            {selectionMode && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedPhotos.has(photo.id) 
                    ? 'bg-red-500 border-red-500' 
                    : 'bg-white bg-opacity-20 border-white'
                  }
                `}>
                  {selectedPhotos.has(photo.id) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            {!selectionMode && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Photo Number */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          downloadEnabled={downloadEnabled}
          watermarkEnabled={watermarkEnabled}
        />
      )}
    </div>
  )
}