import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewSessionModal from '../../../components/modals/NewSessionModal'
import { mockClub } from '../../utils/mocks'

// Mock supabase
const mockInvoke = vi.fn()
vi.mock('../../../supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}))

describe('NewSessionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedClub: mockClub,
    onSessionCreated: vi.fn(),
    onError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue({ data: {}, error: null })
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<NewSessionModal {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Start New Session' })).toBeInTheDocument()
      expect(screen.getByText('Begin reading a new book')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<NewSessionModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Start New Session')).not.toBeInTheDocument()
    })

    it('should show form fields', () => {
      render(<NewSessionModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('e.g., The Lord of the Rings')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g., J.R.R. Tolkien')).toBeInTheDocument()
    })

    it('should show club context info', () => {
      render(<NewSessionModal {...defaultProps} />)

      expect(screen.getByText(mockClub.name)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have dialog role and aria attributes', () => {
      render(<NewSessionModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title-new-session')
    })

    it('should have Close button with aria-label', () => {
      render(<NewSessionModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      render(<NewSessionModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
      expect(defaultProps.onError).toHaveBeenCalledWith('')
    })
  })

  describe('Form Validation', () => {
    it('should have submit button disabled when fields are empty', () => {
      render(<NewSessionModal {...defaultProps} />)

      expect(screen.getByText('Start Session').closest('button')).toBeDisabled()
    })

    it('should call onError when title is missing', async () => {
      const user = userEvent.setup()
      render(<NewSessionModal {...defaultProps} />)

      // Fill only author
      await user.type(screen.getByPlaceholderText(/Tolkien/i), 'Test Author')

      // Button should still be disabled (title empty)
      expect(screen.getByText('Start Session').closest('button')).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should call supabase on valid submit', async () => {
      const user = userEvent.setup()
      render(<NewSessionModal {...defaultProps} />)

      // Fill required fields
      await user.type(screen.getByPlaceholderText('e.g., The Lord of the Rings'), 'New Book')
      await user.type(screen.getByPlaceholderText('e.g., J.R.R. Tolkien'), 'New Author')

      // Fill due date via the date input element
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 2)
      await user.type(dateInput, tomorrow.toISOString().split('T')[0])

      await user.click(screen.getByText('Start Session'))

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled()
      })
    })
  })

  describe('Close Behavior', () => {
    it('should clear errors and call onClose on Cancel', async () => {
      const user = userEvent.setup()
      render(<NewSessionModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(defaultProps.onError).toHaveBeenCalledWith('')
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should call onError on API failure', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: new Error('Session creation failed') })
      const user = userEvent.setup()
      render(<NewSessionModal {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('e.g., The Lord of the Rings'), 'A Book')
      await user.type(screen.getByPlaceholderText('e.g., J.R.R. Tolkien'), 'An Author')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 2)
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      await user.type(dateInput, tomorrow.toISOString().split('T')[0])

      await user.click(screen.getByText('Start Session'))

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith('Session creation failed')
      })
    })
  })
})
