'use client'

import { useState } from 'react'

interface LogoutButtonProps {
  onLogout: () => Promise<{ error?: string } | void>
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    if (isLoading) return

    setError('')
    setIsLoading(true)

    try {
      const result = await onLogout()

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Successful logout will typically trigger a redirect
    } catch (err) {
      setError('Something went wrong while logging out.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200"
      >
        {isLoading ? 'Logging out...' : 'Log out'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
