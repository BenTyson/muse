import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  const { sessionId, paymentPlan } = paymentIntent.metadata

  if (!sessionId) {
    console.error('Missing sessionId in payment intent metadata')
    return
  }

  try {
    // Update payment record
    await prisma.payment.update({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: 'succeeded',
        processedAt: new Date(),
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    })

    // Update payment plan
    const paymentPlanRecord = await prisma.paymentPlan.findFirst({
      where: {
        sessionId: sessionId,
      },
      include: {
        payments: true,
      },
    })

    if (paymentPlanRecord) {
      const succeededPayments = paymentPlanRecord.payments.filter(p => p.status === 'succeeded').length + 1
      const isCompleted = succeededPayments >= (paymentPlanRecord.paymentsTotal || 1)

      await prisma.paymentPlan.update({
        where: {
          id: paymentPlanRecord.id,
        },
        data: {
          paymentsCompleted: succeededPayments,
          paymentsRemaining: Math.max(0, (paymentPlanRecord.paymentsTotal || 1) - succeededPayments),
          status: isCompleted ? 'completed' : 'active',
          nextPaymentDate: isCompleted ? null : calculateNextPaymentDate(),
        },
      })

      // Update session status if payment plan is completed
      if (isCompleted) {
        await prisma.session.update({
          where: {
            id: sessionId,
          },
          data: {
            status: 'confirmed',
            balanceDue: 0,
          },
        })
      } else {
        // Update balance due
        const remainingAmount = (paymentPlanRecord.amountPerPayment || 0) * 
          Math.max(0, (paymentPlanRecord.paymentsTotal || 1) - succeededPayments)
        
        await prisma.session.update({
          where: {
            id: sessionId,
          },
          data: {
            balanceDue: Number(remainingAmount),
          },
        })
      }
    }

    console.log('Payment processing completed successfully')
  } catch (error) {
    console.error('Error processing successful payment:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  try {
    // Update payment record
    const payment = await prisma.payment.update({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        failureCode: paymentIntent.last_payment_error?.code || 'unknown',
      },
    })

    // Update payment plan failure count
    if (payment.paymentPlanId) {
      await prisma.paymentPlan.update({
        where: {
          id: payment.paymentPlanId,
        },
        data: {
          failureCount: {
            increment: 1,
          },
        },
      })
    }

    console.log('Payment failure processing completed')
  } catch (error) {
    console.error('Error processing failed payment:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  // Handle recurring payment success for payment plans
  if (invoice.subscription) {
    // Find payment plan by subscription ID
    const paymentPlan = await prisma.paymentPlan.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription as string,
      },
    })

    if (paymentPlan) {
      // Create payment record for this installment
      await prisma.payment.create({
        data: {
          sessionId: paymentPlan.sessionId,
          paymentPlanId: paymentPlan.id,
          amount: Number(invoice.amount_paid) / 100, // Convert from cents
          paymentType: 'plan_payment',
          status: 'succeeded',
          processedAt: new Date(),
        },
      })

      // Update payment plan
      const newPaymentsCompleted = paymentPlan.paymentsCompleted + 1
      const isCompleted = newPaymentsCompleted >= (paymentPlan.paymentsTotal || 1)

      await prisma.paymentPlan.update({
        where: {
          id: paymentPlan.id,
        },
        data: {
          paymentsCompleted: newPaymentsCompleted,
          paymentsRemaining: Math.max(0, (paymentPlan.paymentsTotal || 1) - newPaymentsCompleted),
          status: isCompleted ? 'completed' : 'active',
        },
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  if (invoice.subscription) {
    const paymentPlan = await prisma.paymentPlan.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription as string,
      },
    })

    if (paymentPlan) {
      await prisma.paymentPlan.update({
        where: {
          id: paymentPlan.id,
        },
        data: {
          failureCount: {
            increment: 1,
          },
        },
      })
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  // Handle subscription creation if needed
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  // Handle subscription updates if needed
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const paymentPlan = await prisma.paymentPlan.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
    },
  })

  if (paymentPlan) {
    await prisma.paymentPlan.update({
      where: {
        id: paymentPlan.id,
      },
      data: {
        status: 'cancelled',
      },
    })
  }
}

function calculateNextPaymentDate(): Date {
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + 1) // 30 days from now
  return nextDate
}