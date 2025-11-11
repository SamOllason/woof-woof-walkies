import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WalksList } from '@/components/WalksList'
import { SearchFilters } from '@/components/SearchFilters'
import { deleteWalkAction } from './actions'

interface HomeProps {
  searchParams: Promise<{
    search?: string
    difficulty?: string
    minDistance?: string
    maxDistance?: string
  }>
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Await the searchParams promise
  const params = await searchParams

  // Build the query with filters
  let query = supabase
    .from('walks')
    .select('*')
    .eq('user_id', user?.id)

  // Apply search filter (case-insensitive name search)
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  // Apply difficulty filter
  if (params.difficulty) {
    query = query.eq('difficulty', params.difficulty)
  }

  // Apply minimum distance filter
  if (params.minDistance) {
    const minDist = parseFloat(params.minDistance)
    if (!isNaN(minDist)) {
      query = query.gte('distance_km', minDist)
    }
  }

  // Apply maximum distance filter
  if (params.maxDistance) {
    const maxDist = parseFloat(params.maxDistance)
    if (!isNaN(maxDist)) {
      query = query.lte('distance_km', maxDist)
    }
  }

  // Order results
  query = query.order('created_at', { ascending: false })

  const { data: walks, error } = await query

  const hasActiveFilters = params.search || params.difficulty || params.minDistance || params.maxDistance

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header - Not Sticky, Scrolls Naturally */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          🐕 My Walks
        </h1>
        <Link
          href="/walks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Walk
        </Link>
      </div>

      {/* Content */}
      <div>
        {/* Search Filters */}
        <SearchFilters />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading walks. Please try again later.
          </div>
        )}

        {/* Result Count */}
        {!error && walks && hasActiveFilters && (
          <div className="mb-4 text-sm text-gray-600">
            {walks.length === 0 ? (
              <p>No walks found matching your filters.</p>
            ) : (
              <p>
                Found <span className="font-semibold">{walks.length}</span> walk{walks.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Walks List with Optimistic Updates */}
        {!error && walks && (
          <WalksList initialWalks={walks} onDelete={deleteWalkAction} />
        )}
      </div>
    </div>
  )
}
