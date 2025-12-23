# Testing Strategy

This document outlines the testing approach, quality checks, and CI/CD pipeline for the Kluvs Frontend project.

## Table of Contents

- [Overview](#overview)
- [Testing Framework](#testing-framework)
- [Quality Checks](#quality-checks)
- [Code Coverage](#code-coverage)
- [CI/CD Pipeline](#cicd-pipeline)
- [Local Development](#local-development)
- [Writing Tests](#writing-tests)

## Overview

The project uses a comprehensive testing strategy that includes:

- **Unit/Component Tests**: Testing individual React components and functions
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Static type checking
- **Code Coverage**: Measuring test coverage with Codecov integration
- **Automated CI/CD**: Running all checks on every push and pull request

## Testing Framework

### Stack

- **Test Runner**: [Vitest](https://vitest.dev/) v4.0.15
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) v16.3.0
- **DOM Matchers**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) v6.9.1
- **User Interactions**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) v14.6.1
- **Coverage Provider**: [V8](https://v8.dev/blog/javascript-code-coverage)

### Configuration

Tests are configured in `vitest.config.ts`:

```typescript
{
  test: {
    globals: true,              // Enable global test APIs (describe, it, expect)
    environment: 'jsdom',       // DOM environment for React components
    setupFiles: ['./src/__tests__/setup.ts'],  // Test setup and matchers
    css: true,                  // Process CSS imports
  }
}
```

### Setup

The test setup file (`src/__tests__/setup.ts`) configures:

- **jest-dom matchers**: Extends Vitest's `expect` with DOM-specific matchers
- **Cleanup**: Automatically cleans up after each test
- **Mocks**: Global mocks for `window.matchMedia`, `IntersectionObserver`, and `crypto.randomUUID`

**Important**: The `src/__tests__/vitest.d.ts` type declaration file augments Vitest's types to include jest-dom matchers. Without this file, TypeScript will show errors for matchers like `toBeInTheDocument()`.

### Test Utilities

Custom test utilities are located in `src/__tests__/utils/`:

- **test-utils.tsx**: Custom `render` function with `AuthProvider` wrapper
- **mocks.ts**: Mock data for clubs, members, servers, and sessions
- **supabase-mock.ts**: Mock Supabase client and helper functions

## Quality Checks

### 1. Linting (ESLint)

ESLint enforces code quality and style standards.

**Configuration**: `eslint.config.js`

**Run locally**:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Key rules**:
- React hooks rules (exhaustive-deps)
- TypeScript strict rules
- React refresh rules
- No unused variables (warnings in test files)

**Test file overrides**: Test files have relaxed rules for `any` types and unused variables.

### 2. Type Checking (TypeScript)

TypeScript provides static type analysis.

**Configuration**: `tsconfig.json`, `tsconfig.app.json`

**Run locally**:
```bash
npm run type-check
```

**Important settings**:
- `verbatimModuleSyntax: true` - Requires explicit `type` imports for types
- `strict: true` - Enables all strict type checking
- `noUnusedLocals: true` - Errors on unused variables

### 3. Build Verification

The build process runs TypeScript compilation followed by Vite bundling.

**Run locally**:
```bash
npm run build
```

This ensures:
- All TypeScript types are valid
- Code bundles successfully
- No runtime imports of type-only modules

## Code Coverage

### Targets

Coverage thresholds are set in `vitest.config.ts`:

| Metric     | Threshold |
|------------|-----------|
| Lines      |    80%    |
| Functions  |    80%    |
| Branches   |    75%    |
| Statements |    80%    |

### Excluded Files

The following are excluded from coverage:

- `src/__tests__/**` - Test files and utilities
- `**/*.test.{ts,tsx}` - Test files
- `**/*.config.{ts,js}` - Configuration files
- `dist/` - Build output
- `node_modules/` - Dependencies

### Running Coverage Locally

```bash
npm run test:coverage    # Run tests with coverage report
```

Coverage reports are generated in multiple formats:
- **Terminal**: Text summary in console
- **HTML**: Interactive report in `coverage/` directory
- **LCOV**: Machine-readable format for CI/CD

### Codecov Integration

Coverage results are automatically uploaded to [Codecov](https://codecov.io) on every CI run.

**Configuration**: `codecov.yml`

**Codecov settings**:
- **Project coverage target**: 80% (±1% threshold)
- **Patch coverage target**: 75% (±2% threshold)
- **Fail CI if coverage decreases**: Yes
- **PR comments**: Enabled with detailed coverage diff

Codecov provides:
- Coverage trends over time
- Pull request coverage reports
- File-by-file coverage breakdown
- Coverage diff for changes

## CI/CD Pipeline

The CI/CD pipeline runs on every push and pull request to `main`.

**Configuration**: `.github/workflows/ci.yml`

### Pipeline Stages

#### 1. Test & Coverage Job

Runs on: `ubuntu-latest` with Node.js 20.x

**Steps**:

1. **Checkout code** - Fetches repository
2. **Setup Node.js** - Installs Node 20.x with npm cache
3. **Install dependencies** - Runs `npm ci` for reproducible installs
4. **Run linter** - `npm run lint` (fails on errors, not warnings)
5. **Run type check** - `npm run type-check` (fails on type errors)
6. **Run tests with coverage** - `npm run test:coverage` (fails if coverage below thresholds)
7. **Upload coverage to Codecov** - Sends LCOV report to Codecov with `CODECOV_TOKEN` secret

**Failure conditions**:
- Any linting errors (warnings allowed)
- Any TypeScript type errors
- Any test failures
- Coverage below thresholds (80% lines, 80% functions, 75% branches, 80% statements)
- Codecov upload failure

#### 2. Build Job

Runs on: `ubuntu-latest` with Node.js 20.x

**Depends on**: Test & Coverage job (only runs if tests pass)

**Steps**:

1. **Checkout code**
2. **Setup Node.js** - Node 20.x with npm cache
3. **Install dependencies** - `npm ci`
4. **Build project** - `npm run build` (TypeScript compile + Vite bundle)
5. **Upload build artifacts** - Saves `dist/` directory for 7 days

**Failure conditions**:
- Build errors (TypeScript or Vite)
- Missing dependencies

### Node.js Version

**Supported**: Node.js 20.x only

**Rationale**:
- Node 18 reaches End-of-Life in April 2025
- Vitest coverage provider (`@vitest/coverage-v8`) requires Node 20+ features (`node:inspector/promises`)
- Specified in `package.json`: `"engines": { "node": ">=20.0.0" }`

### CI Best Practices

- **Reproducible installs**: Uses `npm ci` instead of `npm install`
- **Dependency caching**: Caches npm dependencies for faster runs
- **Fail fast**: Stops on first failure
- **Artifact retention**: Keeps build artifacts for 7 days for debugging
- **Secret management**: Codecov token stored in GitHub Secrets

## Local Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Quality Checks

Before committing, run all quality checks:

```bash
# Run all checks (recommended)
npm run validate

# Or run individually
npm run lint
npm run type-check
npm run test:run
npm run build
```

The `validate` script runs: `lint && type-check && test:run`

### Pre-commit Checklist

- [ ] All tests pass (`npm run test:run`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Coverage meets thresholds (if you added new code)

## Writing Tests

### Test Structure

Tests are located in `src/__tests__/` with this structure:

```
src/__tests__/
├── setup.ts                    # Test configuration
├── vitest.d.ts                 # Type declarations for jest-dom matchers
├── utils/
│   ├── mocks.ts                # Mock data
│   ├── supabase-mock.ts        # Supabase mocks
│   └── test-utils.tsx          # Custom render utilities
├── components/
│   ├── ComponentName.test.tsx  # Component tests
│   └── modals/
│       └── ModalName.test.tsx
└── contexts/
    └── AuthContext.test.tsx    # Context tests
```

### Testing Patterns

#### Component Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../../components/MyComponent'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn()

    render(<MyComponent onClick={mockHandler} />)

    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})
```

#### Testing with AuthContext

```typescript
import { render, screen } from './utils/test-utils'  // Uses custom render with AuthProvider

describe('ProtectedComponent', () => {
  it('should render with auth context', () => {
    render(<ProtectedComponent />)
    // Component automatically wrapped with AuthProvider
  })
})
```

#### Mocking Supabase

```typescript
import { vi, beforeEach } from 'vitest'
import { supabase } from '../supabase'

vi.mock('../supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

describe('DataFetching', () => {
  beforeEach(() => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { id: 1, name: 'Test' },
      error: null,
    })
  })

  // Your tests...
})
```

### Common Matchers

From `@testing-library/jest-dom`:

- `toBeInTheDocument()` - Element exists in DOM
- `toBeVisible()` - Element is visible to user
- `toHaveTextContent(text)` - Element contains text
- `toHaveAttribute(attr, value)` - Element has attribute
- `toBeDisabled()` - Form element is disabled
- `toHaveValue(value)` - Input has specific value

### Test Coverage Tips

- **Test user behavior, not implementation**: Focus on what users see and do
- **Use accessible queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
- **Test error states**: Include tests for error handling and edge cases
- **Mock external dependencies**: Always mock Supabase, external APIs
- **Keep tests focused**: One assertion per test when possible
- **Use descriptive test names**: Clearly state what behavior is being tested

### Debugging Tests

```bash
# Run specific test file
npm test -- MembersTable.test.tsx

# Run tests matching pattern
npm test -- --grep "should render"

# Run with UI debugger
npm run test:ui

# Run with console output
npm test -- --reporter=verbose
```

## Troubleshooting

### Common Issues

#### "Property 'toBeInTheDocument' does not exist"

**Cause**: Missing or incorrect `vitest.d.ts` type declarations

**Fix**: Ensure `src/__tests__/vitest.d.ts` exists and contains:
```typescript
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
}
```

#### Linter passing locally but failing in CI

**Cause**: Different Node.js versions or cached files

**Fix**:
- Ensure you're using Node 20.x locally
- Delete `node_modules` and run `npm ci`
- Check for coverage files being linted (add `coverage/` to `.eslintignore`)

#### Type errors in build but not in `type-check`

**Cause**: `tsconfig.app.json` includes test files which have looser type rules

**Fix**: Already configured correctly - test files use type-only imports

#### Tests pass locally but fail in CI

**Cause**: Timing issues, missing mocks, or environment differences

**Fix**:
- Use `waitFor` for async operations
- Ensure all external calls are mocked
- Check for race conditions in tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Codecov Documentation](https://docs.codecov.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
