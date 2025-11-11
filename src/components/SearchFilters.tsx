'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local state for controlled inputs
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '')
  const [minDistance, setMinDistance] = useState(searchParams.get('minDistance') || '')
  const [maxDistance, setMaxDistance] = useState(searchParams.get('maxDistance') || '')

  // Debounced search - update URL after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ search })
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [search])

  // Update URL params (non-debounced for select/number inputs)
  const updateURL = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Apply all updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value)
    updateURL({ difficulty: value })
  }

  const handleMinDistanceChange = (value: string) => {
    setMinDistance(value)
    updateURL({ minDistance: value })
  }

  const handleMaxDistanceChange = (value: string) => {
    setMaxDistance(value)
    updateURL({ maxDistance: value })
  }

  const handleClearFilters = () => {
    setSearch('')
    setDifficulty('')
    setMinDistance('')
    setMaxDistance('')
    router.push('/') // Clear all params
  }

  const hasActiveFilters = search || difficulty || minDistance || maxDistance

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filter Walks</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by name */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search walk names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Min Distance */}
        <div>
          <label htmlFor="minDistance" className="block text-sm font-medium text-gray-700 mb-1">
            Min Distance (km)
          </label>
          <input
            id="minDistance"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={minDistance}
            onChange={(e) => handleMinDistanceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
          />
        </div>

        {/* Max Distance */}
        <div>
          <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700 mb-1">
            Max Distance (km)
          </label>
          <input
            id="maxDistance"
            type="number"
            step="0.1"
            min="0"
            placeholder="Any"
            value={maxDistance}
            onChange={(e) => handleMaxDistanceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}
