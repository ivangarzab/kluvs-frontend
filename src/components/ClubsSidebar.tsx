import { useAuth } from '../hooks/useAuth'
import type { Server, Club } from '../types'
import { useState } from 'react'
import SignOutModal from './modals/SignOutModal'

interface ClubsSidebarProps {
  selectedServerData: Server | undefined
  selectedClub: Club | null
  onClubSelect: (clubId: string) => void
  onAddClub: () => void
  onDeleteClub: (club: { id: string; name: string }) => void
}

export default function ClubsSidebar({
  selectedServerData,
  selectedClub,
  onClubSelect,
  onAddClub,
  onDeleteClub
}: ClubsSidebarProps) {
  const { user, member, signOut } = useAuth()

  const [showSignOutModal, setShowSignOutModal] = useState(false)

  return (
    <div className="lg:col-span-1">
      <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 overflow-hidden shadow-2xl">
        
        {/* Member Profile Section */}
        {user && (
          <>
            <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-orange-600/20 to-blue-600/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">👤</span>
                    Profile
                  </h2>
                  {user.email === 'ivangb6@gmail.com' && (
                    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-200 rounded-full border border-orange-400/30">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Member Profile Content */}
            <div className="p-6 border-b border-blue-300/20">
              <div className="flex items-start space-x-3 mb-4">
                {/* Profile "spine" indicator */}
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-orange-400 to-blue-500"></div>
                
                <div className="flex-1 min-w-0">
                  {/* Member Name */}
                  <h3 className="font-bold text-white text-lg mb-2 truncate">
                    {member?.name || user.user_metadata?.full_name || user.email}
                  </h3>
                  
                  {/* Stats */}
                  {member ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-blue-200/80">
                        <span className="flex items-center">
                          📚 {member.books_read} books
                        </span>
                        <span className="flex items-center">
                          ⭐ {member.points} pts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-blue-200/60 text-sm">Loading member data...</p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons - underneath profile data */}
              <div className="flex items-center justify-between">
                <button 
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30"
                  onClick={() => {
                    // TODO: Open edit modal
                    console.log('Edit profile clicked')
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => setShowSignOutModal(true)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-400/30"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Clubs Section */}
        <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-blue-600/20 to-orange-600/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center">
                <span className="mr-2">📚</span>
                Clubs
              </h2>
              <p className="text-blue-200/70 text-sm">{selectedServerData?.clubs.length || 0} active clubs</p>
            </div>
            {import.meta.env.VITE_DEV === 'true' && (
              <button 
                onClick={onAddClub}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-400/30"
              >
                Add Club
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {selectedServerData?.clubs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-white/60 font-medium">No clubs found</p>
              <p className="text-blue-200/50 text-sm mt-1">Create your first book club!</p>
            </div>
          ) : (
            selectedServerData?.clubs.map((club, index) => (
              <div 
                key={club.id}
                className={`relative p-4 cursor-pointer transition-all duration-300 border-b border-white/5 last:border-b-0 hover:bg-white/8 group ${
                  selectedClub?.id === club.id ? 'bg-blue-500/20 border-r-4 border-orange-400 shadow-lg' : ''
                }`}
                style={{
                  background: selectedClub?.id === club.id 
                    ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)'
                    : undefined
                }}
              >
                {/* Delete Button - Top Right, appears on hover */}
                {import.meta.env.VITE_DEV === 'true' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent club selection
                      onDeleteClub({ id: club.id, name: club.name })
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 p-1.5 rounded-lg border border-red-400/30 hover:border-red-400/50"
                    title={`Delete ${club.name}`}
                  >
                    <span className="text-sm">🗑️</span>
                  </button>
                )}

                {/* Club Content - clickable area */}
                <div 
                  onClick={() => {
                    console.log(`Club selected: ${club.name} (${club.id})`)
                    onClubSelect(club.id)
                  }}
                  className="flex items-start space-x-3"
                >
                  <div className={`w-1 h-12 rounded-full bg-gradient-to-b transition-all duration-200 ${
                    selectedClub?.id === club.id 
                      ? 'from-orange-400 to-blue-500' 
                      : 'from-blue-400 to-blue-600 group-hover:from-orange-400 group-hover:to-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-blue-200 transition-colors truncate">
                      {club.name}
                    </h3>
                    {club.discord_channel && (
                      <p className="text-sm text-blue-300/80 mt-1">#{club.discord_channel}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-white/60">Active club</p>
                      <div className={`h-2 w-2 rounded-full transition-all duration-200 ${
                        selectedClub?.id === club.id ? 'bg-orange-400 animate-pulse' : 'bg-blue-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Add this after your component's JSX */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
    </div>
  )
}