'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PhotoUpload from '@/components/admin/PhotoUpload'

interface Session {
  id: string
  sessionNumber: string
  sessionDate: string
  status: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  package: {
    name: string
  }
  gallery?: {
    id: string
    name: string
    slug: string
    accessCode: string
  }
}

export default function AdminSessionPhotosPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const sessionId = params.sessionId as string
  
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateGallery, setShowCreateGallery] = useState(false)
  const [galleryForm, setGalleryForm] = useState({
    name: '',
    passwordProtected: false,
    password: '',
    publicShareEnabled: false,
    downloadEnabled: true,
    socialShareEnabled: true,
    watermarkEnabled: true,
    expiryDays: 90,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        redirect('/dashboard')
      }
      fetchSessionData()
    }
  }, [status, sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
        if (!data.gallery) {
          setGalleryForm(prev => ({
            ...prev,
            name: `${data.user.firstName} ${data.user.lastName} - ${data.package.name}`,
          }))
        }
      } else {
        setError('Session not found')
      }
    } catch (err) {
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGallery = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/galleries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...galleryForm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessionData(prev => prev ? { ...prev, gallery: data.gallery } : null)
        setShowCreateGallery(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create gallery')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Session not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Session Photos
                </h1>
                <p className="mt-2 text-gray-600">
                  Session #{sessionData.sessionNumber} - {sessionData.user.firstName} {sessionData.user.lastName}
                </p>
              </div>
              
              {sessionData.gallery ? (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">Gallery Created</p>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/gallery/${sessionData.gallery!.slug}`, '_blank')}
                    >
                      View Gallery
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`Access Code: ${sessionData.gallery!.accessCode}`)
                        // You could show a toast here
                      }}
                    >
                      Copy Access Code
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowCreateGallery(true)}>
                  Create Gallery
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Customer</p>
              <p className="text-gray-600">{sessionData.user.firstName} {sessionData.user.lastName}</p>
              <p className="text-gray-600">{sessionData.user.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Package</p>
              <p className="text-gray-600">{sessionData.package.name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Session Date</p>
              <p className="text-gray-600">{new Date(sessionData.sessionDate).toLocaleDateString()}</p>
              <p className="text-gray-600">Status: {sessionData.status}</p>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUpload sessionId={sessionId} />

        {/* Create Gallery Modal */}
        {showCreateGallery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Gallery</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Name
                  </label>
                  <input
                    type="text"
                    value={galleryForm.name}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.passwordProtected}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, passwordProtected: e.target.checked }))}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">Password Protected</span>
                  </label>
                </div>

                {galleryForm.passwordProtected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={galleryForm.password}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Days
                  </label>
                  <input
                    type="number"
                    value={galleryForm.expiryDays}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.downloadEnabled}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, downloadEnabled: e.target.checked }))}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">Allow Downloads</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.watermarkEnabled}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, watermarkEnabled: e.target.checked }))}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">Enable Watermarks</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateGallery(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGallery}>
                  Create Gallery
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}