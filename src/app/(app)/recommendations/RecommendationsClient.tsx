'use client'

import { useState, useTransition } from 'react'
import { getRecommendationsAction, generateCustomRouteAction } from './actions'
import { WalkRecommendation } from '@/lib/ai/openai'
import CustomRouteForm, { CustomRouteFormData } from '@/components/CustomRouteForm'
import RouteMap from '@/components/RouteMap'
import type { RouteRecommendation } from '@/types/maps'
import toast from 'react-hot-toast'

type Mode = 'basic' | 'custom'

export default function RecommendationsClient() {
  const [mode, setMode] = useState<Mode>('basic')
  const [location, setLocation] = useState('')
  const [recommendations, setRecommendations] = useState<WalkRecommendation[]>([])
  const [customRoute, setCustomRoute] = useState<RouteRecommendation | null>(null)
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          ✨ AI Walk Recommendations
        </h1>
        <p className="text-gray-600">
          Get personalized dog walking route suggestions for any location
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('basic')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
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
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
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
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a location (e.g., London, SW1A 1AA, Hyde Park)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 
                text-gray-900 placeholder:text-gray-500
                focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white 
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'Finding walks...' : 'Get Recommendations'}
            </button>
          </div>
        </form>
      )}

      {/* Custom Route Form */}
      {mode === 'custom' && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended Walks for {location}
          </h2>
          
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {rec.name}
                  </h3>
                  <div className="mt-1 flex gap-4 text-sm text-gray-600">
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
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Route Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {customRoute.routeName}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📏 {customRoute.estimatedDistance}</span>
                {customRoute.directions && (
                  <span>⏱️ {Math.round(customRoute.directions.duration / 60)} min</span>
                )}
              </div>
              <p className="mt-3 text-gray-700">{customRoute.highlights}</p>
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
                    <span className="text-gray-700">{waypoint.name}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Map Display */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Route Map</h3>
              <RouteMap route={customRoute} />
            </div>

            {/* Turn-by-Turn Directions */}
            {customRoute.directions && customRoute.directions.steps.length > 0 && (
              <div>
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

            {/* TODO: Add "Save as Walk" button here */}
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
