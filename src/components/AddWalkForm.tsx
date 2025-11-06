'use client'

import { useState, FormEvent } from 'react'
import type { CreateWalkInput, DifficultyLevel } from '@/types/walk'

interface AddWalkFormProps {
  onSubmit: (walk: CreateWalkInput) => Promise<void>
  isSubmitting?: boolean
}

export default function AddWalkForm({ onSubmit, isSubmitting = false }: AddWalkFormProps) {
  const [formData, setFormData] = useState<CreateWalkInput>({
    name: '',
    distance_km: 0,
    duration_minutes: 0,
    difficulty: 'moderate',
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateWalkInput, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateWalkInput, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Walk name is required'
    }

    if (formData.distance_km <= 0) {
      newErrors.distance_km = 'Distance must be greater than 0'
    }

    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  const handleChange = (
    field: keyof CreateWalkInput,
    value: string | number | DifficultyLevel
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Walk Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Walk Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Riverside Loop"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Distance */}
      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
          Distance (km) *
        </label>
        <input
          type="number"
          id="distance"
          value={formData.distance_km || ''}
          onChange={(e) => handleChange('distance_km', parseFloat(e.target.value) || 0)}
          step="0.1"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.distance_km ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 3.5"
          disabled={isSubmitting}
          aria-invalid={!!errors.distance_km}
          aria-describedby={errors.distance_km ? 'distance-error' : undefined}
        />
        {errors.distance_km && (
          <p id="distance-error" className="mt-1 text-sm text-red-600">
            {errors.distance_km}
          </p>
        )}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (minutes) *
        </label>
        <input
          type="number"
          id="duration"
          value={formData.duration_minutes || ''}
          onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
          step="5"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 45"
          disabled={isSubmitting}
          aria-invalid={!!errors.duration_minutes}
          aria-describedby={errors.duration_minutes ? 'duration-error' : undefined}
        />
        {errors.duration_minutes && (
          <p id="duration-error" className="mt-1 text-sm text-red-600">
            {errors.duration_minutes}
          </p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={formData.difficulty}
          onChange={(e) => handleChange('difficulty', e.target.value as DifficultyLevel)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional details about this walk..."
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Walk'}
        </button>
      </div>
    </form>
  )
}
