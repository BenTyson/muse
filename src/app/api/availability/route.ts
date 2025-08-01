import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, addHours, format, parse, isAfter, isBefore } from 'date-fns'

// Studio operating hours (10 AM to 6 PM)
const STUDIO_HOURS = {
  start: 10, // 10 AM
  end: 18,   // 6 PM
}

// Buffer time between sessions (30 minutes)
const BUFFER_MINUTES = 30

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateStr = searchParams.get('date')
  const durationStr = searchParams.get('duration')

  if (!dateStr) {
    return NextResponse.json(
      { error: 'Date parameter is required' },
      { status: 400 }
    )
  }

  const duration = durationStr ? parseInt(durationStr) : 60 // Default 60 minutes

  try {
    const date = new Date(dateStr)
    const startOfSelectedDay = startOfDay(date)
    const endOfSelectedDay = endOfDay(date)

    // Get all existing sessions for the selected date
    const existingSessions = await prisma.session.findMany({
      where: {
        sessionDate: {
          gte: startOfSelectedDay,
          lt: endOfSelectedDay,
        },
        status: {
          in: ['booked', 'confirmed', 'in_progress'],
        },
      },
      select: {
        sessionTime: true,
        estimatedDuration: true,
        package: {
          select: {
            durationMinutes: true,
          },
        },
      },
    })

    // Generate all possible time slots for the day
    const availableSlots: string[] = []
    const sessionDurationWithBuffer = duration + BUFFER_MINUTES

    for (let hour = STUDIO_HOURS.start; hour < STUDIO_HOURS.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
        const slotTime = new Date(date)
        slotTime.setHours(hour, minute, 0, 0)
        
        // Check if this slot + duration + buffer fits within studio hours
        const slotEndTime = new Date(slotTime.getTime() + sessionDurationWithBuffer * 60000)
        if (slotEndTime.getHours() > STUDIO_HOURS.end) {
          continue
        }

        // Check if this slot conflicts with existing sessions
        let isAvailable = true
        for (const existingSession of existingSessions) {
          const existingStart = new Date(existingSession.sessionTime)
          const existingDuration = existingSession.estimatedDuration || existingSession.package.durationMinutes
          const existingEnd = new Date(existingStart.getTime() + (existingDuration + BUFFER_MINUTES) * 60000)
          
          const slotStart = slotTime
          const slotEnd = new Date(slotTime.getTime() + sessionDurationWithBuffer * 60000)
          
          // Check for overlap
          if (
            (slotStart >= existingStart && slotStart < existingEnd) ||
            (slotEnd > existingStart && slotEnd <= existingEnd) ||
            (slotStart <= existingStart && slotEnd >= existingEnd)
          ) {
            isAvailable = false
            break
          }
        }

        if (isAvailable) {
          availableSlots.push(format(slotTime, 'HH:mm'))
        }
      }
    }

    return NextResponse.json({
      date: dateStr,
      availableSlots,
      studioHours: STUDIO_HOURS,
    })
  } catch (error) {
    console.error('Failed to check availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}