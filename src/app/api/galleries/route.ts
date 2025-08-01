import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import slugify from 'slugify'

const createGallerySchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().min(1).max(100),
  passwordProtected: z.boolean().default(false),
  password: z.string().optional(),
  publicShareEnabled: z.boolean().default(false),
  downloadEnabled: z.boolean().default(true),
  socialShareEnabled: z.boolean().default(true),
  watermarkEnabled: z.boolean().default(true),
  expiryDays: z.number().min(1).max(365).default(90),
})

// Generate unique access code
function generateAccessCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

// Generate unique slug
async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = slugify(baseName, { lower: true, strict: true })
  let counter = 0
  
  while (true) {
    const testSlug = counter === 0 ? slug : `${slug}-${counter}`
    const existing = await prisma.gallery.findUnique({
      where: { slug: testSlug }
    })
    
    if (!existing) {
      return testSlug
    }
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create galleries
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      sessionId,
      name,
      passwordProtected,
      password,
      publicShareEnabled,
      downloadEnabled,
      socialShareEnabled,
      watermarkEnabled,
      expiryDays,
    } = createGallerySchema.parse(body)

    // Verify session exists and is completed
    const photoSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        gallery: true,
      },
    })

    if (!photoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (photoSession.gallery) {
      return NextResponse.json({ error: 'Gallery already exists for this session' }, { status: 400 })
    }

    if (photoSession.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Can only create gallery for completed sessions' 
      }, { status: 400 })
    }

    // Generate unique identifiers
    const accessCode = generateAccessCode()
    const slug = await generateUniqueSlug(name)
    
    // Set expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // Hash password if provided
    let passwordHash = null
    if (passwordProtected && password) {
      const bcrypt = await import('bcryptjs')
      passwordHash = await bcrypt.hash(password, 12)
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: {
        sessionId,
        name,
        slug,
        accessCode,
        passwordHash,
        publicShareEnabled,
        downloadEnabled,
        socialShareEnabled,
        watermarkEnabled,
        expiresAt,
      },
    })

    return NextResponse.json({
      gallery: {
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        accessCode: gallery.accessCode,
        publicShareEnabled: gallery.publicShareEnabled,
        downloadEnabled: gallery.downloadEnabled,
        socialShareEnabled: gallery.socialShareEnabled,
        watermarkEnabled: gallery.watermarkEnabled,
        expiresAt: gallery.expiresAt,
        accessUrl: `/gallery/${gallery.slug}`,
        adminUrl: `/admin/galleries/${gallery.id}`,
      },
    })
  } catch (error) {
    console.error('Error creating gallery:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can list all galleries
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const galleries = await prisma.gallery.findMany({
      include: {
        session: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            package: {
              select: {
                name: true,
              },
            },
          },
        },
        photos: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      galleries: galleries.map(gallery => ({
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        accessCode: gallery.accessCode,
        photoCount: gallery._count.photos,
        viewCount: gallery.viewCount,
        downloadCount: gallery.downloadCount,
        expiresAt: gallery.expiresAt,
        createdAt: gallery.createdAt,
        session: {
          id: gallery.session.id,
          sessionNumber: gallery.session.sessionNumber,
          sessionDate: gallery.session.sessionDate,
          packageName: gallery.session.package.name,
          customer: {
            name: `${gallery.session.user.firstName} ${gallery.session.user.lastName}`,
            email: gallery.session.user.email,
          },
        },
        accessUrl: `/gallery/${gallery.slug}`,
        adminUrl: `/admin/galleries/${gallery.id}`,
      })),
    })
  } catch (error) {
    console.error('Error fetching galleries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}