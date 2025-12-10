import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecommendationsClient from '../RecommendationsClient'
import type { RouteRecommendation } from '@/types/maps'

// Mock the actions
const mockSaveGeneratedWalkAction = vi.fn()
const mockGenerateCustomRouteAction = vi.fn()
const mockGetRecommendationsAction = vi.fn()

vi.mock('../actions', () => ({
  getRecommendationsAction: (...args: any[]) => mockGetRecommendationsAction(...args),
  generateCustomRouteAction: (...args: any[]) => mockGenerateCustomRouteAction(...args),
  saveGeneratedWalkAction: (...args: any[]) => mockSaveGeneratedWalkAction(...args),
}))

// Mock react-hot-toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}))

describe('RecommendationsClient - Save Walk Feature', () => {
  const mockRoute: RouteRecommendation = {
    routeName: 'Sunny Park Loop',
    estimatedDistance: '2.5 km',
    highlights: 'Great views, dog-friendly cafe stop',
    waypoints: [
      { lat: 51.5, lng: -0.1, name: 'Start Point', type: 'start' },
      { lat: 51.51, lng: -0.11, name: 'Local Park', type: 'poi', category: 'park' },
      { lat: 51.5, lng: -0.1, name: 'Start Point', type: 'end' },
    ],
    directions: {
      distance: 2500,
      duration: 1800,
      startAddress: 'Start Point',
      endAddress: 'Start Point',
      waypoints: [],
      overviewPolyline: '',
      steps: [],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock Google Maps global object for RouteMap component
    ;(global as any).google = {
      maps: {
        geometry: {
          encoding: {
            decodePath: vi.fn(() => []),
          },
        },
        Polyline: vi.fn(function() {
          return { setMap: vi.fn() }
        }),
      },
    }
  })

  describe('Save Walk Button Rendering', () => {
    it('renders "Save Walk" button when custom route is displayed', async () => {
      const user = userEvent.setup()
      mockGenerateCustomRouteAction.mockResolvedValue(mockRoute)

      render(<RecommendationsClient />)

      // Switch to custom mode
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))

      // Fill in location and submit
      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })
    })

    it('does not render "Save Walk" button when no route exists', () => {
      render(<RecommendationsClient />)

      expect(screen.queryByRole('button', { name: /save walk/i })).not.toBeInTheDocument()
    })

    it('does not render "Save Walk" button in basic recommendations mode', async () => {
      const user = userEvent.setup()
      mockGetRecommendationsAction.mockResolvedValue([
        { name: 'Test Walk', distance: '2km', difficulty: 'easy', highlights: 'Nice', reason: 'Good' },
      ])

      render(<RecommendationsClient />)

      // Submit basic recommendation
      const input = screen.getByPlaceholderText(/enter a location/i)
      await user.type(input, 'London')
      await user.click(screen.getByRole('button', { name: /get recommendations/i }))

      await waitFor(() => {
        expect(screen.getByText('Test Walk')).toBeInTheDocument()
      })

      // Should not have save button for basic recommendations
      expect(screen.queryByRole('button', { name: /save walk/i })).not.toBeInTheDocument()
    })
  })

  describe('Save Walk User Interactions', () => {
    beforeEach(async () => {
      mockGenerateCustomRouteAction.mockResolvedValue(mockRoute)
    })

    it('calls saveGeneratedWalkAction when Save Walk button is clicked', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockResolvedValue({ id: 'walk-123' })

      render(<RecommendationsClient />)

      // Generate a route first
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      const locationInput = screen.getByLabelText(/starting location/i)
      await user.type(locationInput, 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Click save
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(mockSaveGeneratedWalkAction).toHaveBeenCalledWith(mockRoute)
      })
    })

    it('shows success toast on successful save', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockResolvedValue({ id: 'walk-123' })

      render(<RecommendationsClient />)

      // Generate route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Click save
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('saved'))
      })
    })

    it('shows error toast on save failure', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockRejectedValue(new Error('Database error'))

      render(<RecommendationsClient />)

      // Generate route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Click save
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('error'))
      })
    })

    it('disables Save Walk button after successful save to prevent duplicates', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockResolvedValue({ id: 'walk-123' })

      render(<RecommendationsClient />)

      // Generate route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Click save
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved/i })).toBeDisabled()
      })
    })

    it('shows loading state while saving', async () => {
      const user = userEvent.setup()
      // Delay the response to see loading state
      mockSaveGeneratedWalkAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'walk-123' }), 100))
      )

      render(<RecommendationsClient />)

      // Generate route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Click save
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      // Should show loading state
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    it('re-enables Save Walk button when a new route is generated', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockResolvedValue({ id: 'walk-123' })

      render(<RecommendationsClient />)

      // Generate first route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Save it
      await user.click(screen.getByRole('button', { name: /save walk/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved/i })).toBeDisabled()
      })

      // Generate another route (Show Me Another)
      mockGenerateCustomRouteAction.mockResolvedValue({
        ...mockRoute,
        routeName: 'Different Route',
      })
      await user.click(screen.getByRole('button', { name: /show me another/i }))

      await waitFor(() => {
        // Save button should be enabled again for the new route
        expect(screen.getByRole('button', { name: /save walk/i })).toBeEnabled()
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      mockGenerateCustomRouteAction.mockResolvedValue(mockRoute)
    })

    it('Save Walk button is keyboard accessible', async () => {
      const user = userEvent.setup()
      mockSaveGeneratedWalkAction.mockResolvedValue({ id: 'walk-123' })

      render(<RecommendationsClient />)

      // Generate route
      await user.click(screen.getByRole('button', { name: /custom route generator/i }))
      await user.type(screen.getByLabelText(/starting location/i), 'London')
      await user.click(screen.getByRole('button', { name: /generate route/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save walk/i })).toBeInTheDocument()
      })

      // Focus and press Enter
      const saveButton = screen.getByRole('button', { name: /save walk/i })
      saveButton.focus()
      expect(document.activeElement).toBe(saveButton)

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSaveGeneratedWalkAction).toHaveBeenCalled()
      })
    })
  })
})
