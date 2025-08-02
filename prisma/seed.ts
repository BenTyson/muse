import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@electricmuse.com' },
    update: {},
    create: {
      email: 'admin@electricmuse.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '555-0100',
      emailVerified: true,
      marketingConsent: true,
    },
  })
  console.log('✅ Admin user ready:', adminUser.email)

  // Create test customer user
  const customerPassword = await bcrypt.hash('password123', 12)
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '555-0200',
      emailVerified: true,
      marketingConsent: false,
    },
  })
  console.log('✅ Test customer user ready:', customerUser.email)

  // Create sample packages
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: 'Rock Star Starter',
        slug: 'rock-star-starter',
        description: 'Perfect for first-time rock stars! This package includes professional styling, a 30-minute photo session, and your choice of 5 edited digital photos.',
        shortDescription: 'Entry-level rock star transformation',
        basePrice: 199,
        durationMinutes: 30,
        maxChildren: 1,
        includesStyling: true,
        maxOutfitChanges: 1,
        includedPhotos: 5,
        photoEditingLevel: 'basic',
        includesPrint: true,
        printSize: '5x7',
        active: true,
        sortOrder: 1,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Punk Rock Premium',
        slug: 'punk-rock-premium',
        description: 'Go all out with our premium punk experience! Includes 60 minutes of shooting time, 2 outfit changes, professional hair and makeup styling, and 15 professionally edited photos.',
        shortDescription: 'Full punk rock transformation experience',
        basePrice: 399,
        durationMinutes: 60,
        maxChildren: 2,
        includesStyling: true,
        maxOutfitChanges: 2,
        includedPhotos: 15,
        photoEditingLevel: 'standard',
        includesPrint: true,
        printSize: '8x10',
        active: true,
        sortOrder: 2,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Band Experience',
        slug: 'band-experience',
        description: 'Bring the whole crew! Perfect for siblings or friends who want to rock together. 90 minutes of shooting, multiple location setups, and 25 edited photos of your band.',
        shortDescription: 'Group session for aspiring bands',
        basePrice: 599,
        durationMinutes: 90,
        maxChildren: 4,
        includesStyling: true,
        maxOutfitChanges: 2,
        includedPhotos: 25,
        photoEditingLevel: 'premium',
        includesPrint: true,
        printSize: '11x14',
        active: true,
        sortOrder: 3,
      },
    }),
  ])
  console.log(`✅ Created ${packages.length} packages`)

  // Create sample products for print-on-demand
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic Photo Print',
        slug: 'classic-photo-print',
        description: 'High-quality photo print on premium paper',
        shortDescription: 'Premium photo print',
        category: 'prints',
        basePrice: 15,
        active: true,
        featured: true,
        sortOrder: 1,
        sizeOptions: JSON.stringify(['4x6', '5x7', '8x10', '11x14']),
        variants: {
          create: [
            { sku: 'PRINT-4X6', name: '4x6 Print', size: '4x6', price: 15 },
            { sku: 'PRINT-5X7', name: '5x7 Print', size: '5x7', price: 20 },
            { sku: 'PRINT-8X10', name: '8x10 Print', size: '8x10', price: 30 },
            { sku: 'PRINT-11X14', name: '11x14 Print', size: '11x14', price: 45 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Canvas Wall Art',
        slug: 'canvas-wall-art',
        description: 'Gallery-wrapped canvas print ready to hang',
        shortDescription: 'Canvas print ready to hang',
        category: 'canvas',
        basePrice: 60,
        active: true,
        featured: true,
        sortOrder: 2,
        sizeOptions: JSON.stringify(['16x20', '20x30', '24x36']),
        variants: {
          create: [
            { sku: 'CANVAS-16X20', name: '16x20 Canvas', size: '16x20', price: 60 },
            { sku: 'CANVAS-20X30', name: '20x30 Canvas', size: '20x30', price: 90 },
            { sku: 'CANVAS-24X36', name: '24x36 Canvas', size: '24x36', price: 120 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Rock Star T-Shirt',
        slug: 'rock-star-tshirt',
        description: 'Custom t-shirt with your rock star photo',
        shortDescription: 'Custom photo t-shirt',
        category: 'apparel',
        basePrice: 25,
        active: true,
        sortOrder: 3,
        sizeOptions: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colorOptions: JSON.stringify(['black', 'white', 'gray']),
        variants: {
          create: [
            { sku: 'TSHIRT-S-BLACK', name: 'Small Black T-Shirt', size: 'S', color: 'black', price: 25 },
            { sku: 'TSHIRT-M-BLACK', name: 'Medium Black T-Shirt', size: 'M', color: 'black', price: 25 },
            { sku: 'TSHIRT-L-BLACK', name: 'Large Black T-Shirt', size: 'L', color: 'black', price: 25 },
          ],
        },
      },
    }),
  ])
  console.log(`✅ Created ${products.length} products with variants`)

  // Create some sample settings
  await prisma.setting.createMany({
    data: [
      {
        category: 'booking',
        key: 'advance_booking_days',
        value: '90',
        valueType: 'number',
        description: 'How many days in advance customers can book',
        isPublic: true,
      },
      {
        category: 'booking',
        key: 'min_booking_notice_hours',
        value: '48',
        valueType: 'number',
        description: 'Minimum hours notice required for booking',
        isPublic: true,
      },
      {
        category: 'gallery',
        key: 'default_expiry_days',
        value: '90',
        valueType: 'number',
        description: 'Default number of days before gallery expires',
        isPublic: false,
      },
      {
        category: 'payment',
        key: 'deposit_percentage',
        value: '30',
        valueType: 'number',
        description: 'Percentage of total required as deposit',
        isPublic: true,
      },
    ],
  })
  console.log('✅ Created application settings')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })