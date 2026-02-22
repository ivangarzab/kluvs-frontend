Create a new public page for the kluvs-frontend project.

Ask the user for:
1. The page name (e.g. "Cookie Policy") — used for the component name (PascalCase) and content file (kebab-case)
2. The URL path (e.g. "/cookies")
3. The page type:
   - **Markdown-based** (legal/informational): content in `src/content/<name>.md`, rendered via `react-markdown`
   - **Interactive** (has forms, CTAs, dynamic state): content written directly in the TSX component

Then implement the following steps:

---

## For Markdown-based pages (PrivacyPolicy / TermsOfUse / DataDeletion pattern)

### 1. Create `src/content/<kebab-name>.md`
Draft placeholder content with clear `<!-- TODO -->` markers. Use the existing markdown files as reference for style and tone. Include a "Last updated" date at the top.

### 2. Create `src/pages/<PascalName>.tsx`
Use this exact shell pattern — no variations:
```tsx
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import content from '../content/<kebab-name>.md?raw'

export default function <PascalName>() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-divider)] px-6 py-4 flex items-center gap-3">
        <img src="/ic-mark.svg" alt="Kluvs" className="h-7 w-7" />
        <span className="text-section-heading text-[var(--color-text-primary)]">Kluvs</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-a:text-primary hover:prose-a:text-primary-hover">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-[var(--color-divider)]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Kluvs
          </Link>
        </div>
      </main>
    </div>
  )
}
```

### 3. Add route to `src/App.tsx`
Add **before** the `/app/*` route:
```tsx
import <PascalName> from './pages/<PascalName>'
// ...
<Route path="/<url-path>" element={<<PascalName> />} />
```

### 4. Create `src/__tests__/pages/<PascalName>.test.tsx`
Use `<MemoryRouter><ThemeProvider>` wrapper (no AuthProvider). Test groups:
- **Rendering**: logo (`alt="Kluvs"`), page title heading, "Back to Kluvs" link → `href="/"`
- **Section Headings**: one test per major `##` section in the markdown
- **Content**: 2–3 tests for key phrases, email addresses, or specific requirements

### 5. Update `CLAUDE.md`
- Add to project structure: `src/content/<kebab-name>.md` and `src/pages/<PascalName>.tsx`
- Add to Route Structure table
- Add to "Updating Legal Pages" section

---

## For Interactive pages (LandingPage pattern)

Write the content directly in the TSX component. Follow the design system:
- Backgrounds: `bg-[var(--color-bg)]` / `bg-[var(--color-bg-raised)]` alternating sections
- Typography: `text-page-heading`, `text-section-heading`, `text-card-heading`, `text-body-lg`, `text-body`, `text-helper`
- Cards: `bg-[var(--color-bg-raised)] rounded-card border border-[var(--color-divider)] p-6`
- Buttons: `bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn font-medium transition-colors`
- Inputs: `bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-input px-4 py-2`
- Always use CSS vars (`var(--color-*)`) for theme support

---

## Always verify
Run `npm run validate` after completing all steps. All tests must pass before stopping.
Stop and show the user the content file path so they can review/edit the placeholder content.
