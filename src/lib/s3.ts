import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomBytes } from 'crypto'
import sharp from 'sharp'

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('AWS_ACCESS_KEY_ID is not set')
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_SECRET_ACCESS_KEY is not set')
}

if (!process.env.AWS_S3_BUCKET) {
  throw new Error('AWS_S3_BUCKET is not set')
}

// Configure S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export const BUCKET_NAME = process.env.AWS_S3_BUCKET
export const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN

// Photo size configurations
export const PHOTO_SIZES = {
  original: { width: null, height: null, quality: 95 },
  large: { width: 2000, height: 2000, quality: 90 },
  medium: { width: 1200, height: 1200, quality: 85 },
  small: { width: 800, height: 800, quality: 80 },
  thumbnail: { width: 300, height: 300, quality: 75 },
} as const

export type PhotoSize = keyof typeof PHOTO_SIZES

// Generate secure file paths
export function generatePhotoPath(
  sessionId: string, 
  fileName: string, 
  size: PhotoSize = 'original'
): string {
  const timestamp = Date.now()
  const randomId = randomBytes(8).toString('hex')
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
  
  return `sessions/${sessionId}/${size}/${timestamp}-${randomId}.${extension}`
}

// Generate watermark path
export function generateWatermarkPath(sessionId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomId = randomBytes(8).toString('hex')
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
  
  return `sessions/${sessionId}/watermarked/${timestamp}-${randomId}.${extension}`
}

// Get CloudFront URL for a photo
export function getPhotoUrl(key: string): string {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
}

// Generate presigned URL for upload
export async function generateUploadUrl(
  key: string,
  contentType: string = 'image/jpeg',
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // 1 year
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Generate presigned URL for download
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Upload file to S3
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // 1 year
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  })

  await s3Client.send(command)
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

// Process image and create multiple sizes
export async function processImage(
  originalBuffer: Buffer,
  sessionId: string,
  fileName: string
): Promise<{
  original: string
  large: string
  medium: string
  small: string
  thumbnail: string
}> {
  const results: Record<PhotoSize, string> = {} as any

  // Process each size
  for (const [sizeKey, config] of Object.entries(PHOTO_SIZES)) {
    const size = sizeKey as PhotoSize
    let processedBuffer = originalBuffer

    // Resize if dimensions are specified
    if (config.width && config.height) {
      processedBuffer = await sharp(originalBuffer)
        .resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: config.quality })
        .toBuffer()
    } else if (size === 'original') {
      // Optimize original but don't resize
      processedBuffer = await sharp(originalBuffer)
        .jpeg({ quality: config.quality })
        .toBuffer()
    }

    // Generate path and upload
    const path = generatePhotoPath(sessionId, fileName, size)
    await uploadFile(path, processedBuffer, 'image/jpeg')
    results[size] = path
  }

  return results
}

// Apply watermark
export async function applyWatermark(
  imageBuffer: Buffer,
  watermarkPath: string = '/watermark.png'
): Promise<Buffer> {
  // For now, just return the original image
  // TODO: Implement actual watermarking with sharp
  return sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(`
          <svg width="200" height="50">
            <text x="10" y="30" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.7)">
              Electric Muse Photography
            </text>
          </svg>
        `),
        gravity: 'southeast',
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer()
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, or WebP' }
  }

  return { valid: true }
}

// Get file extension from content type
export function getFileExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  
  return extensions[contentType] || 'jpg'
}