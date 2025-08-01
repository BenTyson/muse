'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChildInput, childSchema } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChildFormProps {
  child?: ChildInput
  onSave: (child: ChildInput) => void
  onCancel?: () => void
}

const STYLE_OPTIONS = [
  'Rock',
  'Punk',
  'Metal',
  'Alternative',
  'Gothic',
  'Emo',
  'Classic Rock',
]

export default function ChildForm({ child, onSave, onCancel }: ChildFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChildInput>({
    resolver: zodResolver(childSchema),
    defaultValues: child || {},
  })

  const onSubmit = (data: ChildInput) => {
    onSave(data)
  }

  const handleFieldChange = (field: keyof ChildInput, value: string) => {
    const currentData = {
      firstName: child?.firstName || '',
      lastName: child?.lastName || '',
      birthDate: child?.birthDate || '',
      preferredStyle: child?.preferredStyle || '',
      musicPreferences: child?.musicPreferences || '',
      styleNotes: child?.styleNotes || '',
      specialRequirements: child?.specialRequirements || '',
      ...child,
      [field]: value,
    }
    onSave(currentData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          placeholder="First Name"
          error={errors.firstName?.message}
          onChange={(e) => handleFieldChange('firstName', e.target.value)}
        />
        <Input
          {...register('lastName')}
          placeholder="Last Name"
          error={errors.lastName?.message}
          onChange={(e) => handleFieldChange('lastName', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Birth Date (Optional)
        </label>
        <Input
          {...register('birthDate')}
          type="date"
          error={errors.birthDate?.message}
          onChange={(e) => handleFieldChange('birthDate', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Style
        </label>
        <select
          {...register('preferredStyle')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
          onChange={(e) => handleFieldChange('preferredStyle', e.target.value)}
        >
          <option value="">Select a style...</option>
          {STYLE_OPTIONS.map((style) => (
            <option key={style} value={style.toLowerCase()}>
              {style}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Music Preferences (Optional)
        </label>
        <textarea
          {...register('musicPreferences')}
          placeholder="Tell us about their favorite bands, songs, or music genres..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
          onChange={(e) => handleFieldChange('musicPreferences', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style Notes (Optional)
        </label>
        <textarea
          {...register('styleNotes')}
          placeholder="Any specific styling requests or preferences..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
          onChange={(e) => handleFieldChange('styleNotes', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requirements (Optional)
        </label>
        <textarea
          {...register('specialRequirements')}
          placeholder="Allergies, sensitivities, or other special needs..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
          onChange={(e) => handleFieldChange('specialRequirements', e.target.value)}
        />
      </div>

      {/* Form auto-saves on change */}
    </form>
  )
}