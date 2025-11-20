'use client'

import { useState, FormEvent } from 'react'

// Route preferences interface matching the openai.ts RoutePreferences
export interface CustomRouteFormData {
  location: string
  distance: number
  mustInclude: string[]
  preferences: string[]
  circular: boolean
}

interface CustomRouteFormProps {
  onSubmit: (data: CustomRouteFormData) => Promise<void> | void
  isLoading?: boolean
}

export default function CustomRouteForm({ onSubmit, isLoading = false }: CustomRouteFormProps) {
  const [location, setLocation] = useState('')
  const [distance, setDistance] = useState(2) // Default 2km
  const [mustInclude, setMustInclude] = useState<string[]>([])
  const [preferences, setPreferences] = useState<string[]>([])
  const [circular, setCircular] = useState(true)
  const [error, setError] = useState('')

  const handleCheckboxChange = (
    value: string,
    checked: boolean,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) => {
      if (checked) {
        return [...prev, value]
      } else {
        return prev.filter((item) => item !== value)
      }
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validate location
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    // Build form data
    const formData: CustomRouteFormData = {
      location: location.trim(),
      distance,
      mustInclude,
      preferences,
      circular,
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Input */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value)
            if (error) setError('')
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-900 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Bradford on Avon, SW1A 1AA, Hyde Park"
          disabled={isLoading}
          aria-invalid={!!error}
          aria-describedby={error ? 'location-error' : undefined}
        />
        {error && (
          <p id="location-error" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Distance Slider */}
      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
          Distance: <span className="font-semibold text-blue-600">{distance} km</span>
        </label>
        <input
          type="range"
          id="distance"
          min="1"
          max="10"
          step="0.5"
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 km</span>
          <span>10 km</span>
        </div>
      </div>

      {/* Must Include Section */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Must Include (optional)
          </legend>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cafe"
                checked={mustInclude.includes('cafe')}
                onChange={(e) => handleCheckboxChange('cafe', e.target.checked, setMustInclude)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="cafe" className="ml-2 text-sm text-gray-700">
                Cafe
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dog_park"
                checked={mustInclude.includes('dog_park')}
                onChange={(e) => handleCheckboxChange('dog_park', e.target.checked, setMustInclude)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="dog_park" className="ml-2 text-sm text-gray-700">
                Dog Park
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="water_access"
                checked={mustInclude.includes('water_access')}
                onChange={(e) => handleCheckboxChange('water_access', e.target.checked, setMustInclude)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="water_access" className="ml-2 text-sm text-gray-700">
                Water Access
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Preferences Section */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Preferences (optional)
          </legend>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="off-leash"
                checked={preferences.includes('off-leash')}
                onChange={(e) => handleCheckboxChange('off-leash', e.target.checked, setPreferences)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="off-leash" className="ml-2 text-sm text-gray-700">
                Off-leash Areas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="scenic"
                checked={preferences.includes('scenic')}
                onChange={(e) => handleCheckboxChange('scenic', e.target.checked, setPreferences)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="scenic" className="ml-2 text-sm text-gray-700">
                Scenic Views
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="shaded"
                checked={preferences.includes('shaded')}
                onChange={(e) => handleCheckboxChange('shaded', e.target.checked, setPreferences)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="shaded" className="ml-2 text-sm text-gray-700">
                Shaded Paths
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Circular Route Toggle */}
      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="circular"
            checked={circular}
            onChange={(e) => setCircular(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="circular" className="ml-2 text-sm text-gray-700">
            Circular Route (start and end at same location)
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white 
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? 'Generating Route...' : 'Generate Route'}
      </button>
    </form>
  )
}
