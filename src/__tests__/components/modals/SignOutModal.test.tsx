import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignOutModal from '../../../components/modals/SignOutModal'

// Mock useAuth
const mockSignOut = vi.fn()
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}))

describe('SignOutModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<SignOutModal {...defaultProps} />)

      expect(screen.getByText('Sign Out?')).toBeInTheDocument()
      expect(screen.getByText("You'll be redirected to the login page")).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<SignOutModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Sign Out?')).not.toBeInTheDocument()
    })

    it('should render Cancel and Sign Out buttons', () => {
      render(<SignOutModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="dialog" and aria-modal', () => {
      render(<SignOutModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title-sign-out')
    })

    it('should have matching heading id', () => {
      render(<SignOutModal {...defaultProps} />)

      const heading = screen.getByText('Sign Out?')
      expect(heading).toHaveAttribute('id', 'modal-title-sign-out')
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('User Interactions', () => {
    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call signOut when Sign Out is clicked', async () => {
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByText('Sign Out'))

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('should call onClose after successful sign out', async () => {
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByText('Sign Out'))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading spinner during sign out', async () => {
      mockSignOut.mockImplementation(() => new Promise(() => {})) // never resolves
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByText('Sign Out'))

      // Sign Out text should disappear, spinner should appear
      await waitFor(() => {
        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
      })
    })

    it('should disable buttons during loading', async () => {
      mockSignOut.mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByText('Sign Out'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      })
    })

    it('should not close on Escape during loading', async () => {
      mockSignOut.mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      // Trigger sign out
      await user.click(screen.getByText('Sign Out'))

      // Wait for loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      })

      // Try to escape
      await user.keyboard('{Escape}')

      // onClose should NOT have been called (only the initial click triggers loading, not close)
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should keep modal open on sign out error', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'))
      const user = userEvent.setup()
      render(<SignOutModal {...defaultProps} />)

      await user.click(screen.getByText('Sign Out'))

      // Modal should stay open (Sign Out button should return)
      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
      })

      // onClose should NOT have been called
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })
})
