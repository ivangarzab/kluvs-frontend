import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemberModal from '../../../components/modals/MemberModal'
import { mockClub, mockServer, mockAdminMember } from '../../utils/mocks'

// Mock supabase
const mockInvoke = vi.fn()
vi.mock('../../../supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}))

describe('MemberModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedClub: mockClub,
    selectedServerData: mockServer,
    onMemberSaved: vi.fn(),
    onError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue({ data: {}, error: null })
  })

  describe('Rendering - Add Mode', () => {
    it('should render add mode when no editingMember', () => {
      render(<MemberModal {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Add Member' })).toBeInTheDocument()
      expect(screen.getByText('Add a new member to the club')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<MemberModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Add Member')).not.toBeInTheDocument()
    })

    it('should show empty name field in add mode', () => {
      render(<MemberModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('e.g., BookLover42')).toHaveValue('')
    })
  })

  describe('Rendering - Edit Mode', () => {
    it('should render edit mode when editingMember is provided', () => {
      render(<MemberModal {...defaultProps} editingMember={mockAdminMember} />)

      expect(screen.getByRole('heading', { name: 'Edit Member' })).toBeInTheDocument()
      expect(screen.getByText('Update member details')).toBeInTheDocument()
    })

    it('should pre-populate form in edit mode', () => {
      render(<MemberModal {...defaultProps} editingMember={mockAdminMember} />)

      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have dialog role and aria attributes', () => {
      render(<MemberModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title-member')
    })

    it('should have Close button with aria-label', () => {
      render(<MemberModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Validation', () => {
    it('should have submit button disabled when name is empty', () => {
      render(<MemberModal {...defaultProps} />)

      // "Add Member" in both heading and button
      const submitButton = screen.getByText('Add Member', { selector: 'span' }).closest('button')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Submission - Add', () => {
    it('should call supabase on valid add submission', async () => {
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('e.g., BookLover42'), 'New Member')

      await user.click(screen.getByText('Add Member', { selector: 'span' }))

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled()
      })
    })

    it('should call onMemberSaved and onClose on success', async () => {
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('e.g., BookLover42'), 'New Member')

      await user.click(screen.getByText('Add Member', { selector: 'span' }))

      await waitFor(() => {
        expect(defaultProps.onMemberSaved).toHaveBeenCalledTimes(1)
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Form Submission - Edit', () => {
    it('should call supabase on valid edit submission', async () => {
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} editingMember={mockAdminMember} />)

      // Change name
      const nameInput = screen.getByDisplayValue('Admin User')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')

      await user.click(screen.getByText('Update Member', { selector: 'span' }))

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled()
      })
    })
  })

  describe('Close Behavior', () => {
    it('should clear errors and reset form on Cancel', async () => {
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(defaultProps.onError).toHaveBeenCalledWith('')
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should call onError on API failure', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: new Error('Save failed') })
      const user = userEvent.setup()
      render(<MemberModal {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('e.g., BookLover42'), 'Test')

      await user.click(screen.getByText('Add Member', { selector: 'span' }))

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith('Save failed')
      })
    })
  })
})
