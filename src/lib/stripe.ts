import { loadStripe, Stripe } from '@stripe/stripe-js'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

// Client-side Stripe
let stripePromise: Promise<Stripe | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Payment plan configurations
export const PAYMENT_PLANS = {
  full: {
    id: 'full',
    name: 'Pay in Full',
    description: 'Pay the entire amount upfront',
    discount: 0.10, // 10% discount for paying in full
    installments: 1,
  },
  two_pay: {
    id: 'two_pay',
    name: '2-Payment Plan',
    description: 'Split into 2 equal payments',
    discount: 0.05, // 5% discount
    installments: 2,
  },
  three_pay: {
    id: 'three_pay',
    name: '3-Payment Plan',
    description: 'Split into 3 equal payments',
    discount: 0.00, // No discount
    installments: 3,
  },
  four_pay: {
    id: 'four_pay',
    name: '4-Payment Plan',
    description: 'Split into 4 equal payments',
    discount: 0.00, // No discount
    installments: 4,
  },
} as const

export type PaymentPlanId = keyof typeof PAYMENT_PLANS

// Helper function to calculate payment amounts
export function calculatePaymentAmounts(
  totalAmount: number,
  planId: PaymentPlanId
): {
  discountedTotal: number
  installmentAmount: number
  savings: number
} {
  const plan = PAYMENT_PLANS[planId]
  const savings = totalAmount * plan.discount
  const discountedTotal = totalAmount - savings
  const installmentAmount = Math.round((discountedTotal / plan.installments) * 100) / 100

  return {
    discountedTotal,
    installmentAmount,
    savings,
  }
}

// Stripe test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_AUTH: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
} as const