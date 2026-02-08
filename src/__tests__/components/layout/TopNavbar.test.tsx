import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopNavbar from '../../../components/layout/TopNavbar'
import { mockServer, mockServer2 } from '../../utils/mocks'

// Mock useAuth
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    member: {
      id: 1,
      name: 'Test User',
      role: 'admin',
    },
    refreshMemberData: vi.fn(),
    isAdmin: true,
  }),
}))

// Mock ThemeToggle
vi.mock('../../../components/ThemeToggle', () => ({
  default: () => <button data-testid="theme-toggle">Theme</button>,
}))

// Mock modals (TopNavbar renders SignOutModal and EditProfileModal)
vi.mock('../../../components/modals/SignOutModal', () => ({
  default: ({ isOpen }: any) => isOpen ? <div data-testid="sign-out-modal">Sign Out Modal</div> : null,
}))
vi.mock('../../../components/modals/EditProfileModal', () => ({
  default: ({ isOpen }: any) => isOpen ? <div data-testid="edit-profile-modal">Edit Profile Modal</div> : null,
}))

describe('TopNavbar', () => {
  const defaultProps = {
    servers: [mockServer],
    selectedServer: mockServer.id,
    onServerChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should display Kluvs brand name', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.getByText('Kluvs')).toBeInTheDocument()
    })

    it('should display user name', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should display admin badge', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('should render ThemeToggle', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })
  })

  describe('Server Selector', () => {
    it('should show server selector when multiple servers exist', () => {
      render(<TopNavbar {...defaultProps} servers={[mockServer, mockServer2]} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should hide server selector when only one server', () => {
      render(<TopNavbar {...defaultProps} servers={[mockServer]} />)

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('should call onServerChange when selection changes', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} servers={[mockServer, mockServer2]} />)

      const selector = screen.getByRole('combobox')
      await user.selectOptions(selector, mockServer2.id)

      expect(defaultProps.onServerChange).toHaveBeenCalledWith(mockServer2.id)
    })
  })

  describe('Hamburger Menu', () => {
    it('should show hamburger when onMenuToggle is provided', () => {
      render(<TopNavbar {...defaultProps} onMenuToggle={vi.fn()} />)

      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument()
    })

    it('should not show hamburger when onMenuToggle is not provided', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.queryByLabelText('Open navigation menu')).not.toBeInTheDocument()
    })

    it('should call onMenuToggle when hamburger is clicked', async () => {
      const onMenuToggle = vi.fn()
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} onMenuToggle={onMenuToggle} />)

      await user.click(screen.getByLabelText('Open navigation menu'))

      expect(onMenuToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('User Menu', () => {
    it('should have user menu button with aria attributes', () => {
      render(<TopNavbar {...defaultProps} />)

      const menuButton = screen.getByLabelText('User menu')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should open user menu on click', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} />)

      await user.click(screen.getByLabelText('User menu'))

      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Edit Profile' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument()
    })

    it('should set aria-expanded to true when menu is open', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} />)

      await user.click(screen.getByLabelText('User menu'))

      expect(screen.getByLabelText('User menu')).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close menu when clicking backdrop', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} />)

      // Open menu
      await user.click(screen.getByLabelText('User menu'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click backdrop
      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
      await user.click(backdrop)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should open Edit Profile modal from menu', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} />)

      await user.click(screen.getByLabelText('User menu'))
      await user.click(screen.getByRole('menuitem', { name: 'Edit Profile' }))

      expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument()
    })

    it('should open Sign Out modal from menu', async () => {
      const user = userEvent.setup()
      render(<TopNavbar {...defaultProps} />)

      await user.click(screen.getByLabelText('User menu'))
      await user.click(screen.getByRole('menuitem', { name: 'Sign Out' }))

      expect(screen.getByTestId('sign-out-modal')).toBeInTheDocument()
    })
  })

  describe('User Initial Avatar', () => {
    it('should display first letter of user name', () => {
      render(<TopNavbar {...defaultProps} />)

      expect(screen.getByText('T')).toBeInTheDocument() // First letter of "Test User"
    })
  })
})
