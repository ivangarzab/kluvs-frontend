import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../LoginPage'
import { ThemeProvider } from '../contexts/ThemeContext'

// Mock useAuth
const mockSignInWithDiscord = vi.fn()
const mockSignInWithGoogle = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    loading: false,
    signInWithDiscord: mockSignInWithDiscord,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

function renderLoginPage() {
  return render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithDiscord.mockResolvedValue(undefined)
    mockSignInWithGoogle.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should display welcome heading', () => {
      renderLoginPage()

      expect(screen.getByText('Welcome to your Kluvs')).toBeInTheDocument()
    })

    it('should display sign in subtitle', () => {
      renderLoginPage()

      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('should show Discord sign in button', () => {
      renderLoginPage()

      expect(screen.getByRole('button', { name: /Continue with Discord/i })).toBeInTheDocument()
    })

    it('should show Google sign in button', () => {
      renderLoginPage()

      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    })

    it('should show Supabase footer text', () => {
      renderLoginPage()

      expect(screen.getByText(/Secure authentication powered by Supabase/i)).toBeInTheDocument()
    })
  })

  describe('Discord Sign In', () => {
    it('should call signInWithDiscord on click', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Discord/i }))

      expect(mockSignInWithDiscord).toHaveBeenCalledTimes(1)
    })

    it('should show loading state during Discord sign in', async () => {
      mockSignInWithDiscord.mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Discord/i }))

      await waitFor(() => {
        expect(screen.getByText('Connecting to Discord...')).toBeInTheDocument()
      })
    })

    it('should disable both buttons during Discord sign in', async () => {
      mockSignInWithDiscord.mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Discord/i }))

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toBeDisabled()
        })
      })
    })
  })

  describe('Google Sign In', () => {
    it('should call signInWithGoogle on click', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Google/i }))

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('should show loading state during Google sign in', async () => {
      mockSignInWithGoogle.mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Google/i }))

      await waitFor(() => {
        expect(screen.getByText('Connecting to Google...')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should recover from Discord sign in error', async () => {
      mockSignInWithDiscord.mockRejectedValue(new Error('OAuth failed'))
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Discord/i }))

      // After error, button should be re-enabled with original text
      await waitFor(() => {
        expect(screen.getByText('Continue with Discord')).toBeInTheDocument()
      })
    })

    it('should recover from Google sign in error', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('OAuth failed'))
      const user = userEvent.setup()
      renderLoginPage()

      await user.click(screen.getByRole('button', { name: /Continue with Google/i }))

      await waitFor(() => {
        expect(screen.getByText('Continue with Google')).toBeInTheDocument()
      })
    })
  })
})
