import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveGeneratedWalkAction } from '../actions'
import type { RouteRecommendation } from '@/types/maps'

// Mock Supabase server client
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn(() => ({
  insert: mockInsert.mockReturnValue({
    select: mockSelect.mockReturnValue({
      single: mockSingle,
    }),
  }),
}))
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

describe('saveGeneratedWalkAction', () => {
  const mockRoute: RouteRecommendation = {
    routeName: 'Sunny Park Loop',
    estimatedDistance: '2.5 km',
    highlights: 'Great views, dog-friendly cafe stop, shaded paths',
    waypoints: [
      { lat: 51.5, lng: -0.1, name: 'Start Point', type: 'start' },
      { lat: 51.51, lng: -0.11, name: 'Local Park', type: 'poi', category: 'park' },
      { lat: 51.5, lng: -0.1, name: 'Start Point', type: 'end' },
    ],
    directions: {
      distance: 2500,
      duration: 1800, // 30 minutes in seconds
      startAddress: 'Start Point',
      endAddress: 'Start Point',
      waypoints: [],
      overviewPolyline: '',
      steps: [],
    },
  }

  const mockUser = { id: 'user-123', email: 'test@example.com' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('throws error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(saveGeneratedWalkAction(mockRoute)).rejects.toThrow(
        'You must be logged in to save walks'
      )
    })

    it('proceeds when user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockSingle.mockResolvedValue({ data: { id: 'walk-123' }, error: null })

      await saveGeneratedWalkAction(mockRoute)

      expect(mockFrom).toHaveBeenCalledWith('walks')
    })
  })

  describe('Data Conversion', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockSingle.mockResolvedValue({ data: { id: 'walk-123' }, error: null })
    })

    it('converts route name to walk name', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sunny Park Loop',
        })
      )
    })

    it('parses distance from "2.5 km" string to number', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          distance_km: 2.5,
        })
      )
    })

    it('converts duration from seconds to minutes', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          duration_minutes: 30,
        })
      )
    })

    it('calculates difficulty as "easy" for distance < 3km', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'easy',
        })
      )
    })

    it('calculates difficulty as "moderate" for distance 3-6km', async () => {
      const moderateRoute = {
        ...mockRoute,
        estimatedDistance: '4.5 km',
      }
      await saveGeneratedWalkAction(moderateRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'moderate',
        })
      )
    })

    it('calculates difficulty as "hard" for distance > 6km', async () => {
      const hardRoute = {
        ...mockRoute,
        estimatedDistance: '8 km',
      }
      await saveGeneratedWalkAction(hardRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'hard',
        })
      )
    })

    it('uses highlights as notes', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Great views, dog-friendly cafe stop, shaded paths',
        })
      )
    })

    it('includes user_id in saved walk', async () => {
      await saveGeneratedWalkAction(mockRoute)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
        })
      )
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockSingle.mockResolvedValue({ data: { id: 'walk-123' }, error: null })
    })

    it('handles route without directions (uses estimated distance for duration)', async () => {
      const routeWithoutDirections = {
        ...mockRoute,
        directions: undefined,
      }
      await saveGeneratedWalkAction(routeWithoutDirections)

      // Should still save with estimated duration based on distance
      // Average walking speed ~5km/h, so 2.5km = ~30 min
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          duration_minutes: expect.any(Number),
        })
      )
    })

    it('handles empty highlights', async () => {
      const routeNoHighlights = {
        ...mockRoute,
        highlights: '',
      }
      await saveGeneratedWalkAction(routeNoHighlights)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: '',
        })
      )
    })
  })

  describe('Database Interaction', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('calls Supabase insert with correct table', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'walk-123' }, error: null })

      await saveGeneratedWalkAction(mockRoute)

      expect(mockFrom).toHaveBeenCalledWith('walks')
    })

    it('returns the saved walk on success', async () => {
      const savedWalk = {
        id: 'walk-123',
        name: 'Sunny Park Loop',
        distance_km: 2.5,
        duration_minutes: 30,
        difficulty: 'easy',
        notes: 'Great views, dog-friendly cafe stop, shaded paths',
        user_id: 'user-123',
        created_at: '2025-12-10T10:00:00Z',
        updated_at: '2025-12-10T10:00:00Z',
      }
      mockSingle.mockResolvedValue({ data: savedWalk, error: null })

      const result = await saveGeneratedWalkAction(mockRoute)

      expect(result).toEqual(savedWalk)
    })

    it('throws error on database failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      await expect(saveGeneratedWalkAction(mockRoute)).rejects.toThrow(
        'Failed to save walk'
      )
    })
  })
})
