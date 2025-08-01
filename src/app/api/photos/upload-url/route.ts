import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateUploadUrl, generatePhotoPath, getFileExtension } from '@/lib/s3'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const uploadUrlSchema = z.object({
  sessionId: z.string().uuid(),
  fileName: z.string(),
  contentType: z.string(),
  fileSize: z.number().max(50 * 1024 * 1024), // 50MB max
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, fileName, contentType, fileSize } = uploadUrlSchema.parse(body)

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 })
    }

    // Check if user has access to this session (admin or session owner)
    const photoSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })

    if (!photoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Allow access if user owns the session or is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    const isOwner = photoSession.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate unique path for the photo
    const extension = getFileExtension(contentType)
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const photoPath = generatePhotoPath(sessionId, `${cleanFileName}.${extension}`)

    // Generate presigned upload URL
    const uploadUrl = await generateUploadUrl(photoPath, contentType, 3600) // 1 hour expiry

    // Create photo record in database (pending until upload completes)
    const photo = await prisma.photo.create({
      data: {
        sessionId,
        fileName: cleanFileName,
        originalPath: photoPath,
        fileSize,
        contentType,
        status: 'uploading',
        uploadedBy: session.user.id,
      },
    })

    return NextResponse.json({
      uploadUrl,
      photoId: photo.id,
      photoPath,
    })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    
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