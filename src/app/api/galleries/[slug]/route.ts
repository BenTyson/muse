import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getPhotoUrl } from '@/lib/s3'
import { z } from 'zod'

const accessSchema = z.object({
  accessCode: z.string().optional(),
  password: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get gallery by slug
    const gallery = await prisma.gallery.findUnique({
      where: { slug: params.slug },
      include: {
        session: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            package: {
              select: {
                name: true,
              },
            },
            sessionChildren: {
              include: {
                child: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        photos: {
          where: {
            status: 'uploaded',
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check if gallery has expired
    if (gallery.expiresAt && new Date() > gallery.expiresAt) {
      return NextResponse.json({ error: 'Gallery has expired' }, { status: 410 })
    }

    // Return basic gallery info (photos require access verification)
    return NextResponse.json({
      gallery: {
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        requiresPassword: !!gallery.passwordHash,
        publicShareEnabled: gallery.publicShareEnabled,
        downloadEnabled: gallery.downloadEnabled,
        socialShareEnabled: gallery.socialShareEnabled,
        expiresAt: gallery.expiresAt,
        viewCount: gallery.viewCount,
        session: {
          sessionNumber: gallery.session.sessionNumber,
          sessionDate: gallery.session.sessionDate,
          packageName: gallery.session.package.name,
          customerName: `${gallery.session.user.firstName} ${gallery.session.user.lastName}`,
          children: gallery.session.sessionChildren.map(sc => ({
            firstName: sc.child.firstName,
            lastName: sc.child.lastName,
          })),
        },
        photoCount: gallery.photos.length,
      },
    })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { accessCode, password } = accessSchema.parse(body)

    // Get gallery with photos
    const gallery = await prisma.gallery.findUnique({
      where: { slug: params.slug },
      include: {
        session: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            package: {
              select: {
                name: true,
              },
            },
            sessionChildren: {
              include: {
                child: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        photos: {
          where: {
            status: 'uploaded',
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check if gallery has expired
    if (gallery.expiresAt && new Date() > gallery.expiresAt) {
      return NextResponse.json({ error: 'Gallery has expired' }, { status: 410 })
    }

    // Verify access code
    if (gallery.accessCode && accessCode !== gallery.accessCode) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
    }

    // Verify password if required
    if (gallery.passwordHash && password) {
      const bcrypt = await import('bcryptjs')
      const passwordValid = await bcrypt.compare(password, gallery.passwordHash)
      if (!passwordValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    } else if (gallery.passwordHash && !password) {
      return NextResponse.json({ error: 'Password required' }, { status: 401 })
    }

    // Increment view count
    await prisma.gallery.update({
      where: { id: gallery.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    // Return gallery with photos
    const photos = gallery.photos.map(photo => ({
      id: photo.id,
      fileName: photo.fileName,
      originalUrl: getPhotoUrl(photo.originalPath),
      thumbnailUrl: photo.thumbnailPath ? getPhotoUrl(photo.thumbnailPath) : getPhotoUrl(photo.originalPath),
      largeUrl: photo.largePath ? getPhotoUrl(photo.largePath) : getPhotoUrl(photo.originalPath),
      mediumUrl: photo.mediumPath ? getPhotoUrl(photo.mediumPath) : getPhotoUrl(photo.originalPath),
      smallUrl: photo.smallPath ? getPhotoUrl(photo.smallPath) : getPhotoUrl(photo.originalPath),
      createdAt: photo.createdAt,
    }))

    return NextResponse.json({
      gallery: {
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        publicShareEnabled: gallery.publicShareEnabled,
        downloadEnabled: gallery.downloadEnabled,
        socialShareEnabled: gallery.socialShareEnabled,
        watermarkEnabled: gallery.watermarkEnabled,
        expiresAt: gallery.expiresAt,
        session: {
          sessionNumber: gallery.session.sessionNumber,
          sessionDate: gallery.session.sessionDate,
          packageName: gallery.session.package.name,
          customerName: `${gallery.session.user.firstName} ${gallery.session.user.lastName}`,
          children: gallery.session.sessionChildren.map(sc => ({
            firstName: sc.child.firstName,
            lastName: sc.child.lastName,
          })),
        },
        photos,
      },
    })
  } catch (error) {
    console.error('Error accessing gallery:', error)
    
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