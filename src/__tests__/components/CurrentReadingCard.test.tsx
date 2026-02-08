import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CurrentReadingCard from '../../components/CurrentReadingCard'
import { mockClub, mockClub2 } from '../utils/mocks'

describe('CurrentReadingCard', () => {
  const defaultProps = {
    selectedClub: mockClub,
    isAdmin: true,
    onEditBook: vi.fn(),
    onNewSession: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Active Session', () => {
    it('should display book title and author', () => {
      render(<CurrentReadingCard {...defaultProps} />)

      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
      expect(screen.getByText(/F. Scott Fitzgerald/)).toBeInTheDocument()
    })

    it('should display year when present', () => {
      render(<CurrentReadingCard {...defaultProps} />)

      expect(screen.getByText(/1925/)).toBeInTheDocument()
    })

    it('should display edition when present', () => {
      render(<CurrentReadingCard {...defaultProps} />)

      expect(screen.getByText(/First Edition/)).toBeInTheDocument()
    })

    it('should display due date', () => {
      render(<CurrentReadingCard {...defaultProps} />)

      expect(screen.getByText('Due Date')).toBeInTheDocument()
      // Due date is formatted via toLocaleDateString
      expect(screen.getByText(new Date('2024-12-31').toLocaleDateString())).toBeInTheDocument()
    })

    it('should show Currently Reading header', () => {
      render(<CurrentReadingCard {...defaultProps} />)

      expect(screen.getByText('Currently Reading')).toBeInTheDocument()
      expect(screen.getByText('Active Session')).toBeInTheDocument()
    })
  })

  describe('Empty State (no active session)', () => {
    it('should show empty state when no active session', () => {
      render(<CurrentReadingCard {...defaultProps} selectedClub={mockClub2} />)

      expect(screen.getByText('No Active Reading')).toBeInTheDocument()
      expect(screen.getByText(/doesn't have an active reading session/)).toBeInTheDocument()
    })

    it('should show Start New Session button for admin', () => {
      render(<CurrentReadingCard {...defaultProps} selectedClub={mockClub2} isAdmin={true} />)

      expect(screen.getByRole('button', { name: /Start New Session/i })).toBeInTheDocument()
    })

    it('should hide Start New Session button for non-admin', () => {
      render(<CurrentReadingCard {...defaultProps} selectedClub={mockClub2} isAdmin={false} />)

      expect(screen.queryByRole('button', { name: /Start New Session/i })).not.toBeInTheDocument()
    })

    it('should call onNewSession when Start New Session is clicked', async () => {
      const user = userEvent.setup()
      render(<CurrentReadingCard {...defaultProps} selectedClub={mockClub2} isAdmin={true} />)

      await user.click(screen.getByRole('button', { name: /Start New Session/i }))

      expect(defaultProps.onNewSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('Admin Controls', () => {
    it('should show Edit Book and New Session buttons for admin', () => {
      render(<CurrentReadingCard {...defaultProps} isAdmin={true} />)

      expect(screen.getByRole('button', { name: /Edit Book/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /New Session/i })).toBeInTheDocument()
    })

    it('should hide admin buttons for non-admin', () => {
      render(<CurrentReadingCard {...defaultProps} isAdmin={false} />)

      expect(screen.queryByRole('button', { name: /Edit Book/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /New Session/i })).not.toBeInTheDocument()
    })

    it('should call onEditBook when Edit Book is clicked', async () => {
      const user = userEvent.setup()
      render(<CurrentReadingCard {...defaultProps} isAdmin={true} />)

      await user.click(screen.getByRole('button', { name: /Edit Book/i }))

      expect(defaultProps.onEditBook).toHaveBeenCalledTimes(1)
    })

    it('should call onNewSession when New Session is clicked', async () => {
      const user = userEvent.setup()
      render(<CurrentReadingCard {...defaultProps} isAdmin={true} />)

      await user.click(screen.getByRole('button', { name: /New Session/i }))

      expect(defaultProps.onNewSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('Next Discussion', () => {
    it('should show next discussion section when upcoming discussions exist', () => {
      // mockClub has discussions with future dates? Let's use a club with a future discussion
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const clubWithFutureDiscussion = {
        ...mockClub,
        active_session: {
          ...mockClub.active_session!,
          discussions: [
            {
              id: 'future-disc',
              title: 'Upcoming Discussion',
              date: futureDate.toISOString(),
              location: 'Library',
            },
          ],
        },
      }

      render(<CurrentReadingCard {...defaultProps} selectedClub={clubWithFutureDiscussion} />)

      expect(screen.getByText('Next Discussion')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Discussion')).toBeInTheDocument()
      expect(screen.getByText('Library')).toBeInTheDocument()
    })
  })
})
