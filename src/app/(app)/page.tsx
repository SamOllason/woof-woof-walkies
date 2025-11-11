import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WalkCard } from '@/components/WalkCard'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch only the current user's walks
  const { data: walks, error } = await supabase
    .from('walks')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

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
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading walks. Please try again later.
          </div>
        )}

        {/* Empty State */}
        {!error && walks && walks.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🐕</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No walks yet!
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to explore? Add your first walk to get started.
            </p>
            <Link
              href="/walks/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Walk
            </Link>
          </div>
        )}

        {/* Walks List */}
        {!error && walks && walks.length > 0 && (
          <div className="space-y-4">
            {walks.map((walk) => (
              <WalkCard key={walk.id} walk={walk} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
