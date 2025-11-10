import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoutButton } from '../LogoutButton'

describe('LogoutButton', () => {
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    mockOnLogout.mockReset()
  })

  it('renders logout button', () => {
    render(<LogoutButton onLogout={mockOnLogout} />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('calls onLogout when clicked', async () => {
    const user = userEvent.setup()
    mockOnLogout.mockResolvedValue(undefined)
    render(<LogoutButton onLogout={mockOnLogout} />)

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })

  it('shows loading state while logging out', async () => {
    const user = userEvent.setup()
    mockOnLogout.mockImplementation(() => new Promise(() => {}))
    render(<LogoutButton onLogout={mockOnLogout} />)

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(screen.getByRole('button', { name: /logging out/i })).toBeDisabled()
  })

  it('displays server error when logout fails', async () => {
    const user = userEvent.setup()
    mockOnLogout.mockResolvedValue({ error: 'Failed to log out' })
    render(<LogoutButton onLogout={mockOnLogout} />)

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(await screen.findByText(/failed to log out/i)).toBeInTheDocument()
  })

  it('clears error when user retries', async () => {
    const user = userEvent.setup()
    mockOnLogout
      .mockResolvedValueOnce({ error: 'Something went wrong' })
      .mockResolvedValueOnce(undefined)

    render(<LogoutButton onLogout={mockOnLogout} />)

    await user.click(screen.getByRole('button', { name: /log out/i }))
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })
})
