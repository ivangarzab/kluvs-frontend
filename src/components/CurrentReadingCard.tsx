import type { Club } from '../types'

interface CurrentReadingCardProps {
  selectedClub: Club
  isAdmin: boolean
  onEditBook: () => void
  onNewSession: () => void
}

export default function CurrentReadingCard({
  selectedClub,
  isAdmin,
  onEditBook,
  onNewSession
}: CurrentReadingCardProps) {
  if (!selectedClub.active_session) {
    // Empty state when no active session
    return (
      <div className="bg-[var(--color-bg-raised)] rounded-card border border-[var(--color-divider)] p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="text-section-heading text-[var(--color-text-primary)] mb-3">No Active Reading</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">This club doesn't have an active reading session. Start one to get the conversation going!</p>
          {isAdmin && (
            <button
              onClick={onNewSession}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-btn font-medium transition-colors"
            >
              + Start New Session
            </button>
          )}
        </div>
      </div>
    )
  }

  // Helper function to get next upcoming discussion
  const getNextDiscussion = () => {
    const now = new Date()
    const upcomingDiscussions = selectedClub.active_session!.discussions
      .filter(discussion => new Date(discussion.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return upcomingDiscussions[0] || null
  }

  const nextDiscussion = getNextDiscussion()

  // Active session state
  return (
    <div className="bg-[var(--color-bg-raised)] rounded-card border border-[var(--color-divider)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-divider)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h2 className="text-section-heading text-[var(--color-text-primary)]">
                Currently Reading
              </h2>
              <p className="text-helper text-[var(--color-text-secondary)]">Active Session</p>
            </div>
          </div>

          {/* Action Buttons Area - Top Right */}
          {isAdmin && (
            <div className="hidden md:flex space-x-3">
              <button
                onClick={onEditBook}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-4 py-2 rounded-btn text-sm font-medium transition-colors border border-[var(--color-divider)] hover:border-[var(--color-text-secondary)]"
              >
                Edit Book
              </button>
              <button
                onClick={onNewSession}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn text-sm font-medium transition-colors"
              >
                New Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Book Details */}
      <div className="p-6">
        <h3 className="text-card-heading text-[var(--color-text-primary)] mb-1">
          {selectedClub.active_session.book.title}
        </h3>
        <p className="text-body-lg text-[var(--color-text-secondary)] mb-4 font-medium">
          by {selectedClub.active_session.book.author}{selectedClub.active_session.book.year && ` (${selectedClub.active_session.book.year})`}
        </p>

        {selectedClub.active_session.book.edition && (
          <p className="text-[var(--color-text-secondary)] text-body mb-4">
            {selectedClub.active_session.book.edition} Edition
          </p>
        )}

        {/* Info Row: Due Date + Next Discussion */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Due Date */}
          {selectedClub.active_session.due_date && (
            <div className="flex items-center bg-primary/10 rounded-lg px-4 py-3 border-l-4 border-l-primary flex-1">
              <svg className="w-5 h-5 text-primary mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-helper text-[var(--color-text-secondary)] font-medium">Due Date</p>
                <p className="text-body text-[var(--color-text-primary)] font-semibold">
                  {new Date(selectedClub.active_session.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Next Discussion */}
          {nextDiscussion && (
            <div className="flex items-center bg-tertiary/10 rounded-lg px-4 py-3 border-l-4 border-l-tertiary flex-1">
              <svg className="w-5 h-5 text-tertiary mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-helper text-[var(--color-text-secondary)] font-medium">Next Discussion</p>
                <p className="text-body text-[var(--color-text-primary)] font-semibold truncate">{nextDiscussion.title}</p>
                <div className="flex items-center mt-0.5 gap-3 text-helper text-[var(--color-text-secondary)]">
                  <span>{new Date(nextDiscussion.date).toLocaleDateString()}</span>
                  {nextDiscussion.location && (
                    <span className="truncate">{nextDiscussion.location}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
