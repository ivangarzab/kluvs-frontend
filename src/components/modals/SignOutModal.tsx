// src/components/modals/SignOutModal.tsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface SignOutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignOutModal({
  isOpen,
  onClose
}: SignOutModalProps) {
  const { user, member, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {{
    try {
      setLoading(true)
      await signOut()
      // No need to close modal - user will be redirected to login page
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
      // Could add error handling here if needed
    }
  }}

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">👋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sign Out</h2>
              <p className="text-blue-200/70 text-sm">Are you sure you want to leave?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            disabled={loading}
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Confirmation Content */}
        <div className="mb-6">
          <p className="text-white mb-4">
            You'll be signed out of your account and redirected to the login page.
          </p>
          
          {/* User Info */}
          {user && (
            <div className="bg-white/5 border border-blue-300/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">👤</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {member?.name || user.user_metadata?.full_name || user.email}
                  </p>
                  {member && (
                    <div className="flex items-center space-x-3 text-sm text-blue-200/80">
                      <span>📚 {member.books_read} books</span>
                      <span>⭐ {member.points} pts</span>
                    </div>
                  )}
                  {user.email === 'ivangb6@gmail.com' && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-500/20 text-orange-200 rounded-full border border-orange-400/30">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-blue-200 text-sm font-medium">
              💡 You can sign back in anytime with Discord or Google
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors font-medium"
            disabled={loading}
          >
            Stay Signed In
          </button>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}