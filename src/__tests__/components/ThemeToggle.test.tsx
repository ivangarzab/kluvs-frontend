import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../../components/ThemeToggle'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Helper to render with ThemeProvider
function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  describe('Rendering', () => {
    it('should render the toggle button', () => {
      renderWithTheme()

      // Default is 'system'
      expect(screen.getByRole('button', { name: /Theme: System/i })).toBeInTheDocument()
    })

    it('should show System label by default', () => {
      renderWithTheme()

      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  describe('Theme Cycling', () => {
    it('should cycle from system to light on first click', async () => {
      const user = userEvent.setup()
      renderWithTheme()

      await user.click(screen.getByRole('button', { name: /Theme/i }))

      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('should cycle from light to dark on second click', async () => {
      const user = userEvent.setup()
      renderWithTheme()

      const button = screen.getByRole('button', { name: /Theme/i })
      await user.click(button) // system -> light
      await user.click(button) // light -> dark

      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('should cycle from dark back to system on third click', async () => {
      const user = userEvent.setup()
      renderWithTheme()

      const button = screen.getByRole('button', { name: /Theme/i })
      await user.click(button) // system -> light
      await user.click(button) // light -> dark
      await user.click(button) // dark -> system

      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  describe('Persistence', () => {
    it('should save theme choice to localStorage', async () => {
      const user = userEvent.setup()
      renderWithTheme()

      await user.click(screen.getByRole('button', { name: /Theme/i }))

      expect(localStorage.getItem('kluvs-theme')).toBe('light')
    })

    it('should restore theme from localStorage', () => {
      localStorage.setItem('kluvs-theme', 'dark')
      renderWithTheme()

      expect(screen.getByText('Dark')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive aria-label', () => {
      renderWithTheme()

      const button = screen.getByRole('button', { name: /Theme: System. Click to change./i })
      expect(button).toBeInTheDocument()
    })

    it('should have title attribute', () => {
      renderWithTheme()

      expect(screen.getByTitle('Theme: System')).toBeInTheDocument()
    })
  })
})
