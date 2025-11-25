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
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'park')
      
      // Wait for debounced update
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=park')
      }, { timeout: 1000 })
    })

    it('removes search param when input is cleared', async () => {
      mockSearchParams.set('search', 'park')
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const searchInput = screen.getByLabelText(/search/i)
      await user.clear(searchInput)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?')
      }, { timeout: 1000 })
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
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '2.5')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?minDistance=2.5')
      }, { timeout: 1000 })
    })

    it('updates URL when max distance is set', async () => {
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const maxDistanceInput = screen.getByLabelText(/max distance/i)
      await user.type(maxDistanceInput, '10')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?maxDistance=10')
      }, { timeout: 1000 })
    })

    it('preserves other params when updating distance', async () => {
      mockSearchParams.set('search', 'park')
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '2')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=park&minDistance=2')
      }, { timeout: 1000 })
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
      const user = userEvent.setup()
      
      render(<SearchFilters />)
      
      // Set difficulty (immediate update)
      const difficultySelect = screen.getByLabelText(/difficulty/i)
      await user.selectOptions(difficultySelect, 'hard')
      
      // Set min distance (debounced)
      const minDistanceInput = screen.getByLabelText(/min distance/i)
      await user.type(minDistanceInput, '5')
      
      // Wait for distance debounce to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('minDistance=5'))
      }, { timeout: 1000 })
      
      // Now add search (debounced)
      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'mountain')
      
      // Wait for final state with all filters
      await waitFor(() => {
        const calls = mockPush.mock.calls
        const lastCall = calls[calls.length - 1]?.[0] || ''
        expect(lastCall).toContain('search=mountain')
      }, { timeout: 1000 })
    })
  })
})
