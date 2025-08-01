import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  marketingConsent: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().optional(),
  preferredStyle: z.string().optional(),
  musicPreferences: z.string().optional(),
  styleNotes: z.string().optional(),
  specialRequirements: z.string().optional(),
})

export const bookingSchema = z.object({
  packageId: z.string().min(1, 'Package selection is required'),
  sessionDate: z.string().min(1, 'Session date is required'),
  sessionTime: z.string().min(1, 'Session time is required'),
  children: z.array(childSchema).min(1, 'At least one child is required'),
  selectedAddons: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChildInput = z.infer<typeof childSchema>
export type BookingInput = z.infer<typeof bookingSchema>