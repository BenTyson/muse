'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import DateTimeSelector from '@/components/booking/DateTimeSelector'
import ChildForm from '@/components/booking/ChildForm'
import { ChildInput } from '@/lib/validations'

interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  durationMinutes: number
  maxChildren: number
  addons: {
    id: string
    name: string
    description: string | null
    price: number
  }[]
}

function BookingForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageSlug = searchParams.get('package')

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [children, setChildren] = useState<ChildInput[]>([])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/booking' + (packageSlug ? `?package=${packageSlug}` : ''))
    }
  }, [status, router, packageSlug])

  // Fetch package data
  useEffect(() => {
    if (packageSlug) {
      fetchPackage(packageSlug)
    }
  }, [packageSlug])

  const fetchPackage = async (slug: string) => {
    try {
      const response = await fetch('/api/packages')
      const packages = await response.json()
      const pkg = packages.find((p: Package) => p.slug === slug)
      if (pkg) {
        setSelectedPackage(pkg)
      } else {
        setError('Package not found')
      }
    } catch (err) {
      setError('Failed to load package')
    }
  }

  const handleDateTimeChange = (date: Date | null, time: string | null) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const addChild = () => {
    if (selectedPackage && children.length < selectedPackage.maxChildren) {
      setChildren([...children, {
        firstName: '',
        lastName: '',
        birthDate: '',
        preferredStyle: '',
        musicPreferences: '',
        styleNotes: '',
        specialRequirements: '',
      }])
    }
  }

  const updateChild = (index: number, child: ChildInput) => {
    const updatedChildren = [...children]
    updatedChildren[index] = child
    setChildren(updatedChildren)
  }

  const removeChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index)
    setChildren(updatedChildren)
  }

  const calculateTotal = () => {
    if (!selectedPackage) return 0
    
    let total = selectedPackage.basePrice
    selectedAddons.forEach(addonId => {
      const addon = selectedPackage.addons.find(a => a.id === addonId)
      if (addon) total += addon.price
    })
    
    return total
  }

  const handleSubmit = async () => {
    if (!selectedPackage || !selectedDate || !selectedTime || children.length === 0) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const bookingData = {
        packageId: selectedPackage.id,
        sessionDate: format(selectedDate, 'yyyy-MM-dd'),
        sessionTime: selectedTime,
        children,
        selectedAddons,
        specialRequests,
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Booking failed')
      }

      // Redirect to payment
      router.push(`/checkout/${result.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  if (error && !selectedPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/packages">
            <Button>Back to Packages</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!selectedPackage) {
    return <div className="min-h-screen flex items-center justify-center">Loading package...</div>
  }

  const steps = [
    { id: 1, name: 'Date & Time', completed: selectedDate && selectedTime },
    { id: 2, name: 'Children', completed: children.length > 0 },
    { id: 3, name: 'Add-ons & Review', completed: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Session</h1>
          <p className="mt-2 text-gray-600">Selected: {selectedPackage.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-5">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                        currentStep > step.id || step.completed
                          ? 'border-green-500 bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id || step.completed ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      currentStep === step.id ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div className="ml-5 w-16 h-0.5 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div>
              <DateTimeSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                sessionDuration={selectedPackage.durationMinutes}
                onDateTimeChange={handleDateTimeChange}
              />
              
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue to Children
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Children */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Children</h3>
              
              {children.map((child, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Child {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeChild(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <ChildForm
                    child={child}
                    onSave={(updatedChild) => updateChild(index, updatedChild)}
                  />
                </div>
              ))}

              {children.length < selectedPackage.maxChildren && (
                <Button
                  variant="outline"
                  onClick={addChild}
                  className="mb-6"
                >
                  Add Another Child
                </Button>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={children.length === 0}
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Add-ons & Review */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-ons & Review</h3>

              {/* Add-ons */}
              {selectedPackage.addons.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Available Add-ons</h4>
                  <div className="space-y-2">
                    {selectedPackage.addons.map((addon) => (
                      <label key={addon.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddons([...selectedAddons, addon.id])
                            } else {
                              setSelectedAddons(selectedAddons.filter(id => id !== addon.id))
                            }
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm">
                          {addon.name} (+${addon.price})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or notes for your session..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Package: {selectedPackage.name}</span>
                    <span>${selectedPackage.basePrice}</span>
                  </div>
                  {selectedAddons.map(addonId => {
                    const addon = selectedPackage.addons.find(a => a.id === addonId)
                    return addon ? (
                      <div key={addon.id} className="flex justify-between">
                        <span>{addon.name}</span>
                        <span>+${addon.price}</span>
                      </div>
                    ) : null
                  })}
                  <div className="border-t pt-2 font-medium flex justify-between">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} isLoading={loading}>
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingForm />
    </Suspense>
  )
}