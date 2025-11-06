import AddWalkForm from '@/components/AddWalkForm'
import type { CreateWalkInput } from '@/types/walk'

export default function NewWalkPage() {
  // This will be a Server Action when we connect Supabase
  const handleSubmit = async (walkData: CreateWalkInput) => {
    'use server'
    
    // TODO: Save to Supabase when connected
    console.log('Walk data to save:', walkData)
    
    // For now, just log it
    // Later: await supabase.from('walks').insert(walkData)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add a New Walk</h1>
          <p className="mt-2 text-gray-600">
            Save details about a dog walk route so you can refer to it later.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <AddWalkForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
