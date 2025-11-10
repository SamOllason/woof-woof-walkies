import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'

describe('Header', () => {
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    mockOnLogout.mockReset()
  })

  const renderHeader = () => render(<Header onLogout={mockOnLogout} />)

  it('renders the brand title', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /woof woof walkies/i })).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /my walks/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /add walk/i })).toHaveAttribute('href', '/walks/new')
  })

  it('toggles the mobile menu', async () => {
    const user = userEvent.setup()
    renderHeader()

    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    const nav = screen.getByTestId('primary-navigation')

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(nav).toHaveAttribute('data-open', 'false')

    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(nav).toHaveAttribute('data-open', 'true')
  })

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })
})
