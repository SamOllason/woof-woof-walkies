import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../SignupForm'

describe('SignupForm', () => {
  const mockOnSignup = vi.fn()

  beforeEach(() => {
    mockOnSignup.mockClear()
  })

  describe('Rendering', () => {
    it('renders email input', () => {
      render(<SignupForm onSignup={mockOnSignup} />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('renders password input', () => {
      render(<SignupForm onSignup={mockOnSignup} />)
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    })

    it('renders confirm password input', () => {
      render(<SignupForm onSignup={mockOnSignup} />)
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('renders sign up button', () => {
      render(<SignupForm onSignup={mockOnSignup} />)
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('renders link to login page', () => {
      render(<SignupForm onSignup={mockOnSignup} />)
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })
  })

  describe('User Input', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'password123')
      
      expect(passwordInput).toHaveValue('password123')
    })

    it('allows typing in confirm password field', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const confirmInput = screen.getByLabelText(/confirm password/i)
      await user.type(confirmInput, 'password123')
      
      expect(confirmInput).toHaveValue('password123')
    })
  })

  describe('Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, '12345')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'password123')
      
      const confirmInput = screen.getByLabelText(/confirm password/i)
      await user.type(confirmInput, 'password456')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      // Submit to trigger error
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      
      // Start typing
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 't')
      
      // Error should be gone
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls onSignup with form data when valid', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      
      expect(mockOnSignup).toHaveBeenCalledTimes(1)
    })

    it('does not call onSignup when form is invalid', async () => {
      const user = userEvent.setup()
      render(<SignupForm onSignup={mockOnSignup} />)
      
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      
      expect(mockOnSignup).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading text when submitting', async () => {
      const user = userEvent.setup()
      mockOnSignup.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<SignupForm onSignup={mockOnSignup} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      
      expect(screen.getByRole('button', { name: /signing up/i })).toBeInTheDocument()
    })

    it('disables button when loading', async () => {
      const user = userEvent.setup()
      mockOnSignup.mockImplementation(() => new Promise(() => {}))
      
      render(<SignupForm onSignup={mockOnSignup} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      
      expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('displays server error message', async () => {
      const user = userEvent.setup()
      mockOnSignup.mockResolvedValue({ error: 'Email already exists' })
      
      render(<SignupForm onSignup={mockOnSignup} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      
      expect(await screen.findByText(/email already exists/i)).toBeInTheDocument()
    })
  })
})
