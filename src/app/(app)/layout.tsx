import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/server'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  async function logoutAction(): Promise<{ error?: string } | void> {
    'use server'

    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={logoutAction} />
      <main>{children}</main>
    </div>
  )
}
