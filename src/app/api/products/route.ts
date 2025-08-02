import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
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
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    // Convert Decimal fields to numbers for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
      })),
    }))

    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}