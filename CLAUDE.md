# Kluvs Frontend - Book Club Management App

## Project Overview
A React + TypeScript web application for managing book clubs. Users can track reading sessions, discussions, members, and club activities across multiple book clubs and Discord servers.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Edge Functions)
- **Authentication**: OAuth via Discord and Google
- **Testing**: Vitest + React Testing Library

## Backend API Compatibility
- **Backend Repository**: `bookclub-api`
- **Compatible with migrations up to**: `20251130205915_add_metadata_fields.sql`
- **Last synced**: 2025-12-07
- **Sync notes**: Added new optional fields to TypeScript types:
  - `Member`: `user_id`, `handle`, `created_at`
  - `Book`: `id`, `page_count`
  - `Club`: `founded_date`

## Project Structure
```
src/
├── components/
│   ├── modals/              # Modal dialogs
│   │   ├── EditProfileModal.tsx
│   │   └── SignOutModal.tsx
│   ├── ClubsSidebar.tsx     # Left sidebar with clubs list & profile
│   ├── CurrentReadingCard.tsx
│   ├── DiscussionsTimeline.tsx
│   └── MembersTable.tsx
├── contexts/
│   └── AuthContext.tsx      # Authentication state management
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Root component with auth routing
├── ClubsDashboard.tsx       # Main dashboard view
├── LoginPage.tsx            # OAuth login page
└── supabase.ts              # Supabase client configuration
```

## Key Features

### Authentication System
- OAuth login with Discord and Google
- Session persistence via localStorage
- Auto token refresh
- Role-based access control (admin/member)
- Located in: `src/contexts/AuthContext.tsx`

### User Roles
- **Admin**: Full CRUD access to clubs, books, discussions, and members
- **Member**: Read-only access

The `isAdmin` flag is derived from `member.role === 'admin'` and propagated throughout components.

### Main Components

#### ClubsDashboard
The primary view showing:
- Server selector (admin only, when multiple servers)
- Club details with current reading session
- Discussions timeline
- Members table
- Loading states for data fetching

#### ClubsSidebar
Left sidebar containing:
- User profile section (name, stats, admin badge)
- Edit profile and sign out buttons
- List of clubs for selected server
- Add/delete club buttons (admin only)

#### AuthContext
Manages all authentication state:
- User session from Supabase Auth
- Member data lookup/creation via Edge Functions
- Prevents duplicate member lookups with `processingUserIdRef`
- Auto-creates member records for new OAuth users

## Data Flow

### Authentication Flow
1. User clicks "Sign in with Discord/Google"
2. OAuth redirect to provider
3. Provider redirects back with auth code
4. Supabase exchanges code for session tokens
5. `AuthContext` detects new user via `onAuthStateChange`
6. Looks up member by `user_id` via Edge Function
7. Creates new member if none exists
8. Sets `user` and `member` state
9. App shows `ClubsDashboard` (if logged in) or `LoginPage` (if not)

### Data Fetching
All data comes from Supabase Edge Functions:
- `GET /club?id={clubId}&server_id={serverId}` - Club details
- `GET /member?user_id={userId}` - Member lookup
- `POST /member` - Create member
- `PUT /member` - Update member

## Important Patterns

### Admin-Only Features
Replace `import.meta.env.VITE_DEV === 'true'` with `isAdmin` prop:
```tsx
{isAdmin && (
  <button onClick={handleAction}>Admin Action</button>
)}
```

### Loading States
- Initial app load: `AuthContext.loading` shows spinner
- Club data fetch: `clubLoading` state in ClubsDashboard
- Both use consistent spinner UI

### Member Updates
After updating member data, use `refreshMemberData()` from AuthContext instead of page reload:
```tsx
const { refreshMemberData } = useAuth()
await updateMember(...)
refreshMemberData()
```

## Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Git Branches
- `main` - Production branch
- `feature/login-page` - Authentication implementation (current branch)

## Recent Changes (feature/login-page branch)
- Implemented complete OAuth authentication system
- Added user profile management
- Replaced dev-mode checks with role-based access control
- Fixed sign out infinite spinner bug
- Added session persistence configuration

## Testing

### Test Infrastructure
- **Framework**: Vitest with jsdom environment
- **Testing Library**: React Testing Library + jest-dom matchers
- **Coverage Target**: 80%+ statements, functions, lines; 75%+ branches

### Running Tests
```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage report
npm run validate          # Run lint + type-check + tests
```

### Test Structure
```
src/__tests__/
├── setup.ts                      # Global test setup
├── utils/
│   ├── mocks.ts                  # Mock data (servers, clubs, members)
│   ├── test-utils.tsx            # Custom render functions
│   └── supabase-mock.ts          # Supabase client mocks
├── contexts/
│   └── AuthContext.test.tsx      # ✅ 18 tests (100% coverage)
├── components/
│   ├── ClubsSidebar.test.tsx
│   ├── MembersTable.test.tsx
│   └── modals/
│       └── AddClubModal.test.tsx
```

### Writing Tests
1. Import test utilities: `import { render, screen, waitFor } from '../__tests__/utils/test-utils'`
2. Import mocks: `import { mockAdminMember, mockClub } from '../__tests__/utils/mocks'`
3. Mock Supabase client if needed (see AuthContext.test.tsx for examples)
4. Use `renderWithAuth()` for components that need AuthContext
5. Test user interactions with `@testing-library/user-event`
6. Use `waitFor()` for async state updates

### Test Coverage
Current coverage (as of 2025-12-07):
- **AuthContext**: 18 tests covering all authentication flows

Priority test coverage (next to implement):
1. ClubsDashboard (main page logic)
2. Modal components (form validation, submission)
3. Table components (rendering, interactions)

## Common Tasks

### Adding a New Admin-Only Feature
1. Pass `isAdmin` prop from parent component
2. Conditionally render using `{isAdmin && ...}`
3. Test with both admin and member roles
4. Write tests for both states

### Creating a New Modal
1. Create modal component in `src/components/modals/`
2. Accept `isOpen`, `onClose` props
3. Use consistent styling (gradient bg, border, rounded-2xl)
4. Add state for modal in parent component
5. Write tests for open/close, validation, submission

### Fetching Data
1. Use Supabase Edge Functions via `supabase.functions.invoke()`
2. Handle loading state
3. Handle errors with try/catch
4. Log requests for debugging (see ClubsDashboard for examples)
5. Mock Edge Function responses in tests

## Known Issues
- None currently

## Future Enhancements
- [ ] Email/password authentication option
- [ ] Member notifications for new discussions
- [ ] Book search/import from external APIs
- [ ] Reading progress tracking
- [ ] Discussion voting/reactions
