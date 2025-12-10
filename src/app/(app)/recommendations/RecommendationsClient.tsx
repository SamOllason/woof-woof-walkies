'use client'

import { useState, useTransition } from 'react'
import { getRecommendationsAction, generateCustomRouteAction, saveGeneratedWalkAction } from './actions'
import { WalkRecommendation } from '@/lib/ai/openai'
import CustomRouteForm, { CustomRouteFormData } from '@/components/CustomRouteForm'
import RouteMap from '@/components/RouteMap'
import type { RouteRecommendation } from '@/types/maps'
import toast from 'react-hot-toast'

type Mode = 'basic' | 'custom'

/**
 * Helper function to get emoji icon for a waypoint based on its type/category
 */
function getWaypointEmoji(waypoint: RouteRecommendation['waypoints'][0]): string {
  if (waypoint.type === 'start' || waypoint.type === 'end') {
    return '🏁'
  }
  
  switch (waypoint.category) {
    case 'cafe':
      return '☕'
    case 'park':
    case 'dog_park':
      return '🌳'
    case 'water':
      return '💧'
    default:
      return '📍'
  }
}

export default function RecommendationsClient() {
  const [mode, setMode] = useState<Mode>('basic')
  const [location, setLocation] = useState('')
  const [recommendations, setRecommendations] = useState<WalkRecommendation[]>([])
  const [customRoute, setCustomRoute] = useState<RouteRecommendation | null>(null)
  const [lastFormData, setLastFormData] = useState<CustomRouteFormData | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    startTransition(async () => {
      try {
        const results = await getRecommendationsAction(location)
        setRecommendations(results)
        setCustomRoute(null) // Clear custom route when getting basic recommendations
        toast.success(`Found ${results.length} recommendations!`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get recommendations'
        toast.error(message)
        setRecommendations([])
      }
    })
  }

  async function handleCustomRouteSubmit(data: CustomRouteFormData) {
    // Store the form data for "Show Me Another" functionality
    setLastFormData(data)
    // Reset saved state when generating a new route
    setIsSaved(false)
    
    startTransition(async () => {
      try {
        const route = await generateCustomRouteAction(data.location, {
          distance: data.distance,
          mustInclude: data.mustInclude,
          preferences: data.preferences,
          circular: data.circular,
        })
        setCustomRoute(route)
        setRecommendations([]) // Clear basic recommendations when generating custom route
        toast.success('Custom route generated!')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate custom route'
        toast.error(message)
        setCustomRoute(null)
      }
    })
  }

  function handleShowMeAnother() {
    if (!lastFormData) return
    
    // Re-submit with same data - AI will generate a different route
    handleCustomRouteSubmit(lastFormData)
  }

  /**
   * Save the current AI-generated route as a walk in the database
   */
  async function handleSaveWalk() {
    if (!customRoute || isSaving || isSaved) return

    setIsSaving(true)
    try {
      await saveGeneratedWalkAction(customRoute)
      setIsSaved(true)
      toast.success('Walk saved successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save walk'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900">
          ✨ AI Walk Recommendations
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Get personalized dog walking route suggestions for any location
        </p>
      </div>

      {/* Mode Toggle - stacks on very small screens */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('basic')}
          className={`flex-1 rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition ${
            mode === 'basic'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Basic Recommendations
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex-1 rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition ${
            mode === 'custom'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Custom Route Generator
        </button>
      </div>

      {/* Basic Recommendations Form */}
      {mode === 'basic' && (
        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a location (e.g., London, Hyde Park)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 
                text-gray-900 placeholder:text-gray-500
                focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white 
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'Finding...' : 'Get Recommendations'}
            </button>
          </div>
        </form>
      )}

      {/* Custom Route Form */}
      {mode === 'custom' && (
        <div className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <CustomRouteForm onSubmit={handleCustomRouteSubmit} isLoading={isPending} />
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">
            {mode === 'basic' ? 'Finding great walks near you...' : 'Generating your custom route...'}
          </p>
        </div>
      )}

      {/* Basic Recommendations Results */}
      {!isPending && mode === 'basic' && recommendations.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Recommended Walks for {location}
          </h2>
          
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
            >
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {rec.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                  <span>📏 {rec.distance}</span>
                  <span>
                    {rec.difficulty === 'easy' && '🟢'}
                    {rec.difficulty === 'moderate' && '🟡'}
                    {rec.difficulty === 'hard' && '🔴'}
                    {' '}
                    {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="mb-1 font-semibold text-gray-700">Highlights</h4>
                  <p className="text-gray-600">{rec.highlights}</p>
                </div>

                <div>
                  <h4 className="mb-1 font-semibold text-gray-700">Why this route?</h4>
                  <p className="text-gray-600">{rec.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Route Results */}
      {!isPending && mode === 'custom' && customRoute && (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            {/* Route Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {customRoute.routeName}
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                <span>📏 {customRoute.estimatedDistance}</span>
                {customRoute.directions && (
                  <span>⏱️ {Math.round(customRoute.directions.duration / 60)} min</span>
                )}
              </div>
              <p className="mt-3 text-sm sm:text-base text-gray-700">{customRoute.highlights}</p>
            </div>

            {/* Waypoints */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Route Waypoints</h3>
              <ol className="space-y-2">
                {customRoute.waypoints.map((waypoint, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex items-center gap-2">
                      <span className="text-base">{getWaypointEmoji(waypoint)}</span>
                      {waypoint.placeId ? (
                        <a
                          href={`https://www.google.com/maps/place/?q=place_id:${waypoint.placeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {waypoint.name}
                        </a>
                      ) : (
                        waypoint.name
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

             {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleShowMeAnother}
                disabled={isPending}
                className="flex-1 rounded-lg bg-white border-2 border-blue-600 px-4 sm:px-6 py-3 font-semibold text-blue-600 
                  hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                {isPending ? 'Generating...' : '🔄 Show Me Another'}
              </button>
              <button
                onClick={handleSaveWalk}
                disabled={isSaving || isSaved}
                className="flex-1 rounded-lg bg-blue-600 px-4 sm:px-6 py-3 font-semibold text-white 
                  hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                {isSaving ? '💾 Saving...' : isSaved ? '✅ Saved!' : '💾 Save Walk'}
              </button>
            </div>

            {/* Map Display */}
            <div className="mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Route Map</h3>
              
              <RouteMap 
                waypoints={customRoute.waypoints} 
                directions={customRoute.directions}
                height="350px" 
              />
            </div>

            {/* Turn-by-Turn Directions */}
            {customRoute.directions && customRoute.directions.steps.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Turn-by-Turn Directions</h3>
                <div className="space-y-2 text-sm">
                  {customRoute.directions.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="text-gray-400">{index + 1}.</span>
                      <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Empty State */}
      {!isPending && recommendations.length === 0 && !customRoute && (
        <div className="text-center py-12 text-gray-500">
          <p>
            {mode === 'basic' 
              ? 'Enter a location above to get AI-powered walk recommendations!' 
              : 'Fill in the form above to generate a custom walking route!'}
          </p>
        </div>
      )}
    </div>
  )
}
