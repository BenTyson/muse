import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    
    const product = await prisma.product.findUnique({
      where: {
        slug: resolvedParams.slug,
        active: true,
      },
      include: {
        variants: {
          where: {
            active: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Convert Decimal fields to numbers for JSON serialization
    const serializedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
      })),
    }

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}