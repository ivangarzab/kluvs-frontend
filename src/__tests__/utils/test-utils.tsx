import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Custom render function that includes AuthProvider and ThemeProvider
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
      return (
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      )
    }
    return <ThemeProvider>{children}</ThemeProvider>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithAuth as render }
