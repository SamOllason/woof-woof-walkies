'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import type { Walk } from '@/types/walk'

interface EditWalkFormProps {
  walk: Walk
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

export function EditWalkForm({ walk, onSubmit }: EditWalkFormProps) {
  const [name, setName] = useState(walk.name)
  const [distance, setDistance] = useState(walk.distance_km.toString())
  const [duration, setDuration] = useState(walk.duration_minutes.toString())
  const [difficulty, setDifficulty] = useState(walk.difficulty)
  const [notes, setNotes] = useState(walk.notes || '')
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Walk name is required'
    }

    const distanceNum = parseFloat(distance)
    if (isNaN(distanceNum) || distanceNum <= 0) {
      newErrors.distance = 'Distance must be greater than 0'
    }

    const durationNum = parseFloat(duration)
    if (isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = 'Duration must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('distance_km', distance)
    formData.append('duration_minutes', duration)
    formData.append('difficulty', difficulty)
    formData.append('notes', notes.trim())

    try {
      const result = await onSubmit(formData)

      if (result?.error) {
        setErrors({ submit: result.error })
        setIsSubmitting(false)
      }
      // If successful, the server action will redirect
    } catch (error) {
      // Check if it's a Next.js redirect (not a real error)
      if (error && typeof error === 'object' && 'digest' in error && 
          typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
        // This is a redirect, not an error - do nothing
        return
      }
      
      setErrors({ submit: 'Failed to update walk. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Walk Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Walk Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-900 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Morning park walk"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          step="0.1"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-900 ${
            errors.distance ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 2.5"
        />
        {errors.distance && (
          <p className="mt-1 text-sm text-red-600">{errors.distance}</p>
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
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-900 ${
            errors.duration ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 30"
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'moderate' | 'hard')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-900"
          placeholder="Any additional details about this walk..."
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Updating...' : 'Update Walk'}
        </button>
        <Link
          href="/"
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
