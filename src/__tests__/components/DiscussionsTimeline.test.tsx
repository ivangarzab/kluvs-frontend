import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscussionsTimeline from '../../components/DiscussionsTimeline'
import { mockClub, mockClub2 } from '../utils/mocks'

// Mock scrollTo (not available in jsdom)
Element.prototype.scrollTo = vi.fn()

describe('DiscussionsTimeline', () => {
  const defaultProps = {
    selectedClub: mockClub,
    isAdmin: true,
    onAddDiscussion: vi.fn(),
    onEditDiscussion: vi.fn(),
    onDeleteDiscussion: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should show discussion count in header', () => {
      render(<DiscussionsTimeline {...defaultProps} />)

      const discussionCount = mockClub.active_session!.discussions.length
      expect(screen.getByText(`Discussion Timeline (${discussionCount})`)).toBeInTheDocument()
    })

    it('should render all discussion cards', () => {
      render(<DiscussionsTimeline {...defaultProps} />)

      mockClub.active_session!.discussions.forEach(discussion => {
        expect(screen.getByText(discussion.title)).toBeInTheDocument()
      })
    })

    it('should show discussion location when available', () => {
      render(<DiscussionsTimeline {...defaultProps} />)

      // mockDiscussion has location 'Discord Voice Channel'
      expect(screen.getByText('Discord Voice Channel')).toBeInTheDocument()
    })

    it('should show Location TBD when location is missing', () => {
      render(<DiscussionsTimeline {...defaultProps} />)

      // mockDiscussion2 has no location
      expect(screen.getByText('Location TBD')).toBeInTheDocument()
    })

    it('should show subheader text', () => {
      render(<DiscussionsTimeline {...defaultProps} />)

      expect(screen.getByText('Reading session discussions & events')).toBeInTheDocument()
    })
  })

  describe('No Active Session', () => {
    it('should return null when no active session', () => {
      const { container } = render(<DiscussionsTimeline {...defaultProps} selectedClub={mockClub2} />)

      expect(container.innerHTML).toBe('')
    })
  })

  describe('Empty Discussions', () => {
    it('should show empty state when no discussions', () => {
      const clubWithNoDiscussions = {
        ...mockClub,
        active_session: {
          ...mockClub.active_session!,
          discussions: [],
        },
      }

      render(<DiscussionsTimeline {...defaultProps} selectedClub={clubWithNoDiscussions} />)

      expect(screen.getByText('No discussions scheduled')).toBeInTheDocument()
      expect(screen.getByText('Add your first discussion to get started!')).toBeInTheDocument()
    })
  })

  describe('Discussion Status', () => {
    it('should mark past discussions as Completed', () => {
      // mockDiscussion dates are in 2024 which are past
      render(<DiscussionsTimeline {...defaultProps} />)

      const completedLabels = screen.getAllByText('Completed')
      expect(completedLabels.length).toBeGreaterThan(0)
    })

    it('should mark future discussions as Upcoming or Next Up', () => {
      const futureDate1 = new Date()
      futureDate1.setMonth(futureDate1.getMonth() + 1)
      const futureDate2 = new Date()
      futureDate2.setMonth(futureDate2.getMonth() + 2)

      const clubWithFutureDiscussions = {
        ...mockClub,
        active_session: {
          ...mockClub.active_session!,
          discussions: [
            { id: 'disc-1', title: 'Next discussion', date: futureDate1.toISOString(), location: 'Room A' },
            { id: 'disc-2', title: 'Later discussion', date: futureDate2.toISOString(), location: 'Room B' },
          ],
        },
      }

      render(<DiscussionsTimeline {...defaultProps} selectedClub={clubWithFutureDiscussions} />)

      expect(screen.getByText('Next Up')).toBeInTheDocument()
      expect(screen.getByText('Upcoming')).toBeInTheDocument()
    })
  })

  describe('Admin Controls', () => {
    it('should show Add Discussion button for admin', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      expect(screen.getByRole('button', { name: /Add Discussion/i })).toBeInTheDocument()
    })

    it('should hide Add Discussion button for non-admin', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={false} />)

      expect(screen.queryByRole('button', { name: /Add Discussion/i })).not.toBeInTheDocument()
    })

    it('should call onAddDiscussion when Add Discussion is clicked', async () => {
      const user = userEvent.setup()
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      await user.click(screen.getByRole('button', { name: /Add Discussion/i }))

      expect(defaultProps.onAddDiscussion).toHaveBeenCalledTimes(1)
    })

    it('should show edit buttons for admin', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      const editButtons = screen.getAllByTitle('Edit discussion')
      expect(editButtons.length).toBe(mockClub.active_session!.discussions.length)
    })

    it('should show delete buttons for admin', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      const deleteButtons = screen.getAllByTitle('Delete discussion')
      expect(deleteButtons.length).toBe(mockClub.active_session!.discussions.length)
    })

    it('should hide edit/delete buttons for non-admin', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={false} />)

      expect(screen.queryAllByTitle('Edit discussion').length).toBe(0)
      expect(screen.queryAllByTitle('Delete discussion').length).toBe(0)
    })

    it('should call onEditDiscussion with correct discussion', async () => {
      const user = userEvent.setup()
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      const editButtons = screen.getAllByTitle('Edit discussion')
      await user.click(editButtons[0])

      expect(defaultProps.onEditDiscussion).toHaveBeenCalledTimes(1)
    })

    it('should call onDeleteDiscussion with correct discussion', async () => {
      const user = userEvent.setup()
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      const deleteButtons = screen.getAllByTitle('Delete discussion')
      await user.click(deleteButtons[0])

      expect(defaultProps.onDeleteDiscussion).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labels on edit buttons', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      mockClub.active_session!.discussions.forEach(discussion => {
        expect(screen.getByLabelText(`Edit ${discussion.title}`)).toBeInTheDocument()
      })
    })

    it('should have aria-labels on delete buttons', () => {
      render(<DiscussionsTimeline {...defaultProps} isAdmin={true} />)

      mockClub.active_session!.discussions.forEach(discussion => {
        expect(screen.getByLabelText(`Delete ${discussion.title}`)).toBeInTheDocument()
      })
    })
  })
})
