// src/LoginPage.tsx
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'

export default function LoginPage() {
  const { loading, signInWithDiscord, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState<'discord' | 'google' | null>(null)

  const handleDiscordSignIn = async () => {
    try {
      setSigningIn('discord')
      await signInWithDiscord()
    } catch (error) {
      console.error('Discord sign in failed:', error)
      setSigningIn(null)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn('google')
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in failed:', error)
      setSigningIn(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-r-transparent mx-auto shadow-lg"></div>
          <p className="mt-6 text-white/90 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-3xl">📖</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 to-orange-200 bg-clip-text text-transparent mb-3">
            Book Club Central
          </h1>
          <p className="text-blue-200/70 text-lg font-medium">Welcome back, reader!</p>
          <p className="text-blue-300/60 text-sm mt-2">Sign in to access your reading community</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 p-8 shadow-2xl">
          <div className="space-y-4">
            {/* Discord Button */}
            <button
              onClick={handleDiscordSignIn}
              disabled={signingIn !== null}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100 transform"
            >
              {/* Discord brand colors background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#7289DA] opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <div className="relative flex items-center justify-center space-x-3">
                {signingIn === 'discord' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Connecting to Discord...</span>
                  </>
                ) : (
                  <>
                    <div className="text-2xl">🎮</div>
                    <span>Continue with Discord</span>
                  </>
                )}
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-300/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/8 text-blue-200/70 font-medium rounded-full">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn !== null}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100 transform"
            >
              {/* Google brand colors background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <div className="relative flex items-center justify-center space-x-3">
                {signingIn === 'google' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <div className="text-2xl">📧</div>
                    <span>Continue with Google</span>
                  </>
                )}
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-blue-300/20">
            <p className="text-center text-blue-200/60 text-sm">
              🔒 Secure authentication powered by Supabase
            </p>
            <p className="text-center text-blue-300/50 text-xs mt-2">
              Your data is protected and never shared with third parties
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center mt-8">
          <div className="text-blue-200/40 text-sm font-medium">
            📚 Ready to dive into some great literature? 📚
          </div>
        </div>
      </div>
    </div>
  )
}