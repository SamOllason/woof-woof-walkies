import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { EditWalkForm } from '@/components/EditWalkForm'

interface EditWalkPageProps {
  params: Promise<{ id: string }>
}

export default async function EditWalkPage({ params }: EditWalkPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch the walk to edit
  const { data: walk, error } = await supabase
    .from('walks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns this walk
    .single()

  if (error || !walk) {
    notFound()
  }

  async function updateWalkAction(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to update walks' }
    }

    const name = formData.get('name') as string
    const distance_km = parseFloat(formData.get('distance_km') as string)
    const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
    const difficulty = formData.get('difficulty') as 'easy' | 'moderate' | 'hard'
    const notes = formData.get('notes') as string

    const { error } = await supabase
      .from('walks')
      .update({
        name,
        distance_km,
        duration_minutes,
        difficulty,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this walk

    if (error) {
      console.error('Error updating walk:', error)
      return { error: 'Failed to update walk: ' + error.message }
    }

    // Revalidate the home page cache - Check if the caught error is a Next.js redirect (NEXT_REDIRECT in digest) or a real error
    revalidatePath('/')
    
    // Redirect after successful update
    redirect('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Walk</h1>
        <p className="mt-2 text-gray-600">
          Update the details of your walk route.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6 sm:p-8">
        <EditWalkForm walk={walk} onSubmit={updateWalkAction} />
      </div>
    </div>
  )
}
