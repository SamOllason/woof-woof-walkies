import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  const mockOnLogin = vi.fn()

  beforeEach(() => {
    mockOnLogin.mockClear()
  })

  describe('Rendering', () => {
    it('renders email input', () => {
      render(<LoginForm onLogin={mockOnLogin} />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('renders password input', () => {
      render(<LoginForm onLogin={mockOnLogin} />)
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    })

    it('renders login button', () => {
      render(<LoginForm onLogin={mockOnLogin} />)
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('renders link to signup page', () => {
      render(<LoginForm onLogin={mockOnLogin} />)
      expect(screen.getByText(/need an account/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    })
  })

  describe('User Input', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })
  })

  describe('Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), '12345')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()

      await user.type(screen.getByLabelText(/email/i), 't')

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls onLogin with form data when valid', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(mockOnLogin).toHaveBeenCalledTimes(1)
    })

    it('does not call onLogin when form is invalid', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(mockOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading text when submitting', async () => {
      const user = userEvent.setup()
      mockOnLogin.mockImplementation(() => new Promise(() => {}))

      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument()
    })

    it('disables button when loading', async () => {
      const user = userEvent.setup()
      mockOnLogin.mockImplementation(() => new Promise(() => {}))

      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('displays server error message', async () => {
      const user = userEvent.setup()
      mockOnLogin.mockResolvedValue({ error: 'Invalid login credentials' })

      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument()
    })
  })
})
