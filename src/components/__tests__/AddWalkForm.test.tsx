import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddWalkForm from '../AddWalkForm'

describe('AddWalkForm', () => {
  describe('Rendering', () => {
    it('renders all form fields', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Check all fields are present
      expect(screen.getByLabelText(/walk name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/distance/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
    })

    it('shows correct placeholder text', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      expect(screen.getByPlaceholderText(/riverside loop/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/3.5/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/45/i)).toBeInTheDocument()
    })

    it('has "moderate" as default difficulty', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const difficultySelect = screen.getByLabelText(/difficulty/i) as HTMLSelectElement
      expect(difficultySelect.value).toBe('moderate')
    })
  })

  describe('User Input', () => {
    it('allows user to type into text fields', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const nameInput = screen.getByLabelText(/walk name/i)
      await user.type(nameInput, 'Riverside Loop')

      expect(nameInput).toHaveValue('Riverside Loop')
    })

    it('allows user to enter distance', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const distanceInput = screen.getByLabelText(/distance/i)
      await user.clear(distanceInput)
      await user.type(distanceInput, '3.5')

      expect(distanceInput).toHaveValue(3.5)
    })

    it('allows user to enter duration', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const durationInput = screen.getByLabelText(/duration/i)
      await user.clear(durationInput)
      await user.type(durationInput, '45')

      expect(durationInput).toHaveValue(45)
    })

    it('allows user to select difficulty', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const difficultySelect = screen.getByLabelText(/difficulty/i)
      await user.selectOptions(difficultySelect, 'hard')

      expect(difficultySelect).toHaveValue('hard')
    })

    it('allows user to type in notes field', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, 'Beautiful scenery')

      expect(notesInput).toHaveValue('Beautiful scenery')
    })
  })

  describe('Validation', () => {
    it('shows error when name is empty and form is submitted', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Submit without filling name
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      // Check error appears
      expect(screen.getByText(/walk name is required/i)).toBeInTheDocument()

      // Check onSubmit was NOT called
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('shows error when distance is 0', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      await user.type(screen.getByLabelText(/walk name/i), 'Test Walk')
      // Distance defaults to 0
      await user.clear(screen.getByLabelText(/duration/i))
      await user.type(screen.getByLabelText(/duration/i), '30')
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      expect(screen.getByText(/distance must be greater than 0/i)).toBeInTheDocument()
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('shows error when duration is 0', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      await user.type(screen.getByLabelText(/walk name/i), 'Test Walk')
      await user.clear(screen.getByLabelText(/distance/i))
      await user.type(screen.getByLabelText(/distance/i), '5')
      // Duration defaults to 0
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      expect(screen.getByText(/duration must be greater than 0/i)).toBeInTheDocument()
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('shows multiple errors when multiple fields are invalid', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      // Check all errors appear
      expect(screen.getByText(/walk name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/distance must be greater than 0/i)).toBeInTheDocument()
      expect(screen.getByText(/duration must be greater than 0/i)).toBeInTheDocument()
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('clears error when user starts typing in field', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Submit to trigger error
      await user.click(screen.getByRole('button', { name: /save walk/i }))
      expect(screen.getByText(/walk name is required/i)).toBeInTheDocument()

      // Type in field
      await user.type(screen.getByLabelText(/walk name/i), 'R')

      // Error should be gone
      expect(screen.queryByText(/walk name is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Fill out form
      await user.type(screen.getByLabelText(/walk name/i), 'Riverside Loop')
      await user.clear(screen.getByLabelText(/distance/i))
      await user.type(screen.getByLabelText(/distance/i), '3.5')
      await user.clear(screen.getByLabelText(/duration/i))
      await user.type(screen.getByLabelText(/duration/i), '45')
      await user.selectOptions(screen.getByLabelText(/difficulty/i), 'hard')
      await user.type(screen.getByLabelText(/notes/i), 'Beautiful scenery')

      // Submit
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      // Check onSubmit was called with correct data
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Riverside Loop',
          distance_km: 3.5,
          duration_minutes: 45,
          difficulty: 'hard',
          notes: 'Beautiful scenery',
        })
      })
    })

    it('calls onSubmit without notes if notes field is empty', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Fill required fields only
      await user.type(screen.getByLabelText(/walk name/i), 'Quick Walk')
      await user.clear(screen.getByLabelText(/distance/i))
      await user.type(screen.getByLabelText(/distance/i), '2')
      await user.clear(screen.getByLabelText(/duration/i))
      await user.type(screen.getByLabelText(/duration/i), '30')

      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Quick Walk',
          distance_km: 2,
          duration_minutes: 30,
          difficulty: 'moderate',
          notes: '',
        })
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading state when isSubmitting is true', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} isSubmitting={true} />)

      const submitButton = screen.getByRole('button', { name: /saving/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/saving/i)
    })

    it('disables all inputs when isSubmitting is true', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} isSubmitting={true} />)

      expect(screen.getByLabelText(/walk name/i)).toBeDisabled()
      expect(screen.getByLabelText(/distance/i)).toBeDisabled()
      expect(screen.getByLabelText(/duration/i)).toBeDisabled()
      expect(screen.getByLabelText(/difficulty/i)).toBeDisabled()
      expect(screen.getByLabelText(/notes/i)).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for all inputs', () => {
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Check each input has an associated label via htmlFor/id
      expect(screen.getByLabelText(/walk name/i)).toHaveAttribute('id', 'name')
      expect(screen.getByLabelText(/distance/i)).toHaveAttribute('id', 'distance')
      expect(screen.getByLabelText(/duration/i)).toHaveAttribute('id', 'duration')
      expect(screen.getByLabelText(/difficulty/i)).toHaveAttribute('id', 'difficulty')
      expect(screen.getByLabelText(/notes/i)).toHaveAttribute('id', 'notes')
    })

    it('announces errors to screen readers via aria attributes', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      await user.click(screen.getByRole('button', { name: /save walk/i }))

      const nameInput = screen.getByLabelText(/walk name/i)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error')
    })

    it('removes aria-invalid when field becomes valid', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<AddWalkForm onSubmit={mockSubmit} />)

      // Submit to trigger error
      await user.click(screen.getByRole('button', { name: /save walk/i }))
      
      const nameInput = screen.getByLabelText(/walk name/i)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')

      // Fix the error
      await user.type(nameInput, 'Walk Name')

      expect(nameInput).toHaveAttribute('aria-invalid', 'false')
    })
  })
})
