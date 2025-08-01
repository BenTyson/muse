'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface GalleryAccessFormProps {
  slug: string
  requiresPassword: boolean
  onAccessGranted: (gallery: any) => void
}

export default function GalleryAccessForm({ 
  slug, 
  requiresPassword, 
  onAccessGranted 
}: GalleryAccessFormProps) {
  const [accessCode, setAccessCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accessCode.trim()) {
      setError('Please enter your access code')
      return
    }

    if (requiresPassword && !password.trim()) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/galleries/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessCode: accessCode.trim().toUpperCase(),
          password: password.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onAccessGranted(data.gallery)
      } else {
        setError(data.error || 'Access denied')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
          Access Code
        </label>
        <input
          type="text"
          id="accessCode"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase tracking-wider text-center text-lg font-mono"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the access code provided to you via email
        </p>
      </div>

      {requiresPassword && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter gallery password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Accessing Gallery...
          </div>
        ) : (
          'Access Gallery'
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Having trouble? Contact us for assistance with your gallery access.
        </p>
      </div>
    </form>
  )
}