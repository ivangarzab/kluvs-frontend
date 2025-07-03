import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Member } from '../../types'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated: () => void
  onError: (error: string) => void
  currentMember: Member | null 
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
  onError,
  currentMember
}: EditProfileModalProps) {
  const { member } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  // Pre-populate form when modal opens
  useEffect(() => {
    if (isOpen && currentMember) {
      setName(currentMember.name)  // Use the fresh data passed from parent
    }
  }, [isOpen, currentMember])

  const handleSubmit = async () => {
    if (!name.trim()) {
      onError('Name is required')
      return
    }
  
    if (!member) {
      onError('No member data found')
      return
    }
  
    try {
      setLoading(true)
      onError('') // Clear any existing errors
  
      // Use the EXACT same pattern as MemberModal
      const requestBody = {
        id: member.id,
        name: name.trim(),
        points: member.points,
        books_read: member.books_read
      }
  
      console.log('Updating member with:', requestBody)
  
      const { data, error } = await supabase.functions.invoke('member', {
        method: 'PUT',
        body: requestBody
      })
  
      console.log('Update response:', { data, error })
  
      if (error) throw error
  
      onClose()
      onProfileUpdated()
  
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to update profile'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName(member?.name || '')
    onError('') // Clear errors when closing
    onClose()
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">✏️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <p className="text-blue-200/70 text-sm">Update your display name</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            disabled={loading}
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Display Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={100}
              autoFocus
            />
            <p className="text-blue-200/60 text-xs mt-1">
              💡 This is how your name appears to other members
            </p>
          </div>

          {/* Current Stats Display */}
          <div className="bg-white/5 border border-blue-300/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-blue-200/80">
                <span className="flex items-center">
                  📚 {member.books_read} books
                </span>
                <span className="flex items-center">
                  ⭐ {member.points} pts
                </span>
              </div>
              <p className="text-blue-200/60 text-xs">Read-only stats</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || name.trim() === member.name}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Updating...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}