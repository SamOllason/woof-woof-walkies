import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomRouteForm from '../CustomRouteForm'

describe('CustomRouteForm', () => {
  describe('Rendering', () => {
    it('renders all form fields', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      // Starting Location input
      expect(screen.getByLabelText(/starting location/i)).toBeInTheDocument()
      
      // Distance slider
      expect(screen.getByLabelText(/distance/i)).toBeInTheDocument()
      
      // Must-include checkboxes
      expect(screen.getByLabelText(/cafe/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dog park/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/water access/i)).toBeInTheDocument()
      
      // Preferences checkboxes
      expect(screen.getByLabelText(/off-leash areas/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/scenic views/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/shaded paths/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/completely off-road/i)).toBeInTheDocument()
      
      // Circular route toggle
      expect(screen.getByLabelText(/circular route/i)).toBeInTheDocument()
      
      // Submit button
      expect(screen.getByRole('button', { name: /generate route/i })).toBeInTheDocument()
    })

    it('shows correct placeholder text for location', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      expect(screen.getByPlaceholderText(/bradford on avon/i)).toBeInTheDocument()
    })

    it('has default values set correctly', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      // Distance default: 2km
      const distanceSlider = screen.getByLabelText(/distance/i) as HTMLInputElement
      expect(distanceSlider.value).toBe('2')
      
      // Circular route default: checked
      const circularCheckbox = screen.getByLabelText(/circular route/i) as HTMLInputElement
      expect(circularCheckbox.checked).toBe(true)
      
      // Must-include checkboxes default: unchecked
      const cafeCheckbox = screen.getByLabelText(/cafe/i) as HTMLInputElement
      expect(cafeCheckbox.checked).toBe(false)
    })

    it('displays current distance value', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      // Should show "2 km" initially
      expect(screen.getByText(/2 km/i)).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('allows user to type location', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'Bradford on Avon')

      expect(locationInput).toHaveValue('Bradford on Avon')
    })

    it('updates distance value when slider moves', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const distanceSlider = screen.getByLabelText(/distance/i)
      await user.clear(distanceSlider)
      await user.type(distanceSlider, '5')

      expect(distanceSlider).toHaveValue(5)
      expect(screen.getByText(/5 km/i)).toBeInTheDocument()
    })

    it('allows user to check must-include options', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const cafeCheckbox = screen.getByLabelText(/cafe/i) as HTMLInputElement
      const dogParkCheckbox = screen.getByLabelText(/dog park/i) as HTMLInputElement

      await user.click(cafeCheckbox)
      await user.click(dogParkCheckbox)

      expect(cafeCheckbox.checked).toBe(true)
      expect(dogParkCheckbox.checked).toBe(true)
    })

    it('allows user to check preference options', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const offLeashCheckbox = screen.getByLabelText(/off-leash areas/i) as HTMLInputElement
      const scenicCheckbox = screen.getByLabelText(/scenic views/i) as HTMLInputElement
      const offRoadCheckbox = screen.getByLabelText(/completely off-road/i) as HTMLInputElement

      await user.click(offLeashCheckbox)
      await user.click(scenicCheckbox)
      await user.click(offRoadCheckbox)

      expect(offLeashCheckbox.checked).toBe(true)
      expect(scenicCheckbox.checked).toBe(true)
      expect(offRoadCheckbox.checked).toBe(true)
    })

    it('allows user to toggle circular route', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const circularCheckbox = screen.getByLabelText(/circular route/i) as HTMLInputElement
      
      // Default is checked
      expect(circularCheckbox.checked).toBe(true)
      
      // Uncheck it
      await user.click(circularCheckbox)
      expect(circularCheckbox.checked).toBe(false)
      
      // Check it again
      await user.click(circularCheckbox)
      expect(circularCheckbox.checked).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('shows error when submitting without location', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      expect(await screen.findByText(/please enter a location/i)).toBeInTheDocument()
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('does not show error when location is provided', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'Bradford on Avon')

      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/please enter a location/i)).not.toBeInTheDocument()
        expect(mockSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit with correct data structure', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      // Fill in location
      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'Bradford on Avon')

      // Set distance to 3km using keyboard navigation
      const distanceSlider = screen.getByLabelText(/distance/i)
      await user.click(distanceSlider)
      await user.keyboard('{ArrowRight}{ArrowRight}')

      // Check cafe and dog park
      await user.click(screen.getByLabelText(/cafe/i))
      await user.click(screen.getByLabelText(/dog park/i))

      // Check off-leash preference
      await user.click(screen.getByLabelText(/off-leash areas/i))

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          location: 'Bradford on Avon',
          distance: 3,
          mustInclude: ['cafe', 'dog_park'],
          preferences: ['off-leash'],
          circular: true,
        })
      })
    })

    it('passes circular: false when unchecked', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')

      // Uncheck circular route
      const circularCheckbox = screen.getByLabelText(/circular route/i)
      await user.click(circularCheckbox)

      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            circular: false,
          })
        )
      })
    })

    it('passes empty arrays when no options selected', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')

      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mustInclude: [],
            preferences: [],
          })
        )
      })
    })

    it('includes off-road preference when selected', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')

      // Select off-road preference
      await user.click(screen.getByLabelText(/completely off-road/i))

      const submitButton = screen.getByRole('button', { name: /generate route/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            preferences: ['off-road'],
          })
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      // All inputs should have associated labels
      const locationInput = screen.getByLabelText(/starting location/i)
      const distanceInput = screen.getByLabelText(/distance/i)
      const cafeCheckbox = screen.getByLabelText(/cafe/i)
      const circularCheckbox = screen.getByLabelText(/circular route/i)

      expect(locationInput).toHaveAccessibleName()
      expect(distanceInput).toHaveAccessibleName()
      expect(cafeCheckbox).toHaveAccessibleName()
      expect(circularCheckbox).toHaveAccessibleName()
    })

    it('submit button is keyboard accessible', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} />)

      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')

      // Tab to submit button and press Enter
      await user.tab()
      await user.tab()
      await user.tab()
      // ... (more tabs to reach button, or use different approach)
      
      const submitButton = screen.getByRole('button', { name: /generate route/i })
      submitButton.focus()
      await user.keyboard('{Enter}')

      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('disables inputs when isLoading is true', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} isLoading={true} />)

      const locationInput = screen.getByLabelText(/starting location/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /generating/i }) as HTMLButtonElement

      expect(locationInput.disabled).toBe(true)
      expect(submitButton.disabled).toBe(true)
    })

    it('shows loading text in button when isLoading is true', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} isLoading={true} />)

      expect(screen.getByRole('button', { name: /generating route/i })).toBeInTheDocument()
    })

    it('enables inputs when isLoading is false', () => {
      const mockSubmit = vi.fn()
      render(<CustomRouteForm onSubmit={mockSubmit} isLoading={false} />)

      const locationInput = screen.getByLabelText(/starting location/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /generate route/i }) as HTMLButtonElement

      expect(locationInput.disabled).toBe(false)
      expect(submitButton.disabled).toBe(false)
    })
  })
})
