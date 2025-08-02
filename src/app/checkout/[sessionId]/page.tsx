'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PaymentPlanSelector from '@/components/payment/PaymentPlanSelector'
import CheckoutForm from '@/components/payment/CheckoutForm'
import { PaymentPlanId } from '@/lib/stripe'
import { format } from 'date-fns'

interface SessionData {
  id: string
  sessionNumber: string
  sessionDate: string
  sessionTime: string
  totalAmount: number
  package: {
    name: string
    durationMinutes: number
  }
  sessionChildren: Array<{
    child: {
      firstName: string
      lastName: string
    }
  }>
}

interface PaymentState {
  clientSecret: string | null
  paymentPlanId: string | null
  amount: number
  savings: number
}

export default function CheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanId | null>(null)
  const [paymentState, setPaymentState] = useState<PaymentState>({
    clientSecret: null,
    paymentPlanId: null,
    amount: 0,
    savings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan')

  // Unwrap params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setSessionId(resolvedParams.sessionId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated' && sessionId) {
      fetchSessionData()
    }
  }, [status, sessionId])

  const fetchSessionData = async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else {
        setError('Session not found or access denied')
      }
    } catch (err) {
      setError('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelected = (planId: PaymentPlanId) => {
    setSelectedPlan(planId)
  }

  const proceedToPayment = async () => {
    if (!selectedPlan || !sessionData) return

    setLoading(true)
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          paymentPlan: selectedPlan,
          amount: sessionData.totalAmount,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentState({
          clientSecret: data.clientSecret,
          paymentPlanId: data.paymentPlanId,
          amount: data.amount,
          savings: data.savings,
        })
        setStep('payment')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create payment')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setStep('plan') // Go back to plan selection
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <button
                onClick={() => step === 'payment' ? setStep('plan') : router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
                <p className="mt-2 text-gray-600">Session #{sessionData.sessionNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'plan' ? 'bg-red-600 text-white' : 
                step === 'payment' || step === 'success' ? 'bg-green-600 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                {step === 'payment' || step === 'success' ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Payment Plan</span>
            </div>
            <div className={`h-1 w-16 ${step === 'payment' || step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'payment' ? 'bg-red-600 text-white' : 
                step === 'success' ? 'bg-green-600 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                {step === 'success' ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
            </div>
            <div className={`h-1 w-16 ${step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step === 'success' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Complete</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{sessionData.package.name}</p>
                  <p className="text-gray-600">{sessionData.package.durationMinutes} minutes</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">
                    {format(new Date(sessionData.sessionDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(new Date(sessionData.sessionTime), 'h:mm a')}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Children</p>
                  {sessionData.sessionChildren.map((sc, index) => (
                    <p key={index} className="text-gray-600">
                      {sc.child.firstName} {sc.child.lastName}
                    </p>
                  ))}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${sessionData.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'plan' && (
              <div className="bg-white rounded-lg shadow p-6">
                <PaymentPlanSelector
                  totalAmount={sessionData.totalAmount}
                  onPlanSelected={handlePlanSelected}
                  selectedPlan={selectedPlan}
                />
                
                {selectedPlan && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={proceedToPayment}
                      disabled={loading}
                      size="lg"
                      className="px-8"
                    >
                      {loading ? 'Processing...' : 'Continue to Payment'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 'payment' && paymentState.clientSecret && (
              <div className="bg-white rounded-lg shadow p-6">
                <CheckoutForm
                  clientSecret={paymentState.clientSecret}
                  amount={paymentState.amount}
                  savings={paymentState.savings}
                  paymentPlan={selectedPlan!}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}

            {step === 'success' && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your booking is confirmed and your session is scheduled. 
                  We'll send you a confirmation email with all the details.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View Dashboard
                  </Button>
                  <p className="text-sm text-gray-500">
                    We can't wait to make your little rockstar shine! 🎸
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}