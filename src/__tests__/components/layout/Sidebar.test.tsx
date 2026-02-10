import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../../../components/layout/Sidebar'
import { mockServer, mockClub } from '../../utils/mocks'

describe('Sidebar', () => {
  const defaultProps = {
    selectedServerData: mockServer,
    selectedClub: mockClub,
    onClubSelect: vi.fn(),
    onAddClub: vi.fn(),
    onDeleteClub: vi.fn(),
    isAdmin: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should display Clubs heading', () => {
      render(<Sidebar {...defaultProps} />)

      expect(screen.getByText('Clubs')).toBeInTheDocument()
    })

    it('should display club count', () => {
      render(<Sidebar {...defaultProps} />)

      expect(screen.getByText(`${mockServer.clubs.length} active clubs`)).toBeInTheDocument()
    })

    it('should render all clubs', () => {
      render(<Sidebar {...defaultProps} />)

      mockServer.clubs.forEach(club => {
        expect(screen.getByText(club.name)).toBeInTheDocument()
      })
    })

    it('should show discord channel when available', () => {
      render(<Sidebar {...defaultProps} />)

      // mockClub has discord_channel: 'book-club'
      expect(screen.getByText('#book-club')).toBeInTheDocument()
    })

    it('should show empty state when no clubs', () => {
      const emptyServer = { ...mockServer, clubs: [] }
      render(<Sidebar {...defaultProps} selectedServerData={emptyServer} />)

      expect(screen.getByText('No clubs found')).toBeInTheDocument()
      expect(screen.getByText('Create your first book club!')).toBeInTheDocument()
    })
  })

  describe('Admin Controls', () => {
    it('should show Add Club button for admin', () => {
      render(<Sidebar {...defaultProps} isAdmin={true} />)

      expect(screen.getByRole('button', { name: /Add Club/i })).toBeInTheDocument()
    })

    it('should hide Add Club button for non-admin', () => {
      render(<Sidebar {...defaultProps} isAdmin={false} />)

      expect(screen.queryByRole('button', { name: /Add Club/i })).not.toBeInTheDocument()
    })

    it('should call onAddClub when Add Club is clicked', async () => {
      const user = userEvent.setup()
      render(<Sidebar {...defaultProps} isAdmin={true} />)

      await user.click(screen.getByRole('button', { name: /Add Club/i }))

      expect(defaultProps.onAddClub).toHaveBeenCalledTimes(1)
    })

    it('should show delete buttons for admin', () => {
      render(<Sidebar {...defaultProps} isAdmin={true} />)

      const deleteButtons = screen.getAllByLabelText(/Delete/)
      expect(deleteButtons.length).toBe(mockServer.clubs.length)
    })

    it('should hide delete buttons for non-admin', () => {
      render(<Sidebar {...defaultProps} isAdmin={false} />)

      expect(screen.queryAllByLabelText(/Delete/).length).toBe(0)
    })

    it('should call onDeleteClub with correct club when delete is clicked', async () => {
      const user = userEvent.setup()
      render(<Sidebar {...defaultProps} isAdmin={true} />)

      const deleteButtons = screen.getAllByLabelText(/Delete/)
      await user.click(deleteButtons[0])

      expect(defaultProps.onDeleteClub).toHaveBeenCalledTimes(1)
      expect(defaultProps.onDeleteClub).toHaveBeenCalledWith({
        id: mockServer.clubs[0].id,
        name: mockServer.clubs[0].name,
      })
    })
  })

  describe('Club Selection', () => {
    it('should call onClubSelect when club is clicked', async () => {
      const user = userEvent.setup()
      render(<Sidebar {...defaultProps} />)

      await user.click(screen.getByLabelText(`Select ${mockServer.clubs[0].name}`))

      expect(defaultProps.onClubSelect).toHaveBeenCalledWith(mockServer.clubs[0].id)
    })

    it('should highlight the selected club', () => {
      render(<Sidebar {...defaultProps} selectedClub={mockClub} />)

      // The selected club container has bg-primary/10 class
      const clubElement = screen.getByLabelText(`Select ${mockClub.name}`).closest('div[class*="relative"]')
      expect(clubElement?.className).toContain('bg-primary/10')
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should have role="button" and tabIndex on club items', () => {
      render(<Sidebar {...defaultProps} />)

      const clubButton = screen.getByLabelText(`Select ${mockServer.clubs[0].name}`)
      expect(clubButton).toHaveAttribute('role', 'button')
      expect(clubButton).toHaveAttribute('tabindex', '0')
    })

    it('should select club on Enter key', async () => {
      const user = userEvent.setup()
      render(<Sidebar {...defaultProps} />)

      const clubButton = screen.getByLabelText(`Select ${mockServer.clubs[0].name}`)
      clubButton.focus()
      await user.keyboard('{Enter}')

      expect(defaultProps.onClubSelect).toHaveBeenCalledWith(mockServer.clubs[0].id)
    })
  })

  describe('Mobile Drawer', () => {
    it('should not show mobile drawer by default', () => {
      render(<Sidebar {...defaultProps} />)

      // Desktop sidebar should exist (hidden via CSS)
      const asides = document.querySelectorAll('aside')
      expect(asides.length).toBe(1) // Only desktop sidebar
    })

    it('should show mobile drawer when mobileOpen is true', () => {
      render(<Sidebar {...defaultProps} mobileOpen={true} onMobileClose={vi.fn()} />)

      // Both desktop and mobile sidebar should render
      const asides = document.querySelectorAll('aside')
      expect(asides.length).toBe(2)
    })

    it('should call onMobileClose when overlay is clicked', async () => {
      const onMobileClose = vi.fn()
      const user = userEvent.setup()
      render(<Sidebar {...defaultProps} mobileOpen={true} onMobileClose={onMobileClose} />)

      // Click the overlay (div with aria-hidden)
      const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
      await user.click(overlay)

      expect(onMobileClose).toHaveBeenCalledTimes(1)
    })
  })
})
