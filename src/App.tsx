import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ClubsDashboard from './ClubsDashboard'
import LoginPage from './LoginPage'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-r-transparent mx-auto"></div>
          <p className="mt-6 text-[var(--color-text-primary)] text-lg font-medium">Loading your library...</p>
          <div className="mt-2 text-[var(--color-text-secondary)] text-sm">Checking authentication</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <ClubsDashboard />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App