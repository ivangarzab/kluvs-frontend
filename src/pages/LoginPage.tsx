import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-r-transparent mx-auto"></div>
          <p className="mt-6 text-[var(--color-text-primary)] text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <img src="/ic-mark.svg" alt="Kluvs" className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-page-heading text-[var(--color-text-primary)] mb-2">
            Welcome to your Kluvs
          </h1>
          <p className="text-[var(--color-text-secondary)] text-body-lg">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="space-y-4">
          {/* Discord Button */}
          <button
            onClick={handleDiscordSignIn}
            disabled={signingIn !== null}
            className="w-full flex items-center justify-center gap-3 bg-discord hover:bg-[#4752C4] disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-btn font-medium text-body-lg transition-colors"
          >
            {signingIn === 'discord' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Connecting to Discord...</span>
              </>
            ) : (
              <>
                <img src="/ic-discord.svg" alt="" className="h-5 w-5" />
                <span>Continue with Discord</span>
              </>
            )}
          </button>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn !== null}
            className="w-full flex items-center justify-center gap-3 bg-google-bg hover:bg-[#E8E8E8] dark:bg-google-bg dark:hover:bg-[#E8E8E8] disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-google-text dark:text-google-text px-6 py-3 rounded-btn font-medium text-body-lg transition-colors"
          >
            {signingIn === 'google' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-google-text border-t-transparent"></div>
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <img src="/ic-google.svg" alt="" className="h-5 w-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-[var(--color-divider)] space-y-2">
          <p className="text-center text-[var(--color-text-secondary)] text-helper">
            Secure authentication powered by Supabase
          </p>
          <p className="text-center text-helper space-x-3">
            <Link
              to="/privacy"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[var(--color-divider)]">·</span>
            <Link
              to="/terms"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline underline-offset-2 transition-colors"
            >
              Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
