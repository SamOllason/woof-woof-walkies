'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

interface HeaderProps {
  onLogout: () => Promise<{ error?: string } | void>
}

export function Header({ onLogout }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            Woof Woof Walkies
          </Link>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            aria-expanded={isOpen ? 'true' : 'false'}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <div
          data-testid="primary-navigation"
          data-open={isOpen ? 'true' : 'false'}
          className={`${isOpen ? 'flex' : 'hidden'} flex-col gap-4 md:flex md:flex-row md:items-center`}
        >
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            My Walks
          </Link>
          <Link
            href="/walks/new"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Add Walk
          </Link>
          <LogoutButton onLogout={async () => {
            const result = await onLogout()
            setIsOpen(false)
            return result
          }} />
        </div>
      </nav>
    </header>
  )
}
