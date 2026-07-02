# Personal Site Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild NovusEdge.github.io as a custom Vite + React 19 + TypeScript site (blog / portfolio / research) with an "open + anime" editorial design, prerendered for GitHub Pages.

**Architecture:** SPA with build-time prerendering (`vite-prerender-plugin`) so every route ships as static HTML. Blog content is markdown in `src/content/blog/*.md` imported via `import.meta.glob(?raw)` and parsed with a tiny frontmatter parser; portfolio/research are typed TS data files. GSAP drives reveals, scroll sections, and page wipes, all gated on `prefers-reduced-motion`.

**Tech Stack:** Vite 7, React 19, TypeScript (strict), react-router-dom v7, Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first config), GSAP + @gsap/react, react-markdown + remark-gfm + rehype-highlight, @tailwindcss/typography, vite-prerender-plugin, vitest.

**Working directory:** repo root `/home/novusedge/Projects/Personal/NovusEdge.github.io`. The repo currently contains only `docs/`, `OLD_CONTENT/`, `index.html` (dead Jekyll stub — overwrite it), and `googlecc0233a15c0e5531.html` (Google verification — must keep, moves to `public/`). Node v24 is installed.

## Global Constraints

- Colors, verbatim from spec: bone white `#f5f2eb`, charcoal black `#1a1a1a`, paper blue `#4a7095` (light) / `#6b8cae` (dark), gold `#d4a03c`, section tints `#e8e4da` (light) / `#242424` (dark).
- Color discipline: 90% bone/charcoal. Gold only for rare accents (active nav, selection, terminus dots, hero detail). Paper blue only for links/interactive.
- Typography: display = "Zen Kaku Gothic New", body = "Inter", mono = "JetBrains Mono" (small, uppercase, tracked-out for dates/tags/nav). Japanese text only as small structural labels (ブログ, 研究, 作品).
- Motion: `power3.out`, 0.6–0.8s, staggered reveals. Max one wipe per navigation. `prefers-reduced-motion: reduce` → no wipes/parallax/translation, opacity fades only.
- Anti-cheese: no particles, no glow, no neon, no anime characters.
- Components custom-built — no UI kit, no template.
- All commits on `main` (user's repo, already mid-rework). Commit message style: `feat: ...` / `chore: ...`.
- Every task ends with `npm run build` passing (after Task 1) and a commit.
- Dark mode = `.dark` class on `<html>`; never use Tailwind's default media-query dark.

---

### Task 1: Scaffold — Vite + React 19 + TypeScript + Tailwind v4 + theme

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `.gitignore`
- Overwrite: `index.html` (currently a dead Jekyll stub)
- Create: `src/styles/global.css`, `src/App.tsx`, `src/main.tsx`
- Move: `googlecc0233a15c0e5531.html` → `public/googlecc0233a15c0e5531.html`

**Interfaces:**
- Produces: Tailwind theme tokens (`bone`, `bone-tint`, `charcoal`, `charcoal-tint`, `paper`, `paper-deep`, `gold`), font utilities (`font-display`, `font-body`, `font-mono`), `.dark` class variant, `link-draw` CSS utility. `src/App.tsx` default export. Later tasks style exclusively with these tokens.

- [ ] **Step 1: Write config + entry files**

`package.json`:

```json
{
  "name": "novusedge-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.8.0",
    "vite": "^7.0.0"
  }
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`.gitignore`:

```
node_modules/
dist/
```

`index.html` (replace the Jekyll stub entirely). The inline script is the theme-flash guard from the spec — it must stay inline and run before paint:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NovusEdge</title>
    <script>
      (function () {
        var t = localStorage.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', t === 'dark')
      })()
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/styles/global.css` (Tailwind v4 CSS-first config — there is NO tailwind.config.js):

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-bone: #f5f2eb;
  --color-bone-tint: #e8e4da;
  --color-charcoal: #1a1a1a;
  --color-charcoal-tint: #242424;
  --color-paper: #6b8cae;
  --color-paper-deep: #4a7095;
  --color-gold: #d4a03c;

  --font-display: 'Zen Kaku Gothic New', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@layer base {
  html {
    @apply bg-bone text-charcoal font-body antialiased dark:bg-charcoal dark:text-bone;
  }
  ::selection {
    @apply bg-gold/30;
  }
}

/* Hover underline that draws left-to-right (spec: 150ms) */
@utility link-draw {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: left bottom;
  background-size: 0% 1px;
  transition: background-size 150ms ease-out;
  &:hover {
    background-size: 100% 1px;
  }
}
```

`src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-5xl font-black">
        Novus<span className="text-gold">Edge</span>
      </h1>
    </main>
  )
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Move the Google verification file**

```bash
mkdir -p public && git mv googlecc0233a15c0e5531.html public/
```

- [ ] **Step 3: Install and build**

Run: `npm install && npm run build`
Expected: `dist/` produced, no TS errors. Then `npm run dev` and confirm at http://localhost:5173: bone background, black "Novus" + gold "Edge" in Zen Kaku Gothic; with `document.documentElement.classList.add('dark')` in devtools console the page inverts to charcoal.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffold vite + react 19 + tailwind v4 with theme tokens"
```

---

### Task 2: Routing + prerender pipeline + page meta

**Files:**
- Modify: `package.json` (add `vite-prerender-plugin`), `vite.config.ts`, `src/main.tsx`, `src/App.tsx`
- Create: `src/lib/meta.tsx`
- Create stub routes: `src/routes/index.tsx`, `src/routes/blog/index.tsx`, `src/routes/blog/post.tsx`, `src/routes/portfolio/index.tsx`, `src/routes/portfolio/project.tsx`, `src/routes/research/index.tsx`, `src/routes/research/paper.tsx`, `src/routes/not-found.tsx`

**Interfaces:**
- Consumes: `App` from Task 1.
- Produces: `<Meta title?: string, description?: string>` component (call once per page, sets `document.title` client-side and prerender head server-side); `App` renders `<Routes>`; `main.tsx` exports `async function prerender(data: { url: string })`. Route components are default exports. Later tasks REPLACE the stub route files but keep their paths and default exports.

- [ ] **Step 1: Install plugin**

Run: `npm install -D vite-prerender-plugin`

- [ ] **Step 2: Meta helper**

`src/lib/meta.tsx`:

```tsx
import { useEffect } from 'react'

// ponytail: module-global head state — single render pass per prerendered page, no context needed
export const headState = { title: 'NovusEdge', description: 'Security, systems, and writeups — personal site of NovusEdge.' }

export function Meta({ title, description }: { title?: string; description?: string }) {
  headState.title = title ? `${title} — NovusEdge` : 'NovusEdge'
  if (description) headState.description = description
  useEffect(() => {
    document.title = headState.title
  }, [title])
  return null
}
```

- [ ] **Step 3: Stub routes**

Every stub is identical in shape — real content comes in later tasks. Example `src/routes/blog/index.tsx`:

```tsx
import { Meta } from '../../lib/meta'

export default function BlogIndex() {
  return (
    <>
      <Meta title="Blog" />
      <div className="px-6 pt-40 font-mono text-xs uppercase tracking-[0.3em]">blog — coming soon</div>
    </>
  )
}
```

Create all eight stubs the same way with these titles/names:

| File | Component | `<Meta title>` |
|---|---|---|
| `src/routes/index.tsx` | `Landing` | *(none — omit title prop)* |
| `src/routes/blog/index.tsx` | `BlogIndex` | `Blog` |
| `src/routes/blog/post.tsx` | `BlogPost` | `Post` |
| `src/routes/portfolio/index.tsx` | `PortfolioIndex` | `Portfolio` |
| `src/routes/portfolio/project.tsx` | `ProjectPage` | `Project` |
| `src/routes/research/index.tsx` | `ResearchIndex` | `Research` |
| `src/routes/research/paper.tsx` | `PaperPage` | `Paper` |
| `src/routes/not-found.tsx` | `NotFound` | `404` |

- [ ] **Step 4: Wire routes in App**

`src/App.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import Landing from './routes/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ProjectPage from './routes/portfolio/project'
import ResearchIndex from './routes/research/index'
import PaperPage from './routes/research/paper'
import NotFound from './routes/not-found'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/portfolio" element={<PortfolioIndex />} />
      <Route path="/portfolio/:slug" element={<ProjectPage />} />
      <Route path="/research" element={<ResearchIndex />} />
      <Route path="/research/:slug" element={<PaperPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

- [ ] **Step 5: SSR-safe entry with prerender export**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

if (typeof window !== 'undefined') {
  const { hydrateRoot, createRoot } = await import('react-dom/client')
  const root = document.getElementById('root')!
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
  if (root.childElementCount > 0) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

export async function prerender(data: { url: string }) {
  const { renderToString } = await import('react-dom/server')
  const { StaticRouter } = await import('react-router-dom/server')
  const { headState } = await import('./lib/meta')
  const html = renderToString(
    <StaticRouter location={data.url}>
      <App />
    </StaticRouter>,
  )
  return {
    html,
    head: {
      title: headState.title,
      elements: new Set([{ type: 'meta', props: { name: 'description', content: headState.description } }]),
    },
  }
}
```

Note: if `react-router-dom/server` fails to resolve under router v7, import `StaticRouter` from `'react-router'` instead — v7 merged the packages.

- [ ] **Step 6: Configure the plugin**

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: new URL('./src/main.tsx', import.meta.url).pathname,
      additionalPrerenderRoutes: ['/blog', '/portfolio', '/research', '/404'],
    }),
  ],
})
```

(The plugin crawls `<a href>` links from `/` too; `additionalPrerenderRoutes` guarantees the four even before nav exists. Per-post routes get added in Task 13.)

- [ ] **Step 7: Verify prerender output**

Run: `npm run build && grep -l "coming soon" dist/blog/index.html dist/portfolio/index.html dist/research/index.html && grep "<title>Blog — NovusEdge</title>" dist/blog/index.html`
Expected: all files exist and blog title matches. Then `npm run preview` and click through `/blog` — hydration, no console errors.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: routing skeleton + build-time prerendering + per-page meta"
```

---

### Task 3: Design motifs — rules, section numbers, JP labels, registration marks

**Files:**
- Create: `src/components/motifs.tsx`

**Interfaces:**
- Produces: `Rule({ className? })` — 1px horizontal rule with gold square terminus at right; `SectionNumber({ n: string, label: string })` — mono "01 / PORTFOLIO"; `JPLabel({ children, className? })` — tiny vertical Japanese label; `RegMarks()` — four `+` registration marks pinned to the corners of the nearest `relative` parent; `MonoTag({ children })` — small tracked-out uppercase mono chip used for dates/tags.

- [ ] **Step 1: Write the components**

`src/components/motifs.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Rule({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px bg-charcoal/20 dark:bg-bone/20 ${className}`}>
      <span className="absolute -top-[2px] right-0 size-[5px] bg-gold" />
    </div>
  )
}

export function SectionNumber({ n, label }: { n: string; label: string }) {
  return (
    <span className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
      {n} / {label}
    </span>
  )
}

export function JPLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={`select-none font-display text-[11px] tracking-[0.4em] text-charcoal/35 dark:text-bone/35 [writing-mode:vertical-rl] ${className}`}
    >
      {children}
    </span>
  )
}

function Mark({ pos }: { pos: string }) {
  return (
    <span aria-hidden className={`absolute font-mono text-xs text-charcoal/25 dark:text-bone/25 ${pos}`}>
      +
    </span>
  )
}

export function RegMarks() {
  return (
    <>
      <Mark pos="left-4 top-4" />
      <Mark pos="right-4 top-4" />
      <Mark pos="bottom-4 left-4" />
      <Mark pos="bottom-4 right-4" />
    </>
  )
}

export function MonoTag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-charcoal/60 dark:text-bone/60">
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Smoke-check via landing stub**

Temporarily render `<Rule className="max-w-xs" />`, `<SectionNumber n="01" label="test" />`, `<JPLabel>ブログ</JPLabel>` in `src/routes/index.tsx`, run `npm run dev`, confirm rendering in both themes (gold terminus visible, JP label vertical). Revert the stub to its Task 2 state (or leave — Task 6 replaces it wholesale).

- [ ] **Step 3: Build + commit**

Run: `npm run build` → passes.

```bash
git add -A && git commit -m "feat: design motif primitives (rule, section number, jp label, reg marks)"
```

---

### Task 4: Floating pill header + theme toggle

**Files:**
- Create: `src/components/header.tsx`
- Modify: `src/App.tsx` (render header above routes)

**Interfaces:**
- Consumes: `MonoTag` styles conventions from Task 3 (inline styles, not imports).
- Produces: `<Header />` rendered on all pages; theme persisted to `localStorage.theme` matching the Task 1 inline script.

- [ ] **Step 1: Write the header**

`src/components/header.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/blog', label: 'Blog', jp: 'ブログ' },
  { to: '/portfolio', label: 'Portfolio', jp: '作品' },
  { to: '/research', label: 'Research', jp: '研究' },
]

function ThemeToggle() {
  // ponytail: state only for the icon; source of truth is the <html> class set pre-paint
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  return (
    <button
      aria-label="Toggle theme"
      className="cursor-pointer font-mono text-xs text-charcoal/60 transition-colors hover:text-gold dark:text-bone/60"
      onClick={() => {
        const isDark = document.documentElement.classList.toggle('dark')
        localStorage.theme = isDark ? 'dark' : 'light'
        setDark(isDark)
      }}
    >
      {dark ? '☾' : '☀'}
    </button>
  )
}

export function Header() {
  return (
    <header className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-6 rounded-full border border-charcoal/10 bg-bone/70 px-6 py-2.5 shadow-sm backdrop-blur-md dark:border-bone/10 dark:bg-charcoal/70">
        <NavLink to="/" className="font-display text-sm font-bold tracking-wide">
          N<span className="text-gold">E</span>
        </NavLink>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `link-draw font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                isActive ? 'text-gold' : 'text-charcoal/70 hover:text-charcoal dark:text-bone/70 dark:hover:text-bone'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Mount in App**

In `src/App.tsx`, add `import { Header } from './components/header'` and render `<Header />` immediately before `<Routes>` (wrap both in a fragment).

- [ ] **Step 3: Verify**

Run: `npm run dev`. Check: pill floats centered top on every route; active route label is gold; hover draws underline left→right; theme toggle flips theme and survives reload (localStorage); glassmorphism visible when scrolling content under it.

Run: `npm run build` → passes; `grep -c 'nav' dist/index.html` ≥ 1 (header prerendered).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: floating glassmorphic pill header with theme toggle"
```

**Note (spec deviation, flag to user):** spec's component list says "floating header with search bar", but the Blog section puts search on the blog index. Search lives on `/blog` only (Task 8). Add to header later if wanted.

---

### Task 5: Motion foundation — GSAP, reveals, page wipe, reduced motion

**Files:**
- Modify: `package.json` (add `gsap`, `@gsap/react`)
- Create: `src/lib/motion.ts`, `src/components/page-wipe.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: router context (`useLocation`).
- Produces: `prefersReducedMotion(): boolean`; `useReveal(scope: RefObject<HTMLElement | null>)` — staggered reveal of all `[data-reveal]` descendants on mount (opacity+y 24px, power3.out 0.7s, stagger 0.08; opacity-only under reduced motion); `<PageWipe />` — charcoal panel sweep on route change, skipped on first load and under reduced motion. Page tasks (6–11) mark elements with `data-reveal` and call `useReveal`.

- [ ] **Step 1: Install**

Run: `npm install gsap @gsap/react`

- [ ] **Step 2: Motion lib**

`src/lib/motion.ts`:

```ts
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current)
      if (!targets.length) return
      gsap.from(
        targets,
        prefersReducedMotion()
          ? { opacity: 0, duration: 0.5, stagger: 0.08 }
          : { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
      )
    },
    { scope },
  )
}
```

- [ ] **Step 3: Page wipe**

`src/components/page-wipe.tsx`:

```tsx
import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/motion'

// ponytail: wipe plays on arrival (cover -> sweep off). True cover-before-unmount needs
// blocking navigation/view transitions — add if arrival-only ever feels cheap.
export function PageWipe() {
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const first = useRef(true)

  useGSAP(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ref.current,
      { scaleX: 1 },
      { scaleX: 0, duration: 0.7, ease: 'power3.out', transformOrigin: 'left center' },
    )
  }, [pathname])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 origin-left scale-x-0 bg-charcoal dark:bg-bone-tint/90"
    />
  )
}
```

Also add a scroll-reset in `src/App.tsx` so route changes start at the top — inside `App`, before `return`:

```tsx
const { pathname } = useLocation()
useEffect(() => window.scrollTo(0, 0), [pathname])
```

(add `import { useEffect } from 'react'` and `useLocation` to the existing `react-router-dom` import). Render `<PageWipe />` next to `<Header />`.

- [ ] **Step 4: Verify**

Run: `npm run dev`. Navigate between routes: charcoal panel sweeps once per navigation, none on first load. In devtools, emulate `prefers-reduced-motion: reduce` → no wipe. `npm run build` passes (SSR must not crash — `matchMedia` is guarded).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: gsap motion foundation — reveals, page wipe, reduced-motion guards"
```

---

### Task 6: Landing hero

**Files:**
- Replace: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `Meta`, `Rule`, `RegMarks`, `JPLabel`, `MonoTag`, `useReveal`.
- Produces: final landing page. Hero only — no extra sections (spec).

- [ ] **Step 1: Write the hero**

`src/routes/index.tsx`:

```tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Meta } from '../lib/meta'
import { Rule, RegMarks, JPLabel, MonoTag } from '../components/motifs'
import { useReveal } from '../lib/motion'

export default function Landing() {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  return (
    <>
      <Meta description="Security, systems, and writeups — personal site of NovusEdge." />
      <section ref={scope} className="relative flex min-h-screen flex-col justify-center px-6 md:px-20">
        <RegMarks />
        <JPLabel className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block">ようこそ</JPLabel>

        <div data-reveal>
          <MonoTag>novusedge — security · systems · writing</MonoTag>
        </div>

        <h1 data-reveal className="mt-6 font-display text-6xl font-black leading-[1.05] md:text-8xl">
          Novus<span className="text-gold">Edge</span>
        </h1>

        <div data-reveal>
          <Rule className="mt-10 max-w-md" />
        </div>

        <p data-reveal className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal/70 dark:text-bone/70">
          Weekly notes on security and Linux, CTF writeups, projects, and the occasional research paper.
        </p>

        <nav data-reveal className="mt-10 flex gap-8">
          {[
            ['/blog', 'Read the blog'],
            ['/portfolio', 'See the work'],
            ['/research', 'Papers'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="link-draw font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
              {label} →
            </Link>
          ))}
        </nav>

        {/* animated strip: /assets/cosmos.webp has loop-count 3 baked in — plays 3x, freezes on last frame, no JS */}
        <div data-reveal className="mt-12 max-w-3xl">
          <img src="/assets/cosmos.webp" alt="" className="w-full border border-charcoal/15 dark:border-bone/15" />
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify**

`npm run dev`: staggered reveal on load, reg marks in corners, vertical ようこそ on the right (desktop), links are paper blue with draw-underline, gold appears only in "Edge". Both themes. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: landing hero"
```

**Note:** hero headline/tagline copy is placeholder-real — user should personalize (name vs. handle).

---

### Task 7: Markdown pipeline — frontmatter parser, posts module, renderer

**Files:**
- Modify: `package.json` (add `react-markdown`, `remark-gfm`, `rehype-highlight`, `@tailwindcss/typography`, `vitest`)
- Create: `src/lib/frontmatter.ts`, `src/lib/frontmatter.test.ts`, `src/lib/posts.ts`, `src/components/markdown.tsx`
- Create: `src/content/blog/hello-vite.md` (temp fixture, deleted in Task 12)
- Modify: `src/styles/global.css` (typography plugin + code theme)

**Interfaces:**
- Produces:
  - `parseFrontmatter(raw: string): { data: Record<string, string | string[]>; content: string }`
  - `type Post = { slug: string; title: string; date: string; tags: string[]; description: string; content: string }`
  - `posts: Post[]` (sorted date desc), `getPost(slug: string): Post | undefined`
  - `<Markdown>{content}</Markdown>` — styled prose renderer with GFM + syntax highlighting.
- Frontmatter schema for all blog md files: `title` (string), `date` (`YYYY-MM-DD`), `tags` (`[a, b, c]` inline array), `description` (string, optional).

- [ ] **Step 1: Install**

Run: `npm install react-markdown remark-gfm rehype-highlight && npm install -D @tailwindcss/typography vitest`

Note: `rehype-highlight` (highlight.js, sync, browser-friendly) instead of the spec's shiki suggestion — shiki is async and fights `react-markdown`'s sync render + prerendering. Flag to user; swap later if shiki's themes are wanted.

- [ ] **Step 2: Failing test for the parser**

`src/lib/frontmatter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from './frontmatter'

describe('parseFrontmatter', () => {
  it('parses scalar fields, inline arrays, and strips quotes', () => {
    const raw = `---\ntitle: hello, world!\ndate: 2023-05-23\ntags: [writeup, ctf]\ndescription: "a quoted one"\n---\n\n# Body\n`
    const { data, content } = parseFrontmatter(raw)
    expect(data.title).toBe('hello, world!')
    expect(data.date).toBe('2023-05-23')
    expect(data.tags).toEqual(['writeup', 'ctf'])
    expect(data.description).toBe('a quoted one')
    expect(content.trim()).toBe('# Body')
  })

  it('returns whole input as content when no frontmatter', () => {
    const { data, content } = parseFrontmatter('# just markdown')
    expect(data).toEqual({})
    expect(content).toBe('# just markdown')
  })
})
```

Run: `npx vitest run src/lib/frontmatter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement parser**

`src/lib/frontmatter.ts`:

```ts
// ponytail: flat key: value + inline [a, b] arrays only — that's the whole blog schema.
// Swap for a yaml lib if nested frontmatter ever appears.
export function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  content: string
} {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!m) return { data: {}, content: raw }
  const data: Record<string, string | string[]> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    if (v.startsWith('[') && v.endsWith(']')) {
      data[key] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = v.replace(/^['"]|['"]$/g, '')
    }
  }
  return { data, content: raw.slice(m[0].length) }
}
```

Run: `npx vitest run src/lib/frontmatter.test.ts` → PASS.

- [ ] **Step 4: Posts module + fixture**

`src/content/blog/hello-vite.md`:

````markdown
---
title: Pipeline smoke test
date: 2026-01-01
tags: [meta]
description: Temporary fixture — deleted during content migration.
---

# It renders

Some **bold**, a [link](https://example.com), and code:

```bash
echo "highlighted?"
```
````

`src/lib/posts.ts`:

```ts
import { parseFrontmatter } from './frontmatter'

export type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  content: string
}

const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { data, content } = parseFrontmatter(raw)
    return {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || '1970-01-01',
      tags: Array.isArray(data.tags) ? data.tags : [],
      description: (data.description as string) || '',
      content,
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)
```

- [ ] **Step 5: Markdown renderer + prose styling**

`src/components/markdown.tsx`:

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-paper-deep prose-a:no-underline hover:prose-a:underline dark:prose-a:text-paper prose-code:font-mono prose-img:rounded-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
```

In `src/styles/global.css`, add after the `@import 'tailwindcss';` line:

```css
@plugin "@tailwindcss/typography";
```

and at the end, a minimal highlight theme in site colors (no external hljs CSS):

```css
/* code highlighting — quiet, in-palette */
.prose pre {
  @apply border border-charcoal/10 bg-bone-tint dark:border-bone/10 dark:bg-charcoal-tint;
}
.prose :not(pre) > code {
  @apply rounded-sm bg-bone-tint px-1 py-0.5 dark:bg-charcoal-tint;
}
.hljs-keyword, .hljs-built_in, .hljs-type { @apply text-paper-deep dark:text-paper; }
.hljs-string, .hljs-title, .hljs-attr { @apply text-gold; }
.hljs-comment, .hljs-meta { @apply text-charcoal/50 dark:text-bone/50; }
```

- [ ] **Step 6: Smoke-render + verify**

Temporarily in `src/routes/blog/post.tsx` stub, render `<Markdown>{getPost('hello-vite')?.content ?? 'missing'}</Markdown>` inside a `<div className="px-6 pt-40">`, visit `/blog/hello-vite` in dev: headings in display font, code block tinted with in-palette token colors, link paper blue. (Task 9 replaces this file anyway — leave it.)

Run: `npm run test && npm run build` → both pass.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: markdown pipeline — frontmatter parser, posts module, prose renderer"
```

---

### Task 8: Blog index — timeline, year markers, search

**Files:**
- Create: `src/lib/blog-list.ts`, `src/lib/blog-list.test.ts`
- Replace: `src/routes/blog/index.tsx`

**Interfaces:**
- Consumes: `posts`, `Post` from `src/lib/posts.ts`; motifs; `useReveal`; `Meta`.
- Produces: `filterPosts(posts: Post[], q: string): Post[]`; `groupByYear(posts: Post[]): { year: string; posts: Post[] }[]` (years desc, assumes input already date-desc).

- [ ] **Step 1: Failing tests**

`src/lib/blog-list.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filterPosts, groupByYear } from './blog-list'
import type { Post } from './posts'

const p = (slug: string, date: string, title = slug, tags: string[] = []): Post => ({
  slug, date, title, tags, description: '', content: '',
})

describe('filterPosts', () => {
  const list = [p('alfred', '2023-06-13', 'Alfred Writeup', ['ctf']), p('uni', '2023-09-07', 'University!!', ['blog-update'])]
  it('matches title case-insensitively', () => {
    expect(filterPosts(list, 'ALFRED')).toHaveLength(1)
  })
  it('matches tags', () => {
    expect(filterPosts(list, 'ctf')[0].slug).toBe('alfred')
  })
  it('empty query returns all', () => {
    expect(filterPosts(list, '  ')).toHaveLength(2)
  })
})

describe('groupByYear', () => {
  it('groups date-desc posts into year buckets, newest year first', () => {
    const g = groupByYear([p('b', '2024-01-01'), p('a', '2023-06-01')])
    expect(g.map((x) => x.year)).toEqual(['2024', '2023'])
    expect(g[1].posts[0].slug).toBe('a')
  })
})
```

Run: `npx vitest run src/lib/blog-list.test.ts` → FAIL (module not found).

- [ ] **Step 2: Implement**

`src/lib/blog-list.ts`:

```ts
import type { Post } from './posts'

export function filterPosts(posts: Post[], q: string): Post[] {
  const query = q.trim().toLowerCase()
  if (!query) return posts
  return posts.filter(
    (p) => p.title.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query)),
  )
}

export function groupByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const groups: { year: string; posts: Post[] }[] = []
  for (const post of posts) {
    const year = post.date.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last?.year === year) last.posts.push(post)
    else groups.push({ year, posts: [post] })
  }
  return groups
}
```

Run: `npx vitest run src/lib/blog-list.test.ts` → PASS.

- [ ] **Step 3: Blog index page**

`src/routes/blog/index.tsx`:

```tsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Meta } from '../../lib/meta'
import { posts } from '../../lib/posts'
import { filterPosts, groupByYear } from '../../lib/blog-list'
import { Rule, SectionNumber, JPLabel, MonoTag } from '../../components/motifs'
import { useReveal } from '../../lib/motion'

export default function BlogIndex() {
  const [q, setQ] = useState('')
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  const groups = groupByYear(filterPosts(posts, q))

  return (
    <>
      <Meta title="Blog" description="Weekly notes, CTF writeups, and Linux journeys." />
      <section ref={scope} className="relative mx-auto max-w-3xl px-6 pb-24 pt-36">
        <JPLabel className="absolute -left-2 top-40 hidden lg:block">ブログ</JPLabel>

        <div data-reveal className="flex items-baseline justify-between gap-6">
          <div>
            <SectionNumber n="02" label="blog" />
            <h1 className="mt-3 font-display text-5xl font-black">Blog</h1>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search…"
            aria-label="Search posts"
            className="w-40 border-b border-charcoal/20 bg-transparent pb-1 font-mono text-xs tracking-wider outline-none placeholder:text-charcoal/40 focus:border-gold md:w-56 dark:border-bone/20 dark:placeholder:text-bone/40"
          />
        </div>

        <div data-reveal>
          <Rule className="mt-8" />
        </div>

        {groups.length === 0 && (
          <p className="mt-16 font-mono text-xs uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
            no posts match “{q}”
          </p>
        )}

        {groups.map(({ year, posts: yearPosts }) => (
          <div key={year} className="mt-14" data-reveal>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-medium tracking-[0.3em] text-gold">{year}</span>
              <div className="h-px flex-1 bg-charcoal/10 dark:bg-bone/10" />
            </div>
            <ul className="mt-6 space-y-6">
              {yearPosts.map((post) => (
                <li key={post.slug} className="group grid grid-cols-[6rem_1fr] items-baseline gap-4">
                  <MonoTag>{post.date.slice(5)}</MonoTag>
                  <div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="font-display text-xl font-medium transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-paper-deep dark:group-hover:text-paper"
                    >
                      {post.title}
                    </Link>
                    {post.description && (
                      <p className="mt-1 text-sm text-charcoal/60 dark:text-bone/60">{post.description}</p>
                    )}
                    <div className="mt-1.5 flex gap-3">
                      {post.tags.map((t) => (
                        <MonoTag key={t}>{t}</MonoTag>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  )
}
```

- [ ] **Step 4: Verify**

`npm run dev` → `/blog`: fixture post listed under gold "2026" year marker, search narrows live (try a tag and gibberish → empty state). `npm run test && npm run build` pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: blog index — timeline with year markers and search"
```

---

### Task 9: Blog post page

**Files:**
- Replace: `src/routes/blog/post.tsx`

**Interfaces:**
- Consumes: `getPost`, `Markdown`, `Meta`, `MonoTag`, `Rule`, `NotFound` (`src/routes/not-found.tsx` default export).
- Produces: `/blog/:slug` reader page, Medium-style centered column.

- [ ] **Step 1: Write it**

`src/routes/blog/post.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { Meta } from '../../lib/meta'
import { getPost } from '../../lib/posts'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag } from '../../components/motifs'
import NotFound from '../not-found'

export default function BlogPost() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined
  if (!post) return <NotFound />

  return (
    <>
      <Meta title={post.title} description={post.description || post.title} />
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-36">
        <Link to="/blog" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← blog
        </Link>
        <h1 className="mt-6 font-display text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4">
          <MonoTag>{post.date}</MonoTag>
          {post.tags.map((t) => (
            <MonoTag key={t}>{t}</MonoTag>
          ))}
        </div>
        <Rule className="mb-10 mt-6" />
        <Markdown>{post.content}</Markdown>
      </article>
    </>
  )
}
```

- [ ] **Step 2: Verify**

`npm run dev` → `/blog/hello-vite` renders full post (title, date, tags, prose, highlighted code); `/blog/nope` renders the 404 stub. `npm run build` passes.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: blog post reader page"
```

---

### Task 10: Portfolio — data, full-page scroll sections, project pages

**Files:**
- Create: `src/content/projects.ts`
- Replace: `src/routes/portfolio/index.tsx`, `src/routes/portfolio/project.tsx`

**Interfaces:**
- Consumes: motifs, `Meta`, `useReveal`, `prefersReducedMotion`, gsap ScrollTrigger.
- Produces: `type Project = { slug: string; title: string; jp?: string; year: string; description: string; tech: string[]; image?: string; links: { label: string; href: string }[]; body: string }`; `projects: Project[]`; `getProject(slug)`. Project detail pages render a shared template; genuinely custom per-project pages come later when real projects land (spec allows per-project design — YAGNI until content exists).

- [ ] **Step 1: Data file with seed entries**

`src/content/projects.ts`:

```ts
export type Project = {
  slug: string
  title: string
  jp?: string
  year: string
  description: string
  tech: string[]
  image?: string
  links: { label: string; href: string }[]
  body: string
}

// ponytail: seed data — user replaces/extends. body is markdown.
export const projects: Project[] = [
  {
    slug: 'engrammic',
    title: 'Engrammic',
    jp: '記憶',
    year: '2026',
    description: 'Epistemic memory for AI agents — claims, evidence, and provenance as a first-class graph.',
    tech: ['TypeScript', 'MCP', 'Graph DB'],
    links: [{ label: 'engrammic.ai', href: 'https://engrammic.ai' }],
    body: 'Longer writeup coming — see [engrammic.ai](https://engrammic.ai).',
  },
  {
    slug: 'this-site',
    title: 'This Site',
    jp: '作品',
    year: '2026',
    description: 'Hand-built personal site: Vite, React 19, Tailwind v4, GSAP, prerendered to static HTML.',
    tech: ['React', 'TypeScript', 'GSAP'],
    links: [{ label: 'source', href: 'https://github.com/NovusEdge/NovusEdge.github.io' }],
    body: 'Design notes and build log coming soon.',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
```

- [ ] **Step 2: Portfolio index with scroll-snap sections**

`src/routes/portfolio/index.tsx`:

```tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Meta } from '../../lib/meta'
import { projects } from '../../content/projects'
import { SectionNumber, JPLabel, MonoTag, RegMarks } from '../../components/motifs'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function PortfolioIndex() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-project]', container.current).forEach((section) => {
        gsap.from(section.querySelectorAll('[data-item]'), {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: section, scroller: container.current, start: 'top 55%' },
        })
      })
    },
    { scope: container },
  )

  return (
    <>
      <Meta title="Portfolio" description="Projects and builds." />
      {/* ponytail: snap only on md+ — spec's mobile fallback is plain stacked sections */}
      <div ref={container} className="md:h-screen md:snap-y md:snap-mandatory md:overflow-y-auto">
        {projects.map((p, i) => (
          <section
            key={p.slug}
            data-project
            className="relative flex min-h-screen items-center px-6 py-24 md:snap-start md:px-20 odd:bg-bone-tint/50 dark:odd:bg-charcoal-tint/60"
          >
            <RegMarks />
            <div className="grid w-full items-center gap-10 md:grid-cols-[1fr_1px_1fr] md:gap-16">
              {/* text left */}
              <div className="max-w-lg md:justify-self-end">
                <div data-item>
                  <SectionNumber n={String(i + 1).padStart(2, '0')} label="portfolio" />
                </div>
                <h2 data-item className="mt-4 font-display text-5xl font-black md:text-6xl">
                  <Link to={`/portfolio/${p.slug}`} className="transition-colors hover:text-paper-deep dark:hover:text-paper">
                    {p.title}
                  </Link>
                </h2>
                <p data-item className="mt-5 text-charcoal/70 dark:text-bone/70">
                  {p.description}
                </p>
                <div data-item className="mt-5 flex flex-wrap gap-3">
                  {p.tech.map((t) => (
                    <MonoTag key={t}>{t}</MonoTag>
                  ))}
                </div>
                <div data-item className="mt-8">
                  <Link
                    to={`/portfolio/${p.slug}`}
                    className="link-draw font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper"
                  >
                    details →
                  </Link>
                </div>
              </div>

              {/* vertical line */}
              <div className="relative hidden h-64 w-px self-center bg-charcoal/20 md:block dark:bg-bone/20">
                <span className="absolute -left-[2px] top-0 size-[5px] bg-gold" />
              </div>

              {/* image right */}
              <div data-item className="relative md:max-w-md">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full rounded-sm" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center border border-charcoal/15 dark:border-bone/15">
                    {p.jp && <JPLabel className="text-2xl">{p.jp}</JPLabel>}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 3: Project detail template**

`src/routes/portfolio/project.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { Meta } from '../../lib/meta'
import { getProject } from '../../content/projects'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag, JPLabel } from '../../components/motifs'
import NotFound from '../not-found'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  if (!project) return <NotFound />

  return (
    <>
      <Meta title={project.title} description={project.description} />
      <article className="relative mx-auto max-w-2xl px-6 pb-24 pt-36">
        {project.jp && <JPLabel className="absolute -left-2 top-40 hidden lg:block">{project.jp}</JPLabel>}
        <Link to="/portfolio" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← portfolio
        </Link>
        <h1 className="mt-6 font-display text-5xl font-black">{project.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <MonoTag>{project.year}</MonoTag>
          {project.tech.map((t) => (
            <MonoTag key={t}>{t}</MonoTag>
          ))}
        </div>
        <div className="mt-4 flex gap-6">
          {project.links.map((l) => (
            <a key={l.href} href={l.href} className="link-draw font-mono text-xs uppercase tracking-[0.2em] text-paper-deep dark:text-paper">
              {l.label} ↗
            </a>
          ))}
        </div>
        <Rule className="mb-10 mt-6" />
        <p className="text-lg leading-relaxed text-charcoal/80 dark:text-bone/80">{project.description}</p>
        <div className="mt-8">
          <Markdown>{project.body}</Markdown>
        </div>
      </article>
    </>
  )
}
```

- [ ] **Step 4: Verify**

`npm run dev` → `/portfolio` on desktop: each project fills the viewport, snaps section-to-section, items stagger in on scroll, alternating warm-gray tint, vertical line with gold dot between text and image. Narrow the window below `md`: plain stacked sections, no snap. Reduced motion: no scroll animations. `/portfolio/engrammic` renders; `/portfolio/nope` → 404 stub. `npm run build` passes.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: portfolio — full-page snap sections with scroll reveals + project pages"
```

---

### Task 11: Research — data, grid/list toggle, paper pages

**Files:**
- Create: `src/content/papers.ts`
- Replace: `src/routes/research/index.tsx`, `src/routes/research/paper.tsx`

**Interfaces:**
- Consumes: motifs, `Meta`, `useReveal`, `Markdown`.
- Produces: `type Paper = { slug: string; title: string; venue: string; date: string; doi?: string; abstract: string; body: string }`; `papers: Paper[]`; `getPaper(slug)`.

- [ ] **Step 1: Data file**

`src/content/papers.ts`:

```ts
export type Paper = {
  slug: string
  title: string
  venue: string
  date: string
  doi?: string
  abstract: string
  body: string
}

// ponytail: placeholder — real papers get pulled from engrammic.ai/research (spec: external content, Phase 6)
export const papers: Paper[] = [
  {
    slug: 'placeholder-paper',
    title: 'Placeholder Paper Title',
    venue: 'Preprint',
    date: '2026-01-01',
    doi: undefined,
    abstract: 'Placeholder abstract — replaced during content migration with papers from engrammic.ai/research.',
    body: 'Full paper page content coming with content migration.',
  },
]

export const getPaper = (slug: string) => papers.find((p) => p.slug === slug)
```

- [ ] **Step 2: Research index with view toggle**

`src/routes/research/index.tsx`:

```tsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Meta } from '../../lib/meta'
import { papers } from '../../content/papers'
import { Rule, SectionNumber, JPLabel, MonoTag } from '../../components/motifs'
import { useReveal } from '../../lib/motion'

export default function ResearchIndex() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  return (
    <>
      <Meta title="Research" description="Published papers and preprints." />
      <section ref={scope} className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">
        <JPLabel className="absolute -left-2 top-40 hidden lg:block">研究</JPLabel>

        <div data-reveal className="flex items-baseline justify-between">
          <div>
            <SectionNumber n="03" label="research" />
            <h1 className="mt-3 font-display text-5xl font-black">Research</h1>
          </div>
          <div className="flex gap-4">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  view === v ? 'text-gold' : 'text-charcoal/50 hover:text-charcoal dark:text-bone/50 dark:hover:text-bone'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div data-reveal>
          <Rule className="mt-8" />
        </div>

        <div data-reveal className={view === 'grid' ? 'mt-12 grid gap-6 sm:grid-cols-2' : 'mt-12 space-y-6'}>
          {papers.map((paper) => (
            <Link
              key={paper.slug}
              to={`/research/${paper.slug}`}
              className={`group block border border-charcoal/10 p-6 transition-colors hover:border-gold/60 dark:border-bone/10 ${
                view === 'list' ? 'flex items-baseline justify-between gap-6' : ''
              }`}
            >
              <div>
                <div className="flex gap-4">
                  <MonoTag>{paper.date.slice(0, 4)}</MonoTag>
                  <MonoTag>{paper.venue}</MonoTag>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold group-hover:text-paper-deep dark:group-hover:text-paper">
                  {paper.title}
                </h2>
                {view === 'grid' && (
                  <p className="mt-3 line-clamp-3 text-sm text-charcoal/60 dark:text-bone/60">{paper.abstract}</p>
                )}
              </div>
              {paper.doi && view === 'list' && <MonoTag>doi</MonoTag>}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 3: Paper page**

`src/routes/research/paper.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { Meta } from '../../lib/meta'
import { getPaper } from '../../content/papers'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag } from '../../components/motifs'
import NotFound from '../not-found'

export default function PaperPage() {
  const { slug } = useParams()
  const paper = slug ? getPaper(slug) : undefined
  if (!paper) return <NotFound />

  return (
    <>
      <Meta title={paper.title} description={paper.abstract} />
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-36">
        <Link to="/research" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← research
        </Link>
        <h1 className="mt-6 font-display text-4xl font-black leading-tight">{paper.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <MonoTag>{paper.date}</MonoTag>
          <MonoTag>{paper.venue}</MonoTag>
          {paper.doi && (
            <a href={`https://doi.org/${paper.doi}`} className="link-draw font-mono text-[11px] uppercase tracking-[0.2em] text-paper-deep dark:text-paper">
              doi:{paper.doi} ↗
            </a>
          )}
        </div>
        <Rule className="mb-8 mt-6" />
        <p className="text-lg italic leading-relaxed text-charcoal/70 dark:text-bone/70">{paper.abstract}</p>
        <div className="mt-8">
          <Markdown>{paper.body}</Markdown>
        </div>
      </article>
    </>
  )
}
```

- [ ] **Step 4: Verify + commit**

`npm run dev` → `/research`: grid default, toggle to list reflows, active toggle gold, card hover border goes gold; paper page renders; bad slug → 404. `npm run build` passes.

```bash
git add -A && git commit -m "feat: research — cards grid with list toggle + paper pages"
```

---

### Task 12: Content migration — 13 posts + assets

**Files:**
- Create: `src/content/blog/<new-slug>.md` × 13 (see table)
- Delete: `src/content/blog/hello-vite.md` (Task 7 fixture)
- Copy: `OLD_CONTENT/assets/` → `public/assets/`

**Interfaces:**
- Consumes: frontmatter schema from Task 7 (`title`, `date: YYYY-MM-DD`, `tags: [a, b]`, `description`).
- Produces: the slug list below, which Task 13 uses verbatim for redirects and prerender routes.

- [ ] **Step 1: Copy assets**

```bash
cp -r OLD_CONTENT/assets public/
```

Markdown image paths like `/assets/gifs/helloworld.gif` now resolve from `public/` unchanged.

- [ ] **Step 2: Convert each post**

For each file: new filename = old filename minus the `YYYY-MM-DD-` prefix. Replace the entire old frontmatter block (everything between the `---` markers, which contains `layout`, `categories`, list-style tags, and timezone datetimes) with the new block below, copy the body unchanged, and write a one-line `description` summarizing the post's opening (read the body, write a real sentence — not the title restated).

| New file (`src/content/blog/`) | title | date | tags |
|---|---|---|---|
| `hello-world.md` | `hello, world!` | `2023-05-23` | `[lifestyle]` |
| `going-forward.md` | `Going Forward` | `2023-06-13` | `[blog-update]` |
| `thm-writeup-alfred.md` | `Alfred Writeup` | `2023-06-13` | `[writeup, ctf, tryhackme]` |
| `game-zone-writeup.md` | `Game Zone Writeup` | `2023-06-14` | `[writeup, ctf, tryhackme]` |
| `linux-journeys-customizing-the-bootsplash.md` | `Linux Journeys - Customizing the bootsplash` | `2023-07-07` | `[linux-journeys, linux]` |
| `chocolate-factory-writeup.md` | `Chocolate Factory Writeup` | `2023-07-12` | `[writeup, ctf, tryhackme]` |
| `daily-bugle-writeup.md` | `Daily Bugle Writeup` | `2023-07-12` | `[writeup, ctf, tryhackme]` |
| `toolsrus-writeup.md` | `ToolsRus Writeup` | `2023-07-12` | `[writeup, ctf, tryhackme]` |
| `red-writeup.md` | `Red Writeup` | `2023-07-17` | `[writeup, ctf, tryhackme]` |
| `linux-journeys-tiling-window-managers-and-linux-ricing.md` | `Linux Journeys - Tiling Window Managers and Linux Ricing` | `2023-09-07` | `[linux-journeys, linux]` |
| `university.md` | `University!!` | `2023-09-07` | `[blog-update]` |
| `what-do-i-want.md` | `What Do I Want?` | `2023-09-24` | `[blog-update]` |
| `thm-blue-writeup.md` (from `_drafts/`) | `THM Blue Writeup` | `2023-10-01` | `[writeup, ctf, tryhackme]` |

Frontmatter template (exact format — inline arrays, no quotes unless the value contains `:`):

```markdown
---
title: Alfred Writeup
date: 2023-06-13
tags: [writeup, ctf, tryhackme]
description: Exploiting a misconfigured Jenkins server on TryHackMe's Alfred room.
---
```

Also delete the fixture: `git rm src/content/blog/hello-vite.md`

- [ ] **Step 3: Fix Chirpy-specific syntax in bodies**

Chirpy posts may contain `{: .prompt-info }`-style Kramdown attribute lists and `{% ... %}` Liquid tags. Search: `grep -rn '{[:%]' src/content/blog/`. Remove attribute lists; replace Liquid includes with plain markdown equivalents (or delete if decorative).

- [ ] **Step 4: Verify**

`npm run dev` → `/blog` shows all 13 posts grouped under a gold "2023" marker, dates correct, search for "ctf" returns 8. Open `hello-world` — the gif loads. Open two writeups — images under `/assets/img/writeup_assets/...` load, code blocks highlighted. `npm run test && npm run build` pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate 13 blog posts and assets from chirpy site"
```

**Deferred (user said later):** the engrammic.ai blog post + research papers (URLs noted in spec) — separate follow-up once the site is live.

---

### Task 13: Postbuild — per-post prerender, redirects, RSS, sitemap, 404

**Files:**
- Create: `scripts/postbuild.mjs`
- Replace: `src/routes/not-found.tsx` (real 404 page)
- Modify: `vite.config.ts` (prerender every content route), `package.json` (build script)

**Interfaces:**
- Consumes: slugs from Task 12, `projects`/`papers` slugs from Tasks 10–11.
- Produces: `dist/404.html`, `dist/posts/<slug>/index.html` redirect stubs, `dist/feed.xml`, `dist/sitemap.xml`. Site origin constant: `https://novusedge.github.io`.

- [ ] **Step 1: Real 404 page**

`src/routes/not-found.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { Meta } from '../lib/meta'
import { MonoTag } from '../components/motifs'

export default function NotFound() {
  return (
    <>
      <Meta title="404" />
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <MonoTag>404 — not found</MonoTag>
        <h1 className="mt-4 font-display text-7xl font-black">
          迷子<span className="text-gold">.</span>
        </h1>
        <p className="mt-4 text-charcoal/60 dark:text-bone/60">This page doesn't exist (anymore).</p>
        <Link to="/" className="link-draw mt-8 font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← home
        </Link>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Prerender all content routes**

In `vite.config.ts`, build the route list from the content directories (config runs in Node, so `fs` is fine):

```ts
import { readdirSync } from 'node:fs'

const blogSlugs = readdirSync('src/content/blog').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
```

and set:

```ts
additionalPrerenderRoutes: [
  '/blog', '/portfolio', '/research', '/404',
  ...blogSlugs.map((s) => `/blog/${s}`),
],
```

(Project/paper routes are crawled from `<a>` links on their prerendered index pages; blog posts too, but listing them explicitly keeps it deterministic.)

- [ ] **Step 3: Postbuild script**

`scripts/postbuild.mjs`:

```js
import { readFileSync, readdirSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'

const ORIGIN = 'https://novusedge.github.io'
const dist = 'dist'

// ponytail: 15-line frontmatter re-parse — shared TS module isn't importable from a plain .mjs build script
function fm(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  const data = {}
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return data
}

const posts = readdirSync('src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), ...fm(readFileSync(`src/content/blog/${f}`, 'utf8')) }))
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

// 1) 404.html for GitHub Pages
cpSync(`${dist}/404/index.html`, `${dist}/404.html`)

// 2) redirect stubs for old chirpy URLs /posts/<slug>/ -> /blog/<slug>
for (const { slug } of posts) {
  const to = `/blog/${slug}`
  mkdirSync(`${dist}/posts/${slug}`, { recursive: true })
  writeFileSync(
    `${dist}/posts/${slug}/index.html`,
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${ORIGIN}${to}"><script>location.replace(${JSON.stringify(to)})</script>`,
  )
}

// 3) RSS
const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const items = posts
  .map(
    (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${ORIGIN}/blog/${p.slug}</link>
    <guid>${ORIGIN}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`,
  )
  .join('\n')
writeFileSync(
  `${dist}/feed.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>NovusEdge</title>
  <link>${ORIGIN}</link>
  <description>Security, systems, and writeups.</description>
${items}
</channel></rss>`,
)

// 4) sitemap
const staticRoutes = ['/', '/blog', '/portfolio', '/research']
const urls = [...staticRoutes, ...posts.map((p) => `/blog/${p.slug}`)]
  .map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`)
  .join('\n')
writeFileSync(
  `${dist}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
)

console.log(`postbuild: 404.html, ${posts.length} redirects, feed.xml, sitemap.xml`)
```

Update `package.json` build script: `"build": "tsc && vite build && node scripts/postbuild.mjs"`.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: postbuild log line. Check:

```bash
ls dist/404.html dist/feed.xml dist/sitemap.xml dist/posts/hello-world/index.html
grep -o '<title>Alfred Writeup — NovusEdge</title>' dist/blog/thm-writeup-alfred/index.html
grep -c '<item>' dist/feed.xml   # expect 13
```

Then `npm run preview`: visit `/posts/hello-world/` → lands on `/blog/hello-world`; visit a garbage URL → 404 page (preview serves 404.html).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: postbuild — 404, chirpy redirects, rss feed, sitemap"
```

---

### Task 14: Deploy — GitHub Actions → Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Delete: leftover deleted-file staging (the old Chirpy tree is already `git rm`'d — this commit finalizes it)

**Interfaces:**
- Consumes: `npm run build` producing complete `dist/`.
- Produces: automatic deploy on push to `main`.

- [ ] **Step 1: Workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Full local verification**

```bash
npm run test && npm run build && npm run preview
```

Click through every route in preview, both themes, plus `/posts/hello-world/` redirect and a 404. Confirm `dist/googlecc0233a15c0e5531.html` exists (Google verification survived).

- [ ] **Step 3: Commit + push**

```bash
git add -A && git commit -m "chore: github actions deploy to pages"
git push origin main
```

Then: repo Settings → Pages → Source must be "GitHub Actions" (user action if not already set — flag it). Watch the workflow run; verify https://novusedge.github.io renders the new site and https://novusedge.github.io/posts/hello-world/ redirects.

---

## Post-plan follow-ups (explicitly deferred)

- Port https://blog.engrammic.ai/on-building-something-engrammic into `src/content/blog/`.
- Seed `src/content/papers.ts` from https://engrammic.ai/research (with DOIs); remove `placeholder-paper`.
- Replace portfolio seed entries with real projects + images; per-project custom page designs.
- Personalize hero copy.
- OG images (spec mentions them; needs image generation — decide approach then).
- Optional: shiki swap, halftone texture, search in header.
