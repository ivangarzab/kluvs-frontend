import { vi } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

// Create a mock Supabase client
export function createMockSupabaseClient() {
  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: null as any, // Will be set by tests
  }

  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { provider: 'discord', url: 'https://discord.com/oauth' },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: vi.fn((callback) => {
        // Return subscription object
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    },
  }
}

// Helper to create mock user
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      full_name: 'Test User',
      name: 'Test User',
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as User
}

// Helper to set up auth mocks with a specific user
export function setupAuthMocks(
  mockClient: ReturnType<typeof createMockSupabaseClient>,
  user: User | null
) {
  const mockSession = user
    ? {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user,
      }
    : null

  mockClient.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })

  return mockSession
}

// Helper to mock Edge Function responses
export function mockEdgeFunctionResponse(
  mockClient: ReturnType<typeof createMockSupabaseClient>,
  endpoint: string,
  response: { data?: any; error?: any }
) {
  mockClient.functions.invoke.mockImplementation((name: string) => {
    if (name.startsWith(endpoint)) {
      return Promise.resolve(response)
    }
    return Promise.resolve({ data: null, error: null })
  })
}
