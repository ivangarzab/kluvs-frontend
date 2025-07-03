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
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {{
    try {
      setLoading(true)
      await signOut()
      // No need to close modal - user will be redirected to login page
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
    }}
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-sm shadow-2xl">
        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-xl">👋</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sign Out?</h2>
          <p className="text-blue-200/70 text-sm">You'll be redirected to the login page</p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-blue-300/30"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Signing Out...</span>
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}