import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalksList } from '../WalksList'
import type { Walk } from '@/types/walk'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('WalksList', () => {
  const mockOnDelete = vi.fn()
  
  beforeEach(() => {
    mockOnDelete.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockWalks: Walk[] = [
    {
      id: '1',
      user_id: 'user-123',
      name: 'Morning Walk',
      distance_km: 2.5,
      duration_minutes: 30,
      difficulty: 'easy',
      notes: 'Nice sunny day',
      created_at: '2025-11-06T08:00:00Z',
      updated_at: '2025-11-06T08:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      name: 'Evening Walk',
      distance_km: 3.0,
      duration_minutes: 40,
      difficulty: 'moderate',
      notes: undefined,
      created_at: '2025-11-06T18:00:00Z',
      updated_at: '2025-11-06T18:00:00Z',
    },
  ]

  describe('Rendering', () => {
    it('renders all walks', () => {
      render(<WalksList initialWalks={mockWalks} onDelete={mockOnDelete} />)
      
      expect(screen.getByText('Morning Walk')).toBeInTheDocument()
      expect(screen.getByText('Evening Walk')).toBeInTheDocument()
    })

    it('shows empty state when no walks', () => {
      render(<WalksList initialWalks={[]} onDelete={mockOnDelete} />)
      
      expect(screen.getByText('No walks yet')).toBeInTheDocument()
      expect(screen.getByText(/Click "Add Walk" to record your first walk!/)).toBeInTheDocument()
    })
  })

  describe('Optimistic Updates', () => {
    it('removes walk from UI immediately when delete is confirmed', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockOnDelete.mockResolvedValue(undefined)
      
      render(<WalksList initialWalks={mockWalks} onDelete={mockOnDelete} />)
      
      // Verify both walks are present
      expect(screen.getByText('Morning Walk')).toBeInTheDocument()
      expect(screen.getByText('Evening Walk')).toBeInTheDocument()
      
      // Find and click delete button for first walk
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      // Walk should be removed from UI immediately (optimistic update)
      await waitFor(() => {
        expect(screen.queryByText('Morning Walk')).not.toBeInTheDocument()
      })
      
      // Second walk should still be visible
      expect(screen.getByText('Evening Walk')).toBeInTheDocument()
      
      // Server action should be called
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    })

    it('reverts optimistic update and shows error on delete failure', async () => {
      const user = userEvent.setup()
      const toast = await import('react-hot-toast')
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockOnDelete.mockRejectedValue(new Error('Network error'))
      
      render(<WalksList initialWalks={mockWalks} onDelete={mockOnDelete} />)
      
      // Click delete on first walk
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      // Wait for error handling
      await waitFor(() => {
        expect(toast.default.error).toHaveBeenCalledWith('Failed to delete walk. Please try again.')
      })
      
      // Walk should be restored (optimistic update reverted)
      expect(screen.getByText('Morning Walk')).toBeInTheDocument()
    })

    it('shows success toast when delete succeeds', async () => {
      const user = userEvent.setup()
      const toast = await import('react-hot-toast')
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockOnDelete.mockResolvedValue(undefined)
      
      render(<WalksList initialWalks={mockWalks} onDelete={mockOnDelete} />)
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(toast.default.success).toHaveBeenCalledWith('Walk deleted successfully')
      })
    })

    it('shows empty state after deleting last walk', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockOnDelete.mockResolvedValue(undefined)
      
      const singleWalk = [mockWalks[0]]
      render(<WalksList initialWalks={singleWalk} onDelete={mockOnDelete} />)
      
      expect(screen.getByText('Morning Walk')).toBeInTheDocument()
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)
      
      // Walk should be removed immediately (optimistic)
      await waitFor(() => {
        expect(screen.queryByText('Morning Walk')).not.toBeInTheDocument()
      })
      
      // Should show empty state
      expect(screen.getByText('No walks yet')).toBeInTheDocument()
    })
  })
})
