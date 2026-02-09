import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type ThemeChoice = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeChoice
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeChoice) => void
}

const STORAGE_KEY = 'kluvs-theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') return getSystemPreference()
  return choice
}

function applyTheme(resolved: ResolvedTheme) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme))

  const setTheme = useCallback((newTheme: ThemeChoice) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Apply theme on mount
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
