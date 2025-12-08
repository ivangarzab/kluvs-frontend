import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { AuthProvider } from '../../contexts/AuthContext'

// Custom render function that includes AuthProvider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
}

export function renderWithAuth(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { withAuth = true, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (withAuth) {
      return <AuthProvider>{children}</AuthProvider>
    }
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithAuth as render }
