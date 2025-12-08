# Kluvs Frontend - Book Club Management App

A React + TypeScript web application for managing book clubs across multiple Discord servers. Track reading sessions, discussions, members, and club activities with OAuth authentication.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd kluvs-frontend

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git**
- **Supabase account** (for backend services)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Supabase client
- Testing libraries (Vitest, React Testing Library)

### 2. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

> **Note:** Never commit `.env.local` or `.env.production` files to Git. They're already in `.gitignore`.

### 3. Backend Setup

This frontend requires the [bookclub-api](https://github.com/yourusername/bookclub-api) backend to be deployed as Supabase Edge Functions.

**Backend compatibility:**
- Compatible with migrations up to: `20251130205915_add_metadata_fields.sql`
- See [CLAUDE.md](CLAUDE.md#backend-api-compatibility) for sync details

## 🏃 Running the App

### Development Mode

```bash
npm run dev
```

Starts the development server at `http://localhost:5173` with:
- Hot module reloading
- TypeScript type checking
- Fast refresh

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

Build output goes to `/dist` directory.

## 🧪 Testing

### Run Tests

```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Current coverage: **87 tests** across 4 test suites

- ✅ AuthContext: 18 tests (authentication flows)
- ✅ ClubsDashboard: 14 tests (main page logic)
- ✅ AddClubModal: 30 tests (modal workflows)
- ✅ MembersTable: 25 tests (role-based rendering)

Coverage goals: 80%+ statements/functions/lines, 75%+ branches

### Writing Tests

See [CLAUDE.md - Testing Section](CLAUDE.md#testing) for guidelines on writing tests.

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run test` | Run tests (watch mode) |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run type-check` | Run TypeScript type checking |
| `npm run validate` | Run lint + type-check + tests |

## 📁 Project Structure

```
kluvs-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── modals/         # Modal dialogs
│   │   ├── ClubsSidebar.tsx
│   │   ├── CurrentReadingCard.tsx
│   │   ├── DiscussionsTimeline.tsx
│   │   └── MembersTable.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── __tests__/          # Test files
│   │   ├── setup.ts
│   │   ├── utils/          # Test utilities & mocks
│   │   ├── contexts/       # Context tests
│   │   ├── components/     # Component tests
│   │   └── ClubsDashboard.test.tsx
│   ├── App.tsx             # Root component
│   ├── ClubsDashboard.tsx  # Main dashboard
│   ├── LoginPage.tsx       # OAuth login
│   └── supabase.ts         # Supabase client config
├── public/                 # Static assets
├── .env.local             # Local environment vars (create this)
├── .env.production        # Production env vars
├── package.json           # Dependencies & scripts
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Test configuration
├── tailwind.config.js     # Tailwind CSS config
└── tsconfig.json          # TypeScript config
```

## 🔐 Authentication

The app uses **OAuth 2.0** with Supabase Auth for authentication:

- **Providers:** Discord, Google
- **Session:** Stored in localStorage with auto-refresh
- **Roles:** Admin (full access) vs Member (read-only)

### First-Time Login

1. Click "Sign in with Discord" or "Sign in with Google"
2. Authorize the app
3. You'll be redirected back to the dashboard
4. A member profile is automatically created

### Role Management

User roles are managed via the backend API. Contact an admin to upgrade your role from `member` to `admin`.

## 🎨 Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Backend:** Supabase (Edge Functions + Auth)
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint with TypeScript support

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify UI

### Other Platforms

The app is a static SPA that can be deployed anywhere that serves static files:
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🐛 Troubleshooting

### "Failed to fetch servers"

**Cause:** Backend Edge Functions not deployed or environment variables incorrect.

**Fix:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
2. Ensure backend Edge Functions are deployed
3. Check browser console for detailed errors

### "Sign in failed"

**Cause:** OAuth redirect URL not configured in Supabase.

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your app URL to "Site URL" and "Redirect URLs"
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`

### Tests failing

**Cause:** Dependencies not installed or stale cache.

**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Run tests
npm run test:run
```

## 📚 Additional Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive project documentation for AI assistants
  - Architecture overview
  - Component structure
  - Testing guidelines
  - Common tasks and patterns
  - Backend API compatibility

- **[Backend API](https://github.com/yourusername/bookclub-api)** - RESTful Edge Functions
  - API endpoints documentation
  - Database schema
  - Setup instructions

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run validation: `npm run validate`
4. Commit changes: `git commit -m "feat: add my feature"`
5. Push and create pull request

### Code Quality Checks

All PRs must pass:
- ✅ ESLint (no errors)
- ✅ TypeScript type checking (no errors)
- ✅ Tests (87 tests must pass)
- ✅ Build (must compile successfully)

Run `npm run validate` to check all of these locally.

## 📝 License

[Your License Here]

## 🙋 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/kluvs-frontend/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/kluvs-frontend/discussions)
- **Backend Repo:** [bookclub-api](https://github.com/yourusername/bookclub-api)

---

**Built with ❤️ using React + TypeScript + Supabase**
