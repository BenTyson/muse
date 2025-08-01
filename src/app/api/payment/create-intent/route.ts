import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe, calculatePaymentAmounts, PaymentPlanId } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createIntentSchema = z.object({
  sessionId: z.string().uuid(),
  paymentPlan: z.enum(['full', 'two_pay', 'three_pay', 'four_pay']),
  amount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, paymentPlan, amount } = createIntentSchema.parse(body)

    // Verify the session belongs to the user and get details
    const photoSession = await prisma.session.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        package: true,
        sessionChildren: {
          include: {
            child: true,
          },
        },
        sessionAddons: {
          include: {
            addon: true,
          },
        },
      },
    })

    if (!photoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate payment amounts based on selected plan
    const paymentAmounts = calculatePaymentAmounts(amount, paymentPlan as PaymentPlanId)
    const installmentCount = paymentPlan === 'full' ? 1 : parseInt(paymentPlan.charAt(0))

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmounts.installmentAmount * 100), // Convert to cents
      currency: 'usd',
      customer: session.user.email || undefined,
      metadata: {
        sessionId: photoSession.id,
        sessionNumber: photoSession.sessionNumber,
        paymentPlan,
        totalAmount: amount.toString(),
        discountedTotal: paymentAmounts.discountedTotal.toString(),
        installmentNumber: '1',
        userId: session.user.id,
      },
      description: `Electric Muse Photo Session - ${photoSession.package.name} - Session #${photoSession.sessionNumber}`,
      receipt_email: session.user.email || undefined,
    })

    // Create payment plan record in database
    const paymentPlanRecord = await prisma.paymentPlan.create({
      data: {
        sessionId: photoSession.id,
        planType: paymentPlan,
        totalAmount: amount,
        amountPerPayment: paymentAmounts.installmentAmount,
        paymentsTotal: installmentCount,
        paymentsRemaining: installmentCount,
        nextPaymentDate: new Date(), // First payment is immediate
        status: 'active',
      },
    })

    // Create the first payment record
    await prisma.payment.create({
      data: {
        sessionId: photoSession.id,
        paymentPlanId: paymentPlanRecord.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentAmounts.installmentAmount,
        paymentType: 'plan_payment',
        status: 'pending',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentPlanId: paymentPlanRecord.id,
      amount: paymentAmounts.installmentAmount,
      savings: paymentAmounts.savings,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}