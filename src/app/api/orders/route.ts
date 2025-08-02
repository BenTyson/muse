import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      items,
      shippingAddress,
      billingAddress,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      notes,
    } = body

    // Generate order number
    const orderNumber = `EM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        status: 'pending',
        subtotal: Number(subtotal),
        taxAmount: Number(taxAmount),
        shippingAmount: Number(shippingAmount),
        totalAmount: Number(totalAmount),
        currency: 'USD',
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            photoId: item.photoId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            customizationData: item.customizationData || null,
            fulfillmentStatus: 'pending',
          })),
        },
      },
      include: {
        items: {
          include: {
            photo: true,
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    // Convert Decimal fields to numbers for JSON serialization
    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      items: order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        productVariant: item.productVariant ? {
          ...item.productVariant,
          price: Number(item.productVariant.price),
          product: item.productVariant.product ? {
            ...item.productVariant.product,
            basePrice: Number(item.productVariant.product.basePrice),
          } : null,
        } : null,
      })),
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL || session.user.email === 'admin@electricmuse.com'

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        items: {
          include: {
            photo: true,
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: isAdmin ? true : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert Decimal fields to numbers for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      items: order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        productVariant: item.productVariant ? {
          ...item.productVariant,
          price: Number(item.productVariant.price),
          product: item.productVariant.product ? {
            ...item.productVariant.product,
            basePrice: Number(item.productVariant.product.basePrice),
          } : null,
        } : null,
      })),
    }))

    return NextResponse.json(serializedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}