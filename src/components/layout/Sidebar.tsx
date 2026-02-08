import type { Server, Club } from '../../types'

interface SidebarProps {
  selectedServerData: Server | undefined
  selectedClub: Club | null
  onClubSelect: (clubId: string) => void
  onAddClub: () => void
  onDeleteClub: (club: { id: string; name: string }) => void
  isAdmin: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({
  selectedServerData,
  selectedClub,
  onClubSelect,
  onAddClub,
  onDeleteClub,
  isAdmin,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarContent = (
    <>
      {/* Clubs Header */}
      <div className="p-4 border-b border-[var(--color-divider)]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-card-heading text-[var(--color-text-primary)]">Clubs</h2>
            <p className="text-helper text-[var(--color-text-secondary)]">
              {selectedServerData?.clubs.length || 0} active clubs
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onAddClub}
              className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-btn text-sm font-medium transition-colors"
            >
              Add Club
            </button>
          )}
        </div>
      </div>

      {/* Club List */}
      <div>
        {selectedServerData?.clubs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[var(--color-text-secondary)] font-medium">No clubs found</p>
            <p className="text-[var(--color-text-secondary)] text-helper mt-1">Create your first book club!</p>
          </div>
        ) : (
          selectedServerData?.clubs.map((club) => (
            <div
              key={club.id}
              className={`relative group cursor-pointer transition-colors border-b border-[var(--color-divider)] last:border-b-0 ${
                selectedClub?.id === club.id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-[var(--color-bg-elevated)] border-l-4 border-l-transparent'
              }`}
            >
              {/* Delete Button - appears on hover */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteClub({ id: club.id, name: club.name })
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-danger hover:text-danger-hover p-1 rounded"
                  title={`Delete ${club.name}`}
                  aria-label={`Delete ${club.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Club Content */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Select ${club.name}`}
                onClick={() => {
                  console.log(`Club selected: ${club.name} (${club.id})`)
                  onClubSelect(club.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClubSelect(club.id)
                  }
                }}
                className="p-4"
              >
                <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                  {club.name}
                </h3>
                {club.discord_channel && (
                  <p className="text-helper text-[var(--color-text-secondary)] mt-0.5">
                    #{club.discord_channel}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-[var(--color-bg-raised)] border-r border-[var(--color-divider)] overflow-y-auto transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--color-overlay)] lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed top-16 left-0 bottom-0 w-64 z-50 bg-[var(--color-bg-raised)] border-r border-[var(--color-divider)] overflow-y-auto lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
