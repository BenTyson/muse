'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'

interface UploadingPhoto {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  photoId?: string
}

interface PhotoUploadProps {
  sessionId: string
}

export default function PhotoUpload({ sessionId }: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadingPhoto[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading',
    }))

    setUploadingPhotos(prev => [...prev, ...newUploads])

    // Process each file
    for (const upload of newUploads) {
      try {
        await uploadPhoto(upload)
      } catch (error) {
        console.error('Upload failed:', error)
        setUploadingPhotos(prev =>
          prev.map(u =>
            u.id === upload.id
              ? { ...u, status: 'failed', error: 'Upload failed' }
              : u
          )
        )
      }
    }
  }, [sessionId])

  const uploadPhoto = async (upload: UploadingPhoto) => {
    try {
      // Step 1: Get upload URL
      const uploadUrlResponse = await fetch('/api/photos/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          fileName: upload.file.name,
          contentType: upload.file.type,
          fileSize: upload.file.size,
        }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, photoId, photoPath } = await uploadUrlResponse.json()

      // Update with photo ID
      setUploadingPhotos(prev =>
        prev.map(u =>
          u.id === upload.id
            ? { ...u, photoId }
            : u
        )
      )

      // Step 2: Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: upload.file,
        headers: {
          'Content-Type': upload.file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3')
      }

      // Update progress
      setUploadingPhotos(prev =>
        prev.map(u =>
          u.id === upload.id
            ? { ...u, progress: 90, status: 'processing' }
            : u
        )
      )

      // Step 3: Mark upload as complete
      const completeResponse = await fetch('/api/photos/upload-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId,
          originalPath: photoPath,
        }),
      })

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload')
      }

      // Mark as completed
      setUploadingPhotos(prev =>
        prev.map(u =>
          u.id === upload.id
            ? { ...u, progress: 100, status: 'completed' }
            : u
        )
      )

    } catch (error) {
      setUploadingPhotos(prev =>
        prev.map(u =>
          u.id === upload.id
            ? { ...u, status: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
            : u
        )
      )
    }
  }

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const removeUpload = (id: string) => {
    setUploadingPhotos(prev => prev.filter(u => u.id !== id))
  }

  const retryUpload = async (upload: UploadingPhoto) => {
    setUploadingPhotos(prev =>
      prev.map(u =>
        u.id === upload.id
          ? { ...u, status: 'uploading', progress: 0, error: undefined }
          : u
      )
    )
    
    try {
      await uploadPhoto(upload)
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dropzoneActive || isDragActive
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>
          <div className="text-lg font-medium text-gray-900">
            {dropzoneActive ? 'Drop photos here' : 'Upload photos'}
          </div>
          <p className="text-gray-600">
            Drag and drop photos here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, and WebP files up to 50MB each
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingPhotos.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Uploading Photos</h4>
          {uploadingPhotos.map(upload => (
            <div key={upload.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(upload.file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {upload.status === 'completed' && (
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {upload.status === 'failed' && (
                    <div className="flex items-center space-x-2">
                      <div className="text-red-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(upload)}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {upload.status === 'uploading' || upload.status === 'processing' ? (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              ) : null}

              {/* Status */}
              <div className="mt-2 text-xs text-gray-600">
                {upload.status === 'uploading' && 'Uploading...'}
                {upload.status === 'processing' && 'Processing...'}
                {upload.status === 'completed' && 'Upload complete'}
                {upload.status === 'failed' && (upload.error || 'Upload failed')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}