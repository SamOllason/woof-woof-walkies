import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchFilters } from '../SearchFilters'

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('SearchFilters', () => {
  const mockPush = vi.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    mockPush.mockClear()
    mockSearchParams.delete('search')
    mockSearchParams.delete('difficulty')
    mockSearchParams.delete('minDistance')
    mockSearchParams.delete('maxDistance')
    
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any)
    
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders all filter inputs', () => {
      render(<SearchFilters />)
      
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/min distance/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/max distance/i)).toBeInTheDocument()
    })

    it('renders with initial values from URL params', () => {
      mockSearchParams.set('search', 'park')
      mockSearchParams.set('difficulty', 'easy')
      mockSearchParams.set('minDistance', '2')
      mockSearchParams.set('maxDistance', '5')
      
      render(<SearchFilters />)
      
      expect(screen.getByLabelText(/search/i)).toHaveValue('park')
      expect(screen.getByLabelText(/difficulty/i)).toHaveValue('easy')
      expect(screen.getByLabelText(/min distance/i)).toHaveValue(2)
      expect(screen.getByLabelText(/max distance/i)).toHaveValue(5)
    })

    it('shows clear filters button when filters are active', () => {
      mockSearchParams.set('search', 'park')
      
      render(<SearchFilters />)
      
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('hides clear filters button when no filters are active', () => {
      render(<SearchFilters />)
      
      expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()
    })
  })

  describe('Search Input', () => {
    it('updates URL with debouncing after typing', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'park')
      
      // Should not update immediately
      expect(mockPush).not.toHaveBeenCalled()
      
      // Fast-forward debounce timer
      await vi.advanceTimersByTimeAsync(300)
      
      // Should update URL after debounce
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=park')
      })
      
      vi.useRealTimers()
    })

    it('removes search param when input is cleared', async () => {
      vi.useFakeTimers()
      mockSearchParams.set('search', 'park')
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      const searchInput = screen.getByLabelText(/search/i)
      await user.clear(searchInput)
      
      await vi.advanceTimersByTimeAsync(300)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?')
      })
      
      vi.useRealTimers()
    })
  })

  describe('Difficulty Filter', () => {
    it('updates URL immediately when difficulty is selected', async () => {
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const difficultySelect = screen.getByLabelText(/difficulty/i)
      await user.selectOptions(difficultySelect, 'moderate')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?difficulty=moderate')
      })
    })

    it('removes difficulty param when set to "All difficulties"', async () => {
      mockSearchParams.set('difficulty', 'easy')
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const difficultySelect = screen.getByLabelText(/difficulty/i)
      await user.selectOptions(difficultySelect, '')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?')
      })
    })
  })

  describe('Distance Filters', () => {
    it('updates URL when min distance is set', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '2.5')
      
      await vi.advanceTimersByTimeAsync(300)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?minDistance=2.5')
      })
      
      vi.useRealTimers()
    })

    it('updates URL when max distance is set', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      const maxDistanceInput = screen.getByLabelText(/max distance/i)
      await user.type(maxDistanceInput, '10')
      
      await vi.advanceTimersByTimeAsync(300)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?maxDistance=10')
      })
      
      vi.useRealTimers()
    })

    it('preserves other params when updating distance', async () => {
      vi.useFakeTimers()
      mockSearchParams.set('search', 'park')
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '2')
      
      await vi.advanceTimersByTimeAsync(300)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=park&minDistance=2')
      })
      
      vi.useRealTimers()
    })
  })

  describe('Clear Filters', () => {
    it('clears all filters and navigates to home', async () => {
      mockSearchParams.set('search', 'park')
      mockSearchParams.set('difficulty', 'easy')
      mockSearchParams.set('minDistance', '2')
      mockSearchParams.set('maxDistance', '5')
      
      const user = userEvent.setup()
      render(<SearchFilters />)
      
      const clearButton = screen.getByText(/clear filters/i)
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('resets all input values when cleared', async () => {
      mockSearchParams.set('search', 'park')
      mockSearchParams.set('difficulty', 'easy')
      
      const user = userEvent.setup()
      render(<SearchFilters />)
      
      const clearButton = screen.getByText(/clear filters/i)
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/search/i)).toHaveValue('')
        expect(screen.getByLabelText(/difficulty/i)).toHaveValue('')
      })
    })
  })

  describe('Multiple Filters', () => {
    it('combines multiple filters in URL', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      
      render(<SearchFilters />)
      
      // Set difficulty
      const difficultySelect = screen.getByLabelText(/difficulty/i)
      await user.selectOptions(difficultySelect, 'hard')
      
      // Set min distance
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '5')
      
      // Type in search
      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'mountain')
      
      await vi.advanceTimersByTimeAsync(300)
      
      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
        expect(lastCall).toContain('difficulty=hard')
        expect(lastCall).toContain('minDistance=5')
        expect(lastCall).toContain('search=mountain')
      })
      
      vi.useRealTimers()
    })
  })
})
