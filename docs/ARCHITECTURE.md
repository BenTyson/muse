# Electric Muse - Technical Architecture

## Tech Stack Overview

### Core Framework
- **Next.js 14** with App Router for SSR, SEO, and performance
- **TypeScript** for type safety across the entire application
- **Tailwind CSS** with custom design system for rapid UI development
- **React Hook Form** with Zod validation for all forms

### Database & Storage
- **PostgreSQL** as primary database with JSONB for flexible metadata
- **Prisma ORM** for type-safe database operations and migrations
- **AWS S3** for photo storage with CloudFront CDN
- **Redis** (optional) for session storage and caching

### Authentication & Security
- **NextAuth.js** with database sessions and OAuth providers
- **bcryptjs** for password hashing
- **Zod** for input validation and sanitization
- **CSRF protection** and rate limiting on all endpoints

### Payment Processing
- **Stripe** for payments, subscriptions, and webhooks
- **Payment plans** via Stripe subscriptions with automated billing
- **PCI compliance** through Stripe Elements (no card data stored)

### File Processing & Media
- **Sharp** for image processing, thumbnails, and optimization
- **AWS S3** with presigned URLs for secure uploads
- **CloudFront** for global CDN and fast image delivery
- **Watermarking** for gallery preview images

### Third-Party Integrations
- **Printful & Gooten** APIs for print-on-demand fulfillment
- **SendGrid** for transactional emails
- **Twilio** (optional) for SMS notifications

### Monitoring & Analytics
- **Sentry** for error tracking and performance monitoring
- **Vercel Analytics** for web vitals and user behavior
- **Custom analytics** for business metrics tracking

## Database Schema

### Core Tables Structure

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Children profiles
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  preferred_style TEXT, -- rock, punk, metal, alternative
  music_preferences TEXT,
  style_notes TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Photography packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(255),
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_children INTEGER DEFAULT 1,
  includes_styling BOOLEAN DEFAULT TRUE,
  max_outfit_changes INTEGER DEFAULT 1,
  included_photos INTEGER DEFAULT 5,
  photo_editing_level VARCHAR(50), -- basic, standard, premium
  includes_print BOOLEAN DEFAULT TRUE,
  print_size VARCHAR(20), -- 4x6, 5x7, 8x10
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Photography sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  session_number VARCHAR(50) UNIQUE NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  estimated_duration INTEGER,
  status VARCHAR(50) DEFAULT 'booked', -- booked, confirmed, in_progress, completed, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  balance_due DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  preparation_notes TEXT,
  styling_notes TEXT,
  photographer_notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

-- Session-child relationships
CREATE TABLE session_children (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  primary_child BOOLEAN DEFAULT FALSE,
  styling_requests TEXT,
  completed_styling BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (session_id, child_id)
);

-- Payment plans for sessions
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  plan_type VARCHAR(20) NOT NULL, -- full, 2_pay, 3_pay, 4_pay
  total_amount DECIMAL(10,2) NOT NULL,
  amount_per_payment DECIMAL(10,2),
  payments_total INTEGER,
  payments_completed INTEGER DEFAULT 0,
  payments_remaining INTEGER,
  next_payment_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, failed, cancelled
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual payment transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  order_id UUID REFERENCES orders(id),
  payment_plan_id UUID REFERENCES payment_plans(id),
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- deposit, balance, plan_payment, product_purchase
  payment_method VARCHAR(50), -- card, bank_transfer
  status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed, refunded
  failure_reason TEXT,
  failure_code VARCHAR(100),
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Photo galleries
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  access_code VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  public_share_enabled BOOLEAN DEFAULT FALSE,
  download_enabled BOOLEAN DEFAULT TRUE,
  social_share_enabled BOOLEAN DEFAULT TRUE,
  watermark_enabled BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  alt_text VARCHAR(255),
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  mime_type VARCHAR(100),
  s3_key VARCHAR(500) NOT NULL,
  s3_thumbnail_key VARCHAR(500),
  s3_watermark_key VARCHAR(500),
  editing_status VARCHAR(50) DEFAULT 'raw', -- raw, editing, edited, approved
  is_complimentary BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  photographer_notes TEXT,
  editing_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Print products catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(255),
  category VARCHAR(100) NOT NULL, -- prints, canvas, metal, apparel, accessories
  subcategory VARCHAR(100),
  base_price DECIMAL(10,2) NOT NULL,
  printful_product_id VARCHAR(100),
  gooten_product_id VARCHAR(100),
  product_image VARCHAR(500),
  size_options JSONB,
  material_options JSONB,
  color_options JSONB,
  customization_options JSONB,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product variants (size/material combinations)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  material VARCHAR(50),
  color VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  printful_variant_id VARCHAR(100),
  gooten_variant_id VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Customer orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, printed, shipped, delivered
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  stripe_payment_intent_id VARCHAR(255),
  tracking_numbers JSONB,
  estimated_delivery DATE,
  delivered_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  customization_data JSONB,
  printful_order_id VARCHAR(255),
  gooten_order_id VARCHAR(255),
  fulfillment_status VARCHAR(50) DEFAULT 'pending',
  fulfillment_provider VARCHAR(50), -- printful, gooten
  tracking_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Critical Indexes
```sql
-- Performance-critical indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_user_date ON sessions(user_id, session_date) WHERE status != 'cancelled';
CREATE INDEX idx_sessions_date_status ON sessions(session_date, status);
CREATE INDEX idx_galleries_access_code ON galleries(access_code) WHERE access_code IS NOT NULL;
CREATE INDEX idx_photos_gallery_order ON photos(gallery_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payment_plans_next_payment ON payment_plans(next_payment_date) WHERE status = 'active';
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_order_items_fulfillment ON order_items(fulfillment_status, created_at);
```

## API Structure

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Session Management
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session booking
- `GET /api/sessions/[id]` - Get session details
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Cancel session
- `GET /api/sessions/availability` - Check date/time availability

### Payment Processing
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/plans` - Create payment plan
- `GET /api/payments/plans/[id]` - Get payment plan details
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Gallery & Photos
- `GET /api/galleries/[slug]` - Access gallery by slug
- `POST /api/galleries/[id]/access` - Verify gallery access
- `GET /api/photos/[id]` - Get photo details
- `GET /api/photos/[id]/download` - Download photo
- `POST /api/photos/[id]/favorite` - Toggle photo favorite

### E-commerce
- `GET /api/products` - List products
- `GET /api/products/[slug]` - Get product details
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart contents
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details

### Admin Endpoints
- `POST /api/admin/photos/upload` - Upload photos
- `PUT /api/admin/photos/[id]` - Update photo
- `GET /api/admin/sessions` - List all sessions
- `PUT /api/admin/sessions/[id]` - Update session status
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/[id]` - Update order status

## Security Implementation

### Child Photo Protection (CRITICAL)
```typescript
// Gallery access verification
export async function verifyGalleryAccess(galleryId: string, accessCode: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: { session: { include: { user: true } } }
  })
  
  if (!gallery || gallery.access_code !== accessCode) {
    throw new Error('Invalid access code')
  }
  
  if (gallery.expires_at && gallery.expires_at < new Date()) {
    throw new Error('Gallery access has expired')
  }
  
  return gallery
}

// Photo download with access control
export async function generatePhotoDownloadUrl(photoId: string, sessionToken: string) {
  // Verify session has access to this photo
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { gallery: { include: { session: true } } }
  })
  
  if (!photo) throw new Error('Photo not found')
  
  // Generate time-limited presigned URL
  const presignedUrl = await s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: photo.s3_key,
    Expires: 300 // 5 minutes
  })
  
  return presignedUrl
}
```

### Payment Security
```typescript
// Stripe webhook verification
export async function verifyStripeWebhook(body: string, signature: string) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    return event
  } catch (err) {
    throw new Error('Webhook signature verification failed')
  }
}

// Payment plan processing with retry logic
export async function processPaymentPlan(planId: string) {
  const plan = await prisma.paymentPlan.findUnique({ where: { id: planId } })
  
  if (!plan || plan.status !== 'active') return
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.amount_per_payment * 100),
      currency: 'usd',
      customer: plan.stripe_customer_id,
      payment_method: plan.default_payment_method,
      confirmation_method: 'automatic',
      confirm: true
    })
    
    // Update payment plan on success
    await prisma.paymentPlan.update({
      where: { id: planId },
      data: {
        payments_completed: plan.payments_completed + 1,
        payments_remaining: plan.payments_remaining - 1,
        next_payment_date: calculateNextPaymentDate(plan.plan_type),
        failure_count: 0
      }
    })
    
  } catch (error) {
    // Handle payment failure with grace period
    await handlePaymentFailure(planId, error)
  }
}
```

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── admin/             # Admin dashboard
│   ├── gallery/           # Gallery pages
│   ├── booking/           # Booking flow
│   ├── shop/              # E-commerce
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── gallery/          # Gallery components
│   └── admin/            # Admin components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Auth configuration
│   ├── stripe.ts         # Stripe client
│   ├── s3.ts             # AWS S3 client
│   ├── email.ts          # SendGrid client
│   └── validations.ts    # Zod schemas
├── types/                # TypeScript types
├── hooks/                # Custom React hooks
└── utils/                # Utility functions

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding

public/
├── images/              # Static images
└── icons/               # Icons and logos
```

## Performance Considerations

### Image Optimization Pipeline
1. **Upload**: Original high-resolution images to S3
2. **Processing**: Generate thumbnails, watermarked versions
3. **CDN**: Serve optimized images via CloudFront
4. **Lazy Loading**: Load images as user scrolls
5. **Progressive Enhancement**: Show thumbnails first, full-res on demand

### Database Optimization
- **Connection Pooling**: Configure Prisma connection pool
- **Query Optimization**: Use proper indexes and limit queries
- **Read Replicas**: For analytics and reporting queries
- **Caching**: Redis for session data and frequently accessed content

### API Performance
- **Response Caching**: Cache static API responses
- **Pagination**: Limit large dataset queries
- **Background Jobs**: Process heavy operations asynchronously
- **Rate Limiting**: Prevent API abuse

## Third-Party Integration Details

### Stripe Configuration
- **Payment Intents** for one-time payments
- **Subscriptions** for payment plans
- **Webhooks** for real-time payment status updates
- **Customer Portal** for payment method management

### AWS S3 Setup
- **Bucket Policies** for controlled public access
- **CORS Configuration** for web uploads
- **Lifecycle Policies** for storage optimization
- **CloudFront Distribution** for global CDN

### Print-on-Demand APIs
- **Printful**: Primary POD provider with comprehensive catalog
- **Gooten**: Secondary provider for redundancy
- **Webhook Integration** for order status updates
- **Product Sync** for catalog management