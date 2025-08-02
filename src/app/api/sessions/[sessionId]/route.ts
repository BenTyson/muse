import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL || session.user.email === 'admin@electricmuse.com'
    
    const photoSession = await prisma.session.findUnique({
      where: {
        id: resolvedParams.sessionId,
        ...(isAdmin ? {} : { userId: session.user.id }), // Admin can access all sessions, customers only their own
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
        paymentPlans: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    })

    if (!photoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Convert Decimal fields to numbers for JSON serialization
    const sessionData = {
      ...photoSession,
      totalAmount: Number(photoSession.totalAmount),
      depositAmount: Number(photoSession.depositAmount),
      balanceDue: Number(photoSession.balanceDue),
      package: photoSession.package ? {
        ...photoSession.package,
        basePrice: Number(photoSession.package.basePrice),
      } : null,
      sessionAddons: photoSession.sessionAddons.map(addon => ({
        ...addon,
        unitPrice: Number(addon.unitPrice),
        totalPrice: Number(addon.totalPrice),
        addon: {
          ...addon.addon,
          price: Number(addon.addon.price),
        },
      })),
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}