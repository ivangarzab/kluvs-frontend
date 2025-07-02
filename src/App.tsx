import { useAuth } from './hooks/useAuth'
import ClubsDashboard from './ClubsDashboard'
import LoginPage from './LoginPage'

function App() {
  const { user, loading } = useAuth()

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-r-transparent mx-auto shadow-lg"></div>
          <p className="mt-6 text-white/90 text-lg font-medium">Loading your library...</p>
          <div className="mt-2 text-blue-200 text-sm">📚 Checking authentication</div>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show dashboard if authenticated
  return <ClubsDashboard />
}

export default App