import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { processImage, getPhotoUrl } from '@/lib/s3'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const uploadCompleteSchema = z.object({
  photoId: z.string().uuid(),
  originalPath: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId, originalPath } = uploadCompleteSchema.parse(body)

    // Get photo record
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        session: true,
      },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Check access permissions
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    const isOwner = photo.session.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For now, we'll skip the actual image processing since we don't have the original buffer
    // In a real implementation, you'd download the file from S3, process it, and upload variants
    
    // Update photo record to mark as uploaded
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: {
        status: 'uploaded',
        processedAt: new Date(),
        thumbnailPath: originalPath, // For now, use original as thumbnail
        largePath: originalPath,     // For now, use original as large
        mediumPath: originalPath,    // For now, use original as medium
        smallPath: originalPath,     // For now, use original as small
      },
    })

    // Get the public URL
    const publicUrl = getPhotoUrl(originalPath)

    return NextResponse.json({
      photo: {
        id: updatedPhoto.id,
        fileName: updatedPhoto.fileName,
        originalUrl: publicUrl,
        thumbnailUrl: publicUrl,
        largeUrl: publicUrl,
        mediumUrl: publicUrl,
        smallUrl: publicUrl,
        status: updatedPhoto.status,
      },
    })
  } catch (error) {
    console.error('Error completing upload:', error)
    
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