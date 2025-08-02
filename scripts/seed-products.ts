import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProducts() {
  console.log('🛍️ Checking and seeding products...')

  // Check if products already exist
  const existingProducts = await prisma.product.count()
  
  if (existingProducts > 0) {
    console.log(`✅ ${existingProducts} products already exist`)
    return
  }

  // Create sample products for print-on-demand
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic Photo Print',
        slug: 'classic-photo-print',
        description: 'High-quality photo print on premium matte paper with rich colors and sharp detail. Perfect for framing your favorite rock star moments.',
        shortDescription: 'Premium photo print on matte paper',
        category: 'prints',
        basePrice: 15,
        active: true,
        featured: true,
        sortOrder: 1,
        sizeOptions: JSON.stringify(['4x6', '5x7', '8x10', '11x14']),
        variants: {
          create: [
            { sku: 'PRINT-4X6', name: '4x6 Classic Print', size: '4x6', price: 15, sortOrder: 1 },
            { sku: 'PRINT-5X7', name: '5x7 Classic Print', size: '5x7', price: 20, sortOrder: 2 },
            { sku: 'PRINT-8X10', name: '8x10 Classic Print', size: '8x10', price: 30, sortOrder: 3 },
            { sku: 'PRINT-11X14', name: '11x14 Classic Print', size: '11x14', price: 45, sortOrder: 4 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gallery Canvas',
        slug: 'gallery-canvas',
        description: 'Museum-quality canvas print stretched on premium wooden frame. Gallery-wrapped and ready to hang. Brings your rock star portrait to life with rich texture and depth.',
        shortDescription: 'Gallery-wrapped canvas ready to hang',
        category: 'canvas',
        basePrice: 60,
        active: true,
        featured: true,
        sortOrder: 2,
        sizeOptions: JSON.stringify(['16x20', '20x30', '24x36']),
        variants: {
          create: [
            { sku: 'CANVAS-16X20', name: '16"×20" Gallery Canvas', size: '16x20', price: 60, sortOrder: 1 },
            { sku: 'CANVAS-20X30', name: '20"×30" Gallery Canvas', size: '20x30', price: 90, sortOrder: 2 },
            { sku: 'CANVAS-24X36', name: '24"×36" Gallery Canvas', size: '24x36', price: 120, sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Metal Print',
        slug: 'metal-print',
        description: 'Stunning aluminum metal print with vibrant colors and incredible durability. Water-resistant and scratch-resistant finish. Modern floating mount included.',
        shortDescription: 'Vibrant aluminum metal print',
        category: 'metal',
        basePrice: 80,
        active: true,
        featured: true,
        sortOrder: 3,
        sizeOptions: JSON.stringify(['12x18', '16x24', '20x30']),
        variants: {
          create: [
            { sku: 'METAL-12X18', name: '12"×18" Metal Print', size: '12x18', price: 80, sortOrder: 1 },
            { sku: 'METAL-16X24', name: '16"×24" Metal Print', size: '16x24', price: 110, sortOrder: 2 },
            { sku: 'METAL-20X30', name: '20"×30" Metal Print', size: '20x30', price: 150, sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Rock Star T-Shirt',
        slug: 'rock-star-tshirt',
        description: 'Premium cotton t-shirt featuring your rock star photo. Soft, comfortable fit with high-quality direct-to-garment printing that won\'t fade or crack.',
        shortDescription: 'Custom photo t-shirt',
        category: 'apparel',
        basePrice: 25,
        active: true,
        featured: false,
        sortOrder: 4,
        sizeOptions: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        colorOptions: JSON.stringify(['black', 'white', 'heather-gray']),
        variants: {
          create: [
            { sku: 'TSHIRT-S-BLACK', name: 'Small Black T-Shirt', size: 'S', color: 'black', price: 25, sortOrder: 1 },
            { sku: 'TSHIRT-M-BLACK', name: 'Medium Black T-Shirt', size: 'M', color: 'black', price: 25, sortOrder: 2 },
            { sku: 'TSHIRT-L-BLACK', name: 'Large Black T-Shirt', size: 'L', color: 'black', price: 25, sortOrder: 3 },
            { sku: 'TSHIRT-XL-BLACK', name: 'X-Large Black T-Shirt', size: 'XL', color: 'black', price: 25, sortOrder: 4 },
            { sku: 'TSHIRT-S-WHITE', name: 'Small White T-Shirt', size: 'S', color: 'white', price: 25, sortOrder: 5 },
            { sku: 'TSHIRT-M-WHITE', name: 'Medium White T-Shirt', size: 'M', color: 'white', price: 25, sortOrder: 6 },
            { sku: 'TSHIRT-L-WHITE', name: 'Large White T-Shirt', size: 'L', color: 'white', price: 25, sortOrder: 7 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Photo Mug',
        slug: 'photo-mug',
        description: 'Ceramic mug featuring your rock star photo. Dishwasher and microwave safe. Perfect for your morning coffee or tea.',
        shortDescription: 'Custom photo ceramic mug',
        category: 'accessories',
        basePrice: 18,
        active: true,
        featured: false,
        sortOrder: 5,
        colorOptions: JSON.stringify(['white', 'black']),
        variants: {
          create: [
            { sku: 'MUG-WHITE', name: 'White Photo Mug', color: 'white', price: 18, sortOrder: 1 },
            { sku: 'MUG-BLACK', name: 'Black Photo Mug', color: 'black', price: 20, sortOrder: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Acrylic Block',
        slug: 'acrylic-block',
        description: 'Luxury acrylic photo block with crystal-clear clarity and depth. Stands alone beautifully on any surface. Modern and sophisticated display.',
        shortDescription: 'Crystal-clear acrylic photo block',
        category: 'prints',
        subcategory: 'luxury',
        basePrice: 50,
        active: true,
        featured: true,
        sortOrder: 6,
        sizeOptions: JSON.stringify(['4x6', '5x7', '8x10']),
        variants: {
          create: [
            { sku: 'ACRYLIC-4X6', name: '4"×6" Acrylic Block', size: '4x6', price: 50, sortOrder: 1 },
            { sku: 'ACRYLIC-5X7', name: '5"×7" Acrylic Block', size: '5x7', price: 65, sortOrder: 2 },
            { sku: 'ACRYLIC-8X10', name: '8"×10" Acrylic Block', size: '8x10', price: 85, sortOrder: 3 },
          ],
        },
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products with variants`)
}

seedProducts()
  .catch((e) => {
    console.error('❌ Product seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })