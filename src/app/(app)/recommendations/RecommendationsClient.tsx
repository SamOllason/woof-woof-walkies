'use client'

import { useState, useTransition } from 'react'
import { getRecommendationsAction } from './actions'
import { WalkRecommendation } from '@/lib/ai/openai'
import toast from 'react-hot-toast'

export default function RecommendationsClient() {
  const [location, setLocation] = useState('')
  const [recommendations, setRecommendations] = useState<WalkRecommendation[]>([])
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
        toast.success(`Found ${results.length} recommendations!`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get recommendations'
        toast.error(message)
        setRecommendations([])
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

      {/* Search Form */}
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

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Finding great walks near you...</p>
        </div>
      )}

      {/* Results */}
      {!isPending && recommendations.length > 0 && (
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

      {/* Empty State */}
      {!isPending && recommendations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Enter a location above to get AI-powered walk recommendations!</p>
        </div>
      )}
    </div>
  )
}
