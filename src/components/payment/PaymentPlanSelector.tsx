'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentPlanId, PAYMENT_PLANS, calculatePaymentAmounts } from '@/lib/stripe'

interface PaymentPlanSelectorProps {
  totalAmount: number
  onPlanSelected: (planId: PaymentPlanId) => void
  selectedPlan?: PaymentPlanId
}

export default function PaymentPlanSelector({ 
  totalAmount, 
  onPlanSelected, 
  selectedPlan 
}: PaymentPlanSelectorProps) {
  const [hoveredPlan, setHoveredPlan] = useState<PaymentPlanId | null>(null)

  const planIds = Object.keys(PAYMENT_PLANS) as PaymentPlanId[]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Payment Plan</h3>
        <p className="text-gray-600">
          Select how you'd like to pay for your rock star photo session
        </p>
      </div>

      <div className="grid gap-4">
        {planIds.map((planId) => {
          const plan = PAYMENT_PLANS[planId]
          const amounts = calculatePaymentAmounts(totalAmount, planId)
          const isSelected = selectedPlan === planId
          const isHovered = hoveredPlan === planId
          const isPopular = planId === 'two_pay' // Highlight 2-pay as popular option

          return (
            <div
              key={planId}
              className={`
                relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-red-500 bg-red-50 shadow-md' 
                  : isHovered
                    ? 'border-red-300 bg-red-25 shadow-sm'
                    : 'border-gray-200 bg-white hover:shadow-sm'
                }
              `}
              onMouseEnter={() => setHoveredPlan(planId)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => onPlanSelected(planId)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`
                      w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                      ${isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {plan.installments === 1 ? 'Total Payment:' : 'Per Payment:'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${amounts.installmentAmount.toFixed(2)}
                      </span>
                    </div>
                    
                    {plan.installments > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total after discount:</span>
                        <span className="font-semibold text-gray-900">
                          ${amounts.discountedTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {amounts.savings > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">You save:</span>
                        <span className="font-semibold text-green-600">
                          ${amounts.savings.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  {plan.installments > 1 && (
                    <div className="text-2xl font-bold text-gray-900">
                      {plan.installments}x
                    </div>
                  )}
                  {amounts.savings > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Save {(plan.discount * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {plan.installments > 1 && (
                <div className="mt-4 text-xs text-gray-500 border-t pt-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Automatic payments every 30 days. No interest or fees.
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Payment Information:</p>
            <ul className="space-y-1">
              <li>• All payments are securely processed by Stripe</li>
              <li>• Payment plans have no interest or hidden fees</li>
              <li>• You can pay off your balance early at any time</li>
              <li>• Session can be scheduled after first payment is made</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}