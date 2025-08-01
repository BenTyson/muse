# Electric Muse - Development Guide for Claude

## 🚀 Current Status

### ✅ Phase 1: Foundation (COMPLETED)
- Next.js 14 project with TypeScript and Tailwind CSS
- PostgreSQL database with complete schema
- NextAuth.js authentication with registration/login
- Database seeded with sample packages and admin user
- All core dependencies installed and configured

### ✅ Phase 2: Core Booking System (COMPLETED)
- Package management with API endpoints
- Interactive calendar with availability checking
- Multi-step booking form (package → date/time → child info)
- Session creation with child profile management
- Customer dashboard with session overview
- Complete booking workflow functional

### ✅ Phase 3: Payment Processing (COMPLETED)
- Stripe integration with test keys configured
- Payment intent API with payment plan support
- Checkout form with Stripe Elements
- Payment plan selection UI (full, 2-pay, 3-pay, 4-pay)
- Stripe webhook endpoint with signature verification
- Complete payment workflow from booking to confirmation

### 🔄 Next: Phase 4 Photo Gallery System
- AWS S3 integration for secure photo storage
- Gallery creation and access control
- Photo upload and management interface

### 🎯 Current Working Features
- User registration and authentication
- Package browsing and selection
- Complete session booking flow
- Customer dashboard with session management
- Real-time availability checking
- Child profile management
- Payment processing with Stripe integration
- Payment plan selection (full payment with 10% discount, 2-pay, 3-pay, 4-pay)
- Secure checkout with Stripe Elements
- Webhook handling for payment confirmations
- Responsive rock/punk themed design

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/electric_muse"
DATABASE_POOL_SIZE=20

# Authentication
NEXTAUTH_SECRET="your-super-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="electric-muse-photos"
AWS_CLOUDFRONT_DOMAIN="your-cloudfront-domain.cloudfront.net"

# Email
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@electricmuse.com"

# SMS (Optional)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Print-on-Demand
PRINTFUL_API_KEY="your-printful-api-key"
GOOTEN_API_KEY="your-gooten-api-key"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@electricmuse.com"
SESSION_TIMEOUT=3600
GALLERY_EXPIRY_DAYS=90
```

## Development Commands

### Project Setup
```bash
# Initialize project
npm create next-app@latest electric-muse --typescript --tailwind --eslint --app --src-dir
cd electric-muse

# Install dependencies
npm install prisma @prisma/client
npm install @next-auth/prisma-adapter next-auth
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install @sendgrid/mail
npm install bcryptjs zod
npm install @headlessui/react lucide-react framer-motion
npm install date-fns lodash slugify
npm install sharp

# Dev dependencies
npm install -D @types/bcryptjs @types/lodash
npm install -D husky lint-staged prettier
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright
```

### Database Commands
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx tsx prisma/seed.ts
```

### Development Server
```bash
# Start development server
npm run dev

# Start with debugging
NODE_OPTIONS='--inspect' npm run dev

# Start on different port
PORT=3001 npm run dev
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific test file
npm test -- gallery.test.ts
```

### Build & Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze

# Type check without building
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Debugging
```bash
# Check database connection
npx prisma db push --accept-data-loss

# View current migrations
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only

# Apply pending migrations
npx prisma migrate deploy
```

## Common Development Tasks

### Adding a New Database Table
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_table_name`
3. Run `npx prisma generate`
4. Update TypeScript types if needed

### Setting up Stripe Webhooks (Development)
```bash
# Install Stripe CLI
# Download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook signing secret to .env.local
```

### AWS S3 Bucket Setup
```bash
# Create bucket (replace with your bucket name)
aws s3 mb s3://electric-muse-photos

# Set bucket policy for public read access to specific prefixes
aws s3api put-bucket-policy --bucket electric-muse-photos --policy file://bucket-policy.json

# Enable CORS
aws s3api put-bucket-cors --bucket electric-muse-photos --cors-configuration file://cors-config.json
```

### Photo Upload Testing
```bash
# Test image processing
node scripts/test-image-processing.js

# Test S3 upload
node scripts/test-s3-upload.js

# Verify CloudFront distribution
curl -I https://your-domain.cloudfront.net/test-image.jpg
```

## Debugging & Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset connection pool
npx prisma migrate reset
npx prisma generate
```

**Stripe Integration Issues:**
```bash
# Test webhook endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

**Image Upload Issues:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Test S3 permissions
aws s3 ls s3://your-bucket-name
```

**Performance Issues:**
```bash
# Analyze bundle
npm run analyze

# Check database queries
npx prisma studio
```

### Development Workflow
1. **Start development server**: `npm run dev`
2. **Run database migrations**: `npx prisma migrate dev`
3. **Seed data**: `npx tsx prisma/seed.ts`
4. **Run tests**: `npm test`
5. **Check types**: `npm run type-check`
6. **Lint and format**: `npm run lint:fix && npm run format`

## Testing Current Features

### 🧪 Manual Testing Checklist

#### Authentication Flow
1. **Registration**: Visit http://localhost:3000/register
   - Create new account with email/password
   - Should auto-login after registration
   - Redirect to dashboard

2. **Login**: Visit http://localhost:3000/login
   - Test with admin credentials: `admin@electricmuse.com` / `admin123`
   - Test with regular user credentials
   - Should redirect to dashboard

#### Booking Flow
1. **Package Selection**: Visit http://localhost:3000/packages
   - View all available packages with pricing
   - Click "Book This Package" to start booking

2. **Date/Time Selection**:
   - Interactive calendar with availability checking
   - Try selecting different dates and times
   - Verify only available slots are shown

3. **Child Information**:
   - Add child profiles with rock/punk preferences
   - Test form validation
   - Add multiple children (within package limits)

4. **Review & Confirmation**:
   - Review booking details and pricing
   - Add optional add-ons
   - Complete session creation

#### Dashboard Features
1. **Session Overview**: Visit http://localhost:3000/dashboard
   - View booked sessions with details
   - Check session status indicators
   - Test "Book New Session" flow

#### Payment Flow Testing
1. **Complete Booking Flow**: Go through entire booking process
   - Select package → Choose date/time → Add children → Review
   - Click "Proceed to Payment" to reach checkout

2. **Payment Plan Selection**: Visit `/checkout/[sessionId]`
   - Test all 4 payment plans (full, 2-pay, 3-pay, 4-pay)
   - Verify discount calculations and savings display
   - Check payment amounts are correct

3. **Stripe Checkout Testing**:
   - Use test card: `4242424242424242` (success)
   - Use test card: `4000000000000002` (decline)
   - Test card with authentication: `4000002500003155`
   - Verify payment success redirects to dashboard
   - Check session status updates after payment

### 🔧 API Testing
Test API endpoints directly:

```bash
# Get packages
curl http://localhost:3000/api/packages

# Check availability (replace date)
curl "http://localhost:3000/api/availability?date=2025-01-15&duration=60"

# Get user sessions (requires authentication)
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/sessions
```

### Git Hooks Setup
```bash
# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "lint-staged"

# Add commit-msg hook
npx husky add .husky/commit-msg "commitlint --edit $1"
```

### Package.json Scripts Reference
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "analyze": "ANALYZE=true next build",
    "prepare": "husky install"
  }
}
```

## Security Checklist

### Before Going Live
- [ ] All environment variables set in production
- [ ] Stripe webhooks configured with correct endpoints
- [ ] AWS S3 bucket permissions properly configured
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] Image uploads scanned for malware
- [ ] Gallery access properly secured
- [ ] Payment card data never stored locally