import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = bookingSchema.parse(body)
    
    // Get package details
    const packageData = await prisma.package.findUnique({
      where: { id: validatedData.packageId },
      include: { addons: true },
    })
    
    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Check if children count is within package limits
    if (validatedData.children.length > packageData.maxChildren) {
      return NextResponse.json(
        { error: `Package allows maximum ${packageData.maxChildren} children` },
        { status: 400 }
      )
    }

    // Parse date and time
    const sessionDateTime = new Date(`${validatedData.sessionDate}T${validatedData.sessionTime}:00`)
    
    // Check availability
    const conflictingSessions = await prisma.session.findMany({
      where: {
        sessionDate: {
          gte: new Date(validatedData.sessionDate),
          lt: new Date(new Date(validatedData.sessionDate).getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['booked', 'confirmed', 'in_progress'],
        },
      },
    })

    // Simple conflict check (this could be more sophisticated)
    const hasConflict = conflictingSessions.some(existing => {
      const existingTime = new Date(existing.sessionTime).getTime()
      const newTime = sessionDateTime.getTime()
      const timeDiff = Math.abs(existingTime - newTime) / (1000 * 60) // minutes
      return timeDiff < (packageData.durationMinutes + 30) // 30 min buffer
    })

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 400 }
      )
    }

    // Calculate pricing
    let totalAmount = packageData.basePrice
    const selectedAddons = packageData.addons.filter(addon => 
      validatedData.selectedAddons?.includes(addon.id)
    )
    selectedAddons.forEach(addon => {
      totalAmount += addon.price
    })

    // Calculate deposit (30% as per settings)
    const depositAmount = Math.round(totalAmount * 0.3 * 100) / 100
    const balanceDue = totalAmount - depositAmount

    // Generate session number
    const sessionCount = await prisma.session.count()
    const sessionNumber = `EM${new Date().getFullYear()}${String(sessionCount + 1).padStart(4, '0')}`

    // Create session in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or get children
      const childRecords = await Promise.all(
        validatedData.children.map(async (childData) => {
          // Check if child already exists for this user
          const existingChild = await tx.child.findFirst({
            where: {
              parentId: session.user.id,
              firstName: childData.firstName,
              lastName: childData.lastName,
            },
          })

          if (existingChild) {
            // Update existing child
            return tx.child.update({
              where: { id: existingChild.id },
              data: {
                birthDate: childData.birthDate ? new Date(childData.birthDate) : null,
                preferredStyle: childData.preferredStyle,
                musicPreferences: childData.musicPreferences,
                styleNotes: childData.styleNotes,
                specialRequirements: childData.specialRequirements,
              },
            })
          } else {
            // Create new child
            return tx.child.create({
              data: {
                parentId: session.user.id,
                firstName: childData.firstName,
                lastName: childData.lastName,
                birthDate: childData.birthDate ? new Date(childData.birthDate) : null,
                preferredStyle: childData.preferredStyle,
                musicPreferences: childData.musicPreferences,
                styleNotes: childData.styleNotes,
                specialRequirements: childData.specialRequirements,
              },
            })
          }
        })
      )

      // Create session
      const newSession = await tx.session.create({
        data: {
          userId: session.user.id,
          packageId: validatedData.packageId,
          sessionNumber,
          sessionDate: new Date(validatedData.sessionDate),
          sessionTime: sessionDateTime,
          estimatedDuration: packageData.durationMinutes,
          status: 'booked',
          totalAmount,
          depositAmount,
          balanceDue,
          specialRequests: validatedData.specialRequests,
        },
      })

      // Link children to session
      await Promise.all(
        childRecords.map((child, index) =>
          tx.sessionChild.create({
            data: {
              sessionId: newSession.id,
              childId: child.id,
              primaryChild: index === 0, // First child is primary
            },
          })
        )
      )

      // Add selected addons
      if (selectedAddons.length > 0) {
        await Promise.all(
          selectedAddons.map(addon =>
            tx.sessionAddon.create({
              data: {
                sessionId: newSession.id,
                addonId: addon.id,
                quantity: 1,
                unitPrice: addon.price,
                totalPrice: addon.price,
              },
            })
          )
        )
      }

      return newSession
    })

    return NextResponse.json({
      success: true,
      sessionId: result.id,
      sessionNumber: result.sessionNumber,
      totalAmount,
      depositAmount,
      balanceDue,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's sessions
    const sessions = await prisma.session.findMany({
      where: {
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
      orderBy: {
        sessionDate: 'desc',
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}