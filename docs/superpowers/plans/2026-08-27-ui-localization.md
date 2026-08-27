# UI Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the site's interface strings in English, Finnish, German, Japanese, and Simplified Chinese, with English staying on today's bare URLs and the other four locales living under a path prefix.

**Architecture:** One locale manifest drives three consumers: the route tree, the prerender route list, and the sitemap. The inner route tree is written once inside a `LocaleTree` component, and the outer `<Routes>` mounts that component once per locale. All five string catalogs are imported statically into per-locale i18next instances, so prerendered HTML and hydrated HTML always agree.

**Tech Stack:** Vite 7, React 19, react-router 7, TypeScript 5.9, Tailwind 4, i18next, react-i18next, vitest, vite-prerender-plugin, Node 26.

**Spec:** `docs/superpowers/specs/2026-08-27-localization-design.md`

## Global Constraints

- Locales are exactly: `en` (bare paths), `fi` (`/fi`), `de` (`/de`), `ja` (`/ja`), `zh` (`/zh`, html lang `zh-Hans`).
- Blog posts stay English. Never touch `src/content/blog/*.md`.
- Portfolio detail prose stays English. Never touch `src/routes/portfolio/content/*.tsx` or `src/routes/portfolio/detail-*.tsx`.
- Commit with `git commit -s`. No `Co-Authored-By` trailer, ever.
- No em-dashes in commit messages, comments, or documents. Use commas or hyphens.
- No API key and no absolute `.env` path goes in this repo.
- `tsconfig.json` sets `noUnusedLocals: true`. An unused import fails `tsc`.
- The full build is `pnpm build`, which runs `tsc && vite build && node scripts/postbuild.mjs`.
- Tests run with `pnpm test` (`vitest run`). The default environment is node, and jsdom is not installed. Every test in this plan is a pure-function test. Do not add a DOM environment.
- Never put Suspense or async catalog loading on the i18n path. A late catalog makes hydration flash English. The option that enforces this is `initAsync: false` in i18next 26. Older documentation calls it `initImmediate`, which no longer exists.
- A dev server is already running. Use it for every manual check and never start another.
- Work happens on the `i18n-ui` branch, not on `main`.
- Comments follow the repo's existing style. Write a comment only when it carries a fact the code does not.

---

### Task 1: Locale manifest and path helpers

**Files:**
- Create: `src/i18n/locales.json`
- Create: `src/i18n/paths.ts`
- Create: `src/i18n/context.ts`
- Create: `src/i18n/paths.test.ts`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Locale = { code: string; prefix: string; htmlLang: string; label: string; default: boolean }`, `LOCALES: Locale[]`, `DEFAULT_LOCALE: Locale`, `PREFIXED_LOCALES: Locale[]`, `localeFromPath(pathname: string): Locale`, `stripLocale(pathname: string): string`, `localePath(pathname: string, locale: Locale): string`, plus `LocaleContext` and `useLocale(): Locale` from `src/i18n/context.ts`.

- [ ] **Step 1: Add `resolveJsonModule` to tsconfig**

`src/i18n/paths.ts` imports a `.json` file. TypeScript refuses that without the flag, and `moduleResolution: "bundler"` does not imply it.

In `tsconfig.json`, add the option inside `compilerOptions`, after `"isolatedModules": true,`:

```json
    "resolveJsonModule": true,
```

- [ ] **Step 2: Write the locale manifest**

Create `src/i18n/locales.json`:

```json
[
  { "code": "en", "prefix": "", "htmlLang": "en", "label": "English", "default": true },
  { "code": "fi", "prefix": "/fi", "htmlLang": "fi", "label": "Suomi", "default": false },
  { "code": "de", "prefix": "/de", "htmlLang": "de", "label": "Deutsch", "default": false },
  { "code": "ja", "prefix": "/ja", "htmlLang": "ja", "label": "日本語", "default": false },
  { "code": "zh", "prefix": "/zh", "htmlLang": "zh-Hans", "label": "简体中文", "default": false }
]
```

- [ ] **Step 3: Write the failing test**

Create `src/i18n/paths.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  LOCALES,
  DEFAULT_LOCALE,
  PREFIXED_LOCALES,
  localeFromPath,
  stripLocale,
  localePath,
} from './paths'

const de = LOCALES.find((l) => l.code === 'de')!
const zh = LOCALES.find((l) => l.code === 'zh')!

describe('manifest', () => {
  it('has exactly one default', () => {
    expect(LOCALES.filter((l) => l.default)).toHaveLength(1)
    expect(DEFAULT_LOCALE.code).toBe('en')
  })
  it('has unique codes and prefixes', () => {
    expect(new Set(LOCALES.map((l) => l.code)).size).toBe(LOCALES.length)
    expect(new Set(LOCALES.map((l) => l.prefix)).size).toBe(LOCALES.length)
  })
  it('excludes the default from the prefixed list', () => {
    expect(PREFIXED_LOCALES.map((l) => l.code)).toEqual(['fi', 'de', 'ja', 'zh'])
  })
})

describe('localeFromPath', () => {
  it('reads a prefixed locale', () => {
    expect(localeFromPath('/de/about').code).toBe('de')
    expect(localeFromPath('/zh').code).toBe('zh')
  })
  it('falls back to the default for bare paths', () => {
    expect(localeFromPath('/about').code).toBe('en')
    expect(localeFromPath('/').code).toBe('en')
  })
  it('does not treat a normal route as a locale', () => {
    expect(localeFromPath('/blog/hello-world').code).toBe('en')
    expect(localeFromPath('/stack/graph').code).toBe('en')
  })
})

describe('stripLocale', () => {
  it('removes a locale prefix', () => {
    expect(stripLocale('/de/about')).toBe('/about')
    expect(stripLocale('/zh/blog/hello-world')).toBe('/blog/hello-world')
  })
  it('maps a bare locale root to /', () => {
    expect(stripLocale('/de')).toBe('/')
  })
  it('leaves an English path alone', () => {
    expect(stripLocale('/about')).toBe('/about')
    expect(stripLocale('/')).toBe('/')
  })
})

describe('localePath', () => {
  it('adds a prefix', () => {
    expect(localePath('/about', de)).toBe('/de/about')
    expect(localePath('/', zh)).toBe('/zh')
  })
  it('swaps one prefix for another', () => {
    expect(localePath('/de/about', zh)).toBe('/zh/about')
  })
  it('strips back to bare for the default locale', () => {
    expect(localePath('/de/about', DEFAULT_LOCALE)).toBe('/about')
    expect(localePath('/de', DEFAULT_LOCALE)).toBe('/')
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test src/i18n/paths.test.ts`
Expected: FAIL, cannot resolve `./paths`.

- [ ] **Step 5: Write the implementation**

Create `src/i18n/paths.ts`:

```ts
import manifest from './locales.json'

export type Locale = {
  code: string
  prefix: string
  htmlLang: string
  label: string
  default: boolean
}

export const LOCALES = manifest as Locale[]
export const DEFAULT_LOCALE = LOCALES.find((l) => l.default)!
export const PREFIXED_LOCALES = LOCALES.filter((l) => !l.default)

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1]
  return PREFIXED_LOCALES.find((l) => l.code === first) ?? DEFAULT_LOCALE
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname)
  if (locale.default) return pathname
  const rest = pathname.slice(locale.prefix.length)
  return rest === '' ? '/' : rest
}

export function localePath(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname)
  if (locale.default) return bare
  return bare === '/' ? locale.prefix : `${locale.prefix}${bare}`
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test src/i18n/paths.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 7: Add the locale context in its own module**

The context lives here rather than in `App.tsx` to keep imports acyclic. `App.tsx` imports `Header`, `Header` needs the active locale, and a context exported from `App.tsx` would close that loop.

Create `src/i18n/context.ts`:

```ts
import { createContext, use } from 'react'
import { DEFAULT_LOCALE, type Locale } from './paths'

export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)
export const useLocale = () => use(LocaleContext)
```

- [ ] **Step 8: Commit**

```bash
git add tsconfig.json src/i18n/locales.json src/i18n/paths.ts src/i18n/context.ts src/i18n/paths.test.ts
git commit -s -m "i18n: add the locale manifest and path helpers"
```

---

### Task 2: String catalogs and i18next instances

**Files:**
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/fi.json`
- Create: `src/i18n/locales/de.json`
- Create: `src/i18n/locales/ja.json`
- Create: `src/i18n/locales/zh.json`
- Create: `src/i18n/index.ts`
- Create: `src/i18n/catalogs.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `LOCALES` from `src/i18n/paths.ts`.
- Produces: `i18nFor(code: string): i18n` returning a ready per-locale i18next instance, and `catalogs: Record<string, Record<string, string>>`.

- [ ] **Step 1: Install the runtime**

Run: `pnpm add i18next react-i18next`

These are the only two dependencies this plan adds.

- [ ] **Step 2: Seed the English catalog**

Create `src/i18n/locales/en.json`. Keys are flat and dotted. These are the shared chrome strings; Task 7 adds the rest as it sweeps each page.

```json
{
  "nav.home": "Home",
  "nav.about": "About",
  "nav.blog": "Blog",
  "nav.portfolio": "Portfolio",
  "nav.research": "Research",
  "nav.stack": "Stack",
  "nav.themeToggle": "Toggle theme",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.language": "Language",
  "footer.getInTouch": "get in touch",
  "footer.getInTouchLabel": "Get in touch",
  "landing.scroll": "scroll",
  "blog.postsInEnglish": "Posts are written in English."
}
```

- [ ] **Step 3: Seed the four target catalogs**

The Japanese nav values already exist in `src/components/header.tsx:6-12` as the `jp` field on each link, so carry them across rather than inventing new ones.

Create `src/i18n/locales/ja.json`:

```json
{
  "nav.home": "家",
  "nav.about": "私",
  "nav.blog": "ブログ",
  "nav.portfolio": "作品",
  "nav.research": "研究",
  "nav.stack": "技"
}
```

Create `src/i18n/locales/fi.json`, `src/i18n/locales/de.json`, and `src/i18n/locales/zh.json` each containing an empty object:

```json
{}
```

Task 8 fills them. Until then `fallbackLng: 'en'` renders English for every missing key, which keeps the site working at every commit in this plan.

- [ ] **Step 4: Write the failing test**

Create `src/i18n/catalogs.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { LOCALES } from './paths'
import { catalogs, i18nFor } from './index'

const PLACEHOLDER = /\{\{(\w+)\}\}/g
const tokens = (s: string) => new Set(Array.from(s.matchAll(PLACEHOLDER), (m) => m[1]))

describe('catalogs', () => {
  it('has a catalog for every locale in the manifest', () => {
    for (const l of LOCALES) expect(catalogs[l.code]).toBeDefined()
  })

  it('never carries a key English does not have', () => {
    const english = new Set(Object.keys(catalogs.en))
    for (const l of LOCALES) {
      const orphans = Object.keys(catalogs[l.code]).filter((k) => !english.has(k))
      expect(orphans, `orphan keys in ${l.code}.json`).toEqual([])
    }
  })

  it('keeps the same interpolation tokens as the English source', () => {
    for (const l of LOCALES) {
      for (const [key, value] of Object.entries(catalogs[l.code])) {
        expect(tokens(value), `${l.code}.json ${key}`).toEqual(tokens(catalogs.en[key]))
      }
    }
  })
})

describe('i18nFor', () => {
  it('resolves synchronously with the catalog already loaded', () => {
    expect(i18nFor('ja').t('nav.blog')).toBe('ブログ')
  })

  it('falls back to English for a missing key', () => {
    expect(i18nFor('de').t('nav.blog')).toBe('Blog')
  })
})
```

The orphan check runs in one direction on purpose. A missing key is legal while the target catalogs are still empty, and Task 8 closes that gap. A key that exists only in a translation is always a bug.

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm test src/i18n/catalogs.test.ts`
Expected: FAIL, cannot resolve `./index`.

- [ ] **Step 6: Write the implementation**

Create `src/i18n/index.ts`:

```ts
import i18next, { type i18n } from 'i18next'
import { LOCALES } from './paths'
import en from './locales/en.json'
import fi from './locales/fi.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

export const catalogs: Record<string, Record<string, string>> = { en, fi, de, ja, zh }

// initAsync: false plus inline resources makes init() finish before it returns, so the
// first render already has strings. Any async path here flashes English through hydration.
const instances = new Map<string, i18n>()
for (const locale of LOCALES) {
  const instance = i18next.createInstance()
  instance.init({
    lng: locale.code,
    fallbackLng: 'en',
    resources: {
      [locale.code]: { translation: catalogs[locale.code] },
      en: { translation: catalogs.en },
    },
    interpolation: { escapeValue: false },
    initAsync: false,
    react: { useSuspense: false },
  })
  instances.set(locale.code, instance)
}

export const i18nFor = (code: string): i18n => instances.get(code) ?? instances.get('en')!
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm test src/i18n/catalogs.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml src/i18n/index.ts src/i18n/locales src/i18n/catalogs.test.ts
git commit -s -m "i18n: add string catalogs and per-locale instances"
```

---

### Task 3: Mount the route tree once per locale

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/meta.tsx:5`

**Interfaces:**
- Consumes: `DEFAULT_LOCALE`, `PREFIXED_LOCALES`, `stripLocale`, `type Locale` from `src/i18n/paths.ts`; `LocaleContext` from `src/i18n/context.ts`; `i18nFor` from `src/i18n/index.ts`; `headState` from `src/lib/meta.tsx`.
- Produces: a route tree mounted once per locale. `App.tsx` exports only its default component.

- [ ] **Step 1: Rewrite App.tsx**

Two details decide whether this works.

Nested `<Routes>` resolve their paths relative to the parent match, so every inner route loses its leading slash. The index route becomes `path=""`.

React-router ranks a literal first segment above a splat, so `zh/*` wins over `/*` for `/zh/about`, and `/about` still reaches the English tree. A single `/:locale?` pattern would capture `about` as a locale code, which is why the tree is mounted per locale instead.

Replace the whole file:

```tsx
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { Header } from './components/header'
import GrainShader from './components/react-bits/GrainShader'
import Landing from './routes/index'
import AboutPage from './routes/about/index'
import BlogIndex from './routes/blog/index'
import BlogPost from './routes/blog/post'
import PortfolioIndex from './routes/portfolio/index'
import ProjectPage from './routes/portfolio/project'
import ResearchIndex from './routes/research/index'
import StackPage from './routes/stack/index'
import BlipsPage from './routes/blips/index'
import NotFound from './routes/not-found'
import { SiteFooter } from './components/site-footer'
import { AccessibilityPanel } from './components/accessibility-panel'
import ClickSpark from './components/react-bits/ClickSpark'
import { DEFAULT_LOCALE, PREFIXED_LOCALES, stripLocale, type Locale } from './i18n/paths'
import { LocaleContext } from './i18n/context'
import { i18nFor } from './i18n'
import { headState } from './lib/meta'

function LocaleTree({ locale }: { locale: Locale }) {
  const { pathname } = useLocation()
  const bare = stripLocale(pathname)

  // the prerender pass reads headState after render and writes lang onto <html>
  headState.lang = locale.htmlLang

  // block body, not an implicit-return arrow: a browser that patches scrollTo to
  // return a Promise (Brave, smooth-scroll extensions) would otherwise feed it to
  // React as the effect cleanup, and StrictMode's teardown throws "destroy is not a function".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.lang = locale.htmlLang
  }, [locale.htmlLang])

  // remount + replay the fade-up per route; collapse /stack so its sub-views keep their own slide
  const key = bare.startsWith('/stack') ? '/stack' : pathname

  return (
    <I18nextProvider i18n={i18nFor(locale.code)}>
      <LocaleContext value={locale}>
        {/* landing is a self-contained dark cover with its own nav; header rides every other page */}
        {bare !== '/' && <Header />}
        <GrainShader />
        <div key={key} className="page-enter">
          {/* nested Routes match against the remainder of the parent path, so these are relative */}
          <Routes>
            <Route path="" element={<Landing />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="blog" element={<BlogIndex />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="portfolio" element={<PortfolioIndex />} />
            <Route path="portfolio/:slug" element={<ProjectPage />} />
            <Route path="research" element={<ResearchIndex />} />
            <Route path="stack" element={<StackPage />} />
            <Route path="stack/editorial" element={<StackPage />} />
            <Route path="stack/graph" element={<StackPage />} />
            <Route path="blips" element={<BlipsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {/* universal footer; /stack carries its own colophon (editorial) or runs immersive (graph) */}
        {!bare.startsWith('/stack') && <SiteFooter />}
        <AccessibilityPanel />
      </LocaleContext>
    </I18nextProvider>
  )
}

export default function App() {
  return (
    <ClickSpark sparkColor="#d4a03c" sparkCount={12} sparkSize={12} sparkRadius={20} extraScale={1.2}>
      <Routes>
        {PREFIXED_LOCALES.map((l) => (
          <Route key={l.code} path={`${l.code}/*`} element={<LocaleTree locale={l} />} />
        ))}
        <Route path="/*" element={<LocaleTree locale={DEFAULT_LOCALE} />} />
      </Routes>
    </ClickSpark>
  )
}
```

- [ ] **Step 2: Add the lang field to headState**

`LocaleTree` writes `headState.lang`, so the field has to exist in the same commit or `tsc` fails.

In `src/lib/meta.tsx`, replace line 5:

```ts
export const headState = { title: 'NovusEdge', description: DEFAULT_DESCRIPTION, image: null as string | null, lang: 'en' }
```

Task 4 wires it into the prerender output.

- [ ] **Step 3: Verify the tree compiles**

Run: `pnpm exec tsc`
Expected: no output, exit 0.

- [ ] **Step 4: Verify English routing by hand**

Use the dev server that is already running. Do not start another.

Check `/`, `/about`, `/blog`, and one post. Confirm the header hides on `/` and shows elsewhere, and that the footer hides on `/stack`.

- [ ] **Step 5: Verify prefixed routing by hand**

In the same dev server, check `/de`, `/de/about`, `/zh/blog`, and `/ja/stack`.

Confirm `/de` renders the landing page with no header, and that `/de/about` renders About. Confirm `/xx/about` renders the 404 page, since `xx` is not a manifest code and the splat catches it.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/lib/meta.tsx
git commit -s -m "i18n: mount the route tree once per locale"
```

---

### Task 4: Language markup on every prerendered page

**Files:**
- Modify: `src/main.tsx:44-50`

**Interfaces:**
- Consumes: `headState.lang` from `src/lib/meta.tsx`, added and written in Task 3.
- Produces: a `head.lang` field on the object `prerender()` returns.

- [ ] **Step 1: Return it from prerender**

In `src/main.tsx`, replace the returned object at lines 44 to 50:

```tsx
  return {
    html,
    head: {
      lang: headState.lang,
      title: headState.title,
      elements: new Set(elements),
    },
  }
```

`vite-prerender-plugin` reads `head.lang` and calls `setAttribute('lang', ...)` on the `html` element (see `node_modules/vite-prerender-plugin/src/plugins/prerender-plugin.js:483`).

- [ ] **Step 2: Verify the built markup**

Run: `pnpm build`

Then check the two pages:

```bash
grep -o '<html lang="[^"]*"' dist/index.html dist/zh/index.html dist/de/about/index.html
```

Expected: `dist/index.html` shows `en`, `dist/zh/index.html` shows `zh-Hans`, `dist/de/about/index.html` shows `de`.

If `dist/zh/index.html` does not exist yet, that is correct at this point. Task 9 adds the locale routes to the prerender list. Check `dist/index.html` alone for now, and repeat this whole step after Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -s -m "i18n: write the active language onto prerendered pages"
```

---

### Task 5: Keep internal links inside the active locale

**Files:**
- Create: `src/i18n/use-locale-path.ts`
- Create: `src/i18n/use-locale-path.test.ts`
- Modify: `src/components/header.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `localePath` and `type Locale` from `src/i18n/paths.ts`, `useLocale` from `src/i18n/context.ts`.
- Produces: `prefixWith(path: string, locale: Locale): string` and the hook `useLocalePath(): (path: string) => string`.

Every internal link currently points at a bare path, so clicking Blog from `/de/about` drops the reader back into English. The hook prefixes a bare path with the active locale.

- [ ] **Step 1: Write the failing test**

Create `src/i18n/use-locale-path.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { LOCALES, DEFAULT_LOCALE } from './paths'
import { prefixWith } from './use-locale-path'

const zh = LOCALES.find((l) => l.code === 'zh')!

describe('prefixWith', () => {
  it('leaves paths bare for the default locale', () => {
    expect(prefixWith('/blog', DEFAULT_LOCALE)).toBe('/blog')
    expect(prefixWith('/', DEFAULT_LOCALE)).toBe('/')
  })
  it('prefixes for a non-default locale', () => {
    expect(prefixWith('/blog', zh)).toBe('/zh/blog')
    expect(prefixWith('/', zh)).toBe('/zh')
  })
  it('is idempotent on an already prefixed path', () => {
    expect(prefixWith('/zh/blog', zh)).toBe('/zh/blog')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/i18n/use-locale-path.test.ts`
Expected: FAIL, cannot resolve `./use-locale-path`.

- [ ] **Step 3: Write the implementation**

Create `src/i18n/use-locale-path.ts`:

```ts
import { useCallback } from 'react'
import { localePath, type Locale } from './paths'
import { useLocale } from './context'

export const prefixWith = (path: string, locale: Locale) => localePath(path, locale)

export function useLocalePath() {
  const locale = useLocale()
  return useCallback((path: string) => prefixWith(path, locale), [locale])
}
```

`localePath` strips any existing prefix before adding one, which is what makes `prefixWith` idempotent.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/i18n/use-locale-path.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Prefix the header links**

In `src/components/header.tsx`, inside `Header()`, add the hook and wrap every `to` value.

Add the import at the top:

```tsx
import { useLocalePath } from '../i18n/use-locale-path'
```

Inside `Header()`, after `const location = useLocation()`:

```tsx
  const lp = useLocalePath()
```

Then change all four `to` props. The two `to="/"` links become `to={lp('/')}`, and both `links.map` bodies change `to={l.to}` to `to={lp(l.to)}`.

- [ ] **Step 6: Prefix the landing nav pills**

In `src/routes/index.tsx`, add the same import, call `const lp = useLocalePath()` inside the landing component, and change the nav pill link at line 99 from `to={l.to}` to `to={lp(l.to)}`.

- [ ] **Step 7: Verify by hand**

Use the dev server that is already running. Do not start another.

Open `/de`, click through every nav link, and confirm the URL keeps the `/de` prefix the whole way. Open `/` and confirm links stay bare.

- [ ] **Step 8: Commit**

```bash
git add src/i18n/use-locale-path.ts src/i18n/use-locale-path.test.ts src/components/header.tsx src/routes/index.tsx
git commit -s -m "i18n: keep internal links inside the active locale"
```

---

### Task 6: Language switcher

**Files:**
- Create: `src/components/locale-switcher.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `LOCALES`, `localePath` from `src/i18n/paths.ts`, `useLocale` from `src/i18n/context.ts`, `TLink` from `src/components/page-transition.tsx`, `useLocation` from `react-router`.
- Produces: `<LocaleSwitcher />` and `<LocaleSwitcher variant="landing" />`.

The switcher links to the current path with the prefix swapped, so changing language holds the reader's place. It renders plain links, never a redirect. The spec rules out any load-time redirect, including a remembered choice, because a client-side redirect fights the prerendered pages.

It is a dropdown, not a row of five links. The desktop header pill already carries Home, five nav links, and the theme toggle, and five more inline items would make twelve in one fixed-width pill. The trigger shows the active locale's code, and the open menu lists the five native labels from the manifest, which is what a reader who cannot read the current language scans for.

- [ ] **Step 1: Write the component**

Create `src/components/locale-switcher.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TLink } from './page-transition'
import { LOCALES, localePath } from '../i18n/paths'
import { useLocale } from '../i18n/context'

// Each option keeps its own language and its own lang attribute, so a reader who cannot
// read the active locale can still find theirs, and a screen reader switches voice.
export function LocaleSwitcher({ variant = 'header' }: { variant?: 'header' | 'landing' }) {
  const { pathname } = useLocation()
  const active = useLocale()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const landing = variant === 'landing'
  const trigger = landing
    ? 'text-bone/70 hover:text-bone'
    : 'text-charcoal/60 hover:text-gold dark:text-bone/60 dark:hover:text-gold'
  const panel = landing
    ? 'border-bone/20 bg-charcoal/95 text-bone'
    : 'border-charcoal/10 bg-bone/95 text-charcoal dark:border-bone/10 dark:bg-charcoal/95 dark:text-bone'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('nav.language')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-1 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${trigger}`}
      >
        {active.code}
        <span aria-hidden className={`text-[8px] transition-transform ${open ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full z-50 mt-2 flex min-w-36 flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-lg ${panel}`}
        >
          {LOCALES.map((l) => (
            <TLink
              key={l.code}
              role="menuitem"
              to={localePath(pathname, l)}
              hrefLang={l.htmlLang}
              lang={l.htmlLang}
              aria-current={l.code === active.code ? 'true' : undefined}
              className={`flex items-center justify-between gap-4 px-4 py-2 text-sm transition-colors hover:bg-gold/10 ${
                l.code === active.code ? 'text-gold' : ''
              }`}
            >
              {l.label}
              {l.code === active.code && <span aria-hidden>&#10003;</span>}
            </TLink>
          ))}
        </div>
      )}
    </div>
  )
}
```

Two notes on this code. `src/components/page-transition.tsx:4` re-exports react-router's `Link` as `TLink` and `NavLink` as `TNavLink`, and the switcher wants `TLink` because it styles its own active state. And the dismissal effects are written inline rather than reusing the `useOutsideClick` at `src/routes/blips/index.tsx:29`, which is local to that route file. Extracting it into a shared hook would mean editing an unrelated route, which is outside this task.

- [ ] **Step 2: Mount it in the header**

In `src/components/header.tsx`, import the component and place it after `<ThemeToggle />` in both navs.

Desktop nav, after line 91:

```tsx
        <span aria-hidden className="h-4 w-px bg-charcoal/15 dark:bg-bone/15" />
        <LocaleSwitcher />
```

Mobile nav, after the `<ThemeToggle />` on line 103, add `<LocaleSwitcher />` before `<Hamburger .../>`.

- [ ] **Step 3: Mount it on the landing**

`src/App.tsx` renders no header on `/`, so the landing needs its own mount. In `src/routes/index.tsx`, add `<LocaleSwitcher variant="landing" />` directly after the closing `</nav>` of the nav pill row.

Note that `StatusStrip` was removed from this file in commit `da1176a`, so the nav pill row now sits directly under the tagline. Do not reintroduce it.

- [ ] **Step 4: Verify by hand**

Use the dev server that is already running. Do not start another.

From `/blog/hello-world`, open the switcher and click 简体中文. Confirm the URL becomes `/zh/blog/hello-world` and the page stays on the same post. Open it again and click English, confirming it returns to `/blog/hello-world`.

Confirm the menu closes on an outside click, on Escape, and after navigating. Confirm the trigger shows the active code and the open menu marks the active row. Confirm the switcher appears on the landing page and in the mobile header bar.

- [ ] **Step 5: Commit**

```bash
git add src/components/locale-switcher.tsx src/components/header.tsx src/routes/index.tsx
git commit -s -m "i18n: add the language switcher"
```

---

### Task 7: Move chrome strings into the catalog

**Files:**
- Modify: `src/components/header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/accessibility-panel.tsx`
- Modify: `src/components/table-of-contents.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/about/index.tsx`
- Modify: `src/routes/blog/index.tsx`
- Modify: `src/routes/blog/post.tsx`
- Modify: `src/routes/blog/post-hero.tsx`
- Modify: `src/routes/blips/index.tsx`
- Modify: `src/routes/portfolio/index.tsx`
- Modify: `src/routes/research/index.tsx`
- Modify: `src/routes/stack/index.tsx`
- Modify: `src/routes/stack/editorial.tsx`
- Modify: `src/routes/stack/graph.tsx`
- Modify: `src/routes/not-found.tsx`
- Modify: `src/i18n/locales/en.json`

**Interfaces:**
- Consumes: `useTranslation` from `react-i18next`, the catalog from Task 2.
- Produces: an `en.json` holding every chrome string, which Task 8 translates.

Translate interface text only: navigation, buttons, headings, labels, empty states, aria labels, and 404 copy. Leave anything that is content. Do not touch `src/routes/portfolio/content/*.tsx`, `src/routes/portfolio/detail-*.tsx`, `src/components/ocloak/*`, `src/components/veil/*`, or the blip text rendered by `src/components/inline-blips.tsx`.

Key naming follows the file: `nav.*`, `footer.*`, `landing.*`, `blog.*`, `portfolio.*`, `research.*`, `stack.*`, `blips.*`, `about.*`, `notFound.*`, `a11y.*`, `toc.*`.

- [ ] **Step 1: Convert the header**

`src/components/header.tsx` holds the pattern for every other file.

Add the import:

```tsx
import { useTranslation } from 'react-i18next'
```

Change the `links` array at lines 6 to 12 so it carries keys instead of English, and drop the now unused `jp` field, whose values moved into `ja.json` in Task 2:

```tsx
const links = [
  { to: '/about', key: 'nav.about' },
  { to: '/blog', key: 'nav.blog' },
  { to: '/portfolio', key: 'nav.portfolio' },
  { to: '/research', key: 'nav.research' },
  { to: '/stack', key: 'nav.stack' },
]
```

In `Header()`, add `const { t } = useTranslation()` and render `{t(l.key)}` in both `links.map` bodies. Replace the literal `Home` in both navs with `{t('nav.home')}`.

In `ThemeToggle()`, add `const { t } = useTranslation()` and change `aria-label="Toggle theme"` to `aria-label={t('nav.themeToggle')}`.

In `Hamburger()`, take `t` as a prop from `Header` rather than calling the hook again, and change the aria label to `aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}`.

- [ ] **Step 2: Convert the footer**

In `src/components/site-footer.tsx`, add the import and `const { t } = useTranslation()` inside `SiteFooter`. Change `aria-label="Get in touch"` on line 96 to `aria-label={t('footer.getInTouchLabel')}` and the `get in touch` text on line 103 to `{t('footer.getInTouch')}`.

Leave the `word` prop alone. It is a decorative display word set by each page, and it is `aria-hidden`.

- [ ] **Step 3: Convert the landing**

In `src/routes/index.tsx`, change the `scroll` literal on line 109 to `{t('landing.scroll')}`, and move the `NAV` array to keys the same way the header's `links` array changed. Leave `NAME` and `HANDLE` as they are, since a proper noun does not translate. Move `TAGLINE` into the catalog as `landing.tagline`.

- [ ] **Step 4: Convert the remaining pages**

Work through the rest of the file list one file at a time. For each file: add `useTranslation`, add every visible interface string to `src/i18n/locales/en.json` under the file's key prefix, and replace the literal with `t('key')`.

Add the note about post language while converting `src/routes/blog/index.tsx`. Import `useLocale` from `../../i18n/context`, render `{t('blog.postsInEnglish')}` above the post list, and show it only when the active locale is not the default:

```tsx
const locale = useLocale()
...
{!locale.default && (
  <p className="font-mono text-xs text-charcoal/50 dark:text-bone/50">{t('blog.postsInEnglish')}</p>
)}
```

Commit after each file so a mistake is easy to isolate.

- [ ] **Step 5: Verify no chrome literals remain**

Run:

```bash
grep -rnE '>[A-Z][a-z]+( [a-z]+)* *<' src/routes/blog src/routes/stack src/routes/research src/routes/about src/routes/blips src/routes/not-found.tsx src/components/header.tsx src/components/site-footer.tsx
```

Expected: no hits other than content prose you deliberately left English. Read every hit and decide, since this grep cannot tell chrome from content.

- [ ] **Step 6: Run the full test suite and the build**

Run: `pnpm test && pnpm build`
Expected: all tests pass, build exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/locales/en.json src/routes src/components
git commit -s -m "i18n: move chrome strings into the catalog"
```

---

### Task 8: Translation script

**Files:**
- Create: `scripts/translate-ui.mjs`
- Create: `src/i18n/translations.lock.json`
- Modify: `package.json`
- Modify: `justfile`

**Interfaces:**
- Consumes: `src/i18n/locales.json`, `src/i18n/locales/en.json`.
- Produces: filled `fi.json`, `de.json`, `ja.json`, `zh.json`, and a `translations.lock.json` mapping each key to the SHA-256 of its English source.

The script runs by hand and never in the build. Without the lock file, a translation silently keeps a stale meaning the first time its English source changes.

- [ ] **Step 1: Confirm the current model id**

The model id belongs in the endpoint URL, and published model names go stale fast. Check Google's current model list at https://ai.google.dev/gemini-api/docs/models before writing the constant, and pick the full Flash tier rather than Flash Lite.

Verify the key loads without printing it:

```bash
node --env-file=$HOME/Projects/goob/.env -e "console.log('key loaded:', !!process.env.GEMINI_API_KEY)"
```

Expected: `key loaded: true`

- [ ] **Step 2: Write the script**

Create `scripts/translate-ui.mjs`:

```js
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Confirmed against https://ai.google.dev/gemini-api/docs/models before each run.
const MODEL = 'gemini-flash-latest'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const LOCALES = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8'))
const EN_PATH = 'src/i18n/locales/en.json'
const LOCK_PATH = 'src/i18n/translations.lock.json'

const force = process.argv.includes('--force')
const checkOnly = process.argv.includes('--check')

const key = process.env.GEMINI_API_KEY
if (!key && !checkOnly) {
  console.error('GEMINI_API_KEY is not set. Run with: node --env-file=<path to .env> scripts/translate-ui.mjs')
  process.exit(1)
}

const sha = (s) => createHash('sha256').update(s).digest('hex')
const tokens = (s) => new Set(Array.from(s.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1]))
const sameTokens = (a, b) => a.size === b.size && [...a].every((x) => b.has(x))
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {})
const writeJson = (p, o) =>
  writeFileSync(p, JSON.stringify(Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]])), null, 2) + '\n')

const english = JSON.parse(readFileSync(EN_PATH, 'utf8'))
const lock = readJson(LOCK_PATH)

const staleKeys = Object.keys(english).filter((k) => force || lock[k] !== sha(english[k]))

async function translate(locale, entries) {
  const prompt = [
    `Translate this JSON object of user interface strings from English into ${locale.label} (${locale.htmlLang}).`,
    'These are navigation labels, buttons, headings, and accessibility labels for a personal website',
    'about software engineering, security research, and AI systems.',
    '',
    'Rules:',
    '- Return only a JSON object. No prose, no code fence.',
    '- Keep every key exactly as given.',
    '- Keep every {{placeholder}} token exactly as written, including its spelling.',
    '- Keep the register casual and short. These are interface labels, not documentation.',
    '- Leave proper nouns, brand names, and technology names untranslated.',
    '',
    JSON.stringify(entries, null, 2),
  ].join('\n')

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  })
  if (!res.ok) throw new Error(`${locale.code}: ${res.status} ${await res.text()}`)
  const body = await res.json()
  return JSON.parse(body.candidates[0].content.parts[0].text)
}

if (checkOnly) {
  if (staleKeys.length) {
    console.error(`stale or untranslated keys: ${staleKeys.join(', ')}`)
    process.exit(1)
  }
  console.log('translations are current')
  process.exit(0)
}

let failed = false
for (const locale of LOCALES.filter((l) => !l.default)) {
  const path = `src/i18n/locales/${locale.code}.json`
  const catalog = readJson(path)
  const missing = Object.keys(english).filter((k) => !(k in catalog))
  const todo = [...new Set([...staleKeys, ...missing])]
  if (!todo.length) {
    console.log(`${locale.code}: up to date`)
    continue
  }

  const translated = await translate(locale, Object.fromEntries(todo.map((k) => [k, english[k]])))

  for (const k of todo) {
    const value = translated[k]
    if (typeof value !== 'string') {
      console.error(`${locale.code}: ${k} came back as ${typeof value}, keeping the previous value`)
      failed = true
      continue
    }
    if (!sameTokens(tokens(value), tokens(english[k]))) {
      console.error(`${locale.code}: ${k} changed its {{placeholders}}, keeping the previous value`)
      failed = true
      continue
    }
    catalog[k] = value
  }

  for (const k of Object.keys(catalog)) if (!(k in english)) delete catalog[k]
  writeJson(path, catalog)
  console.log(`${locale.code}: wrote ${todo.length} keys`)
}

if (failed) {
  console.error('some keys were rejected. The lock file is unchanged, so the next run retries them.')
  process.exit(1)
}

writeJson(LOCK_PATH, Object.fromEntries(Object.keys(english).map((k) => [k, sha(english[k])])))
console.log(`lock updated for ${Object.keys(english).length} keys`)
```

- [ ] **Step 3: Seed the lock file**

Create `src/i18n/translations.lock.json`:

```json
{}
```

An empty lock makes every key stale, so the first run translates the whole catalog.

- [ ] **Step 4: Add the package script**

In `package.json`, add to `scripts`:

```json
    "i18n:translate": "node --env-file=${GEMINI_ENV_FILE:-$HOME/Projects/goob/.env} scripts/translate-ui.mjs",
    "i18n:check": "node scripts/translate-ui.mjs --check",
```

`GEMINI_ENV_FILE` lets the path be overridden per machine, and the default points at the file that already holds the key. No key value enters the repo.

- [ ] **Step 5: Run it**

Run: `pnpm i18n:translate`
Expected: four lines reporting written key counts, then a lock update line.

- [ ] **Step 6: Verify the catalogs**

Run: `pnpm test src/i18n/catalogs.test.ts`
Expected: PASS.

Then read `src/i18n/locales/de.json` and `src/i18n/locales/ja.json` by eye. Confirm the Japanese nav values from Task 2 survived, and that nothing came back wrapped in a code fence.

- [ ] **Step 7: Tighten the parity test now that the catalogs are full**

Task 2 checked orphan keys in one direction only, because the target catalogs started empty. They are full now, so the check becomes symmetric and will catch a key added to `en.json` and never translated.

In `src/i18n/catalogs.test.ts`, replace the `never carries a key English does not have` test with:

```ts
  it('carries exactly the English key set', () => {
    const english = Object.keys(catalogs.en).sort()
    for (const l of LOCALES) {
      expect(Object.keys(catalogs[l.code]).sort(), `${l.code}.json`).toEqual(english)
    }
  })
```

Run: `pnpm test src/i18n/catalogs.test.ts`
Expected: PASS.

- [ ] **Step 8: Verify the staleness check works**

Change one English value in `src/i18n/locales/en.json`, then run:

Run: `pnpm i18n:check`
Expected: exit 1, naming the key you changed.

Run: `pnpm i18n:translate`
Expected: each locale reports 1 key written.

Revert your edit to `en.json` and run `pnpm i18n:translate` once more so the catalogs match again.

- [ ] **Step 9: Commit**

```bash
git add scripts/translate-ui.mjs package.json src/i18n/translations.lock.json src/i18n/locales src/i18n/catalogs.test.ts
git commit -s -m "i18n: add the translation script and fill the catalogs"
```

---

### Task 9: Prerender every locale and emit hreflang

**Files:**
- Modify: `vite.config.ts:29-44`
- Modify: `scripts/postbuild.mjs`

**Interfaces:**
- Consumes: `src/i18n/locales.json`.
- Produces: a `dist/` tree carrying every route in every locale, and a sitemap with reciprocal `xhtml:link` alternates.

- [ ] **Step 1: Cross the prerender routes with the locales**

In `vite.config.ts`, add the import near the other reads at the top:

```ts
import { readFileSync } from 'node:fs'

const locales = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8'))
```

Then replace the `additionalPrerenderRoutes` array:

```ts
      additionalPrerenderRoutes: (() => {
        const bare = [
          '/', '/blog', '/portfolio', '/research', '/stack', '/blips', '/404',
          ...blogSlugs.map((s) => `/blog/${s}`),
          ...projectSlugs.map((s) => `/portfolio/${s}`),
        ]
        // the plugin prerenders '/' on its own, so the bare root would be a duplicate
        return locales.flatMap((l) =>
          bare
            .filter((r) => !(l.default && r === '/'))
            .map((r) => (r === '/' ? l.prefix : `${l.prefix}${r}`)),
        )
      })(),
```

`/about` is missing from the current list and stays missing, since it is not in the file today. Leave that alone; changing it is a separate concern.

- [ ] **Step 2: Verify the tree**

Run: `pnpm build`

```bash
ls dist/zh dist/de/blog | head
grep -o '<html lang="[^"]*"' dist/index.html dist/zh/index.html dist/de/blog/index.html
```

Expected: `dist/zh` and `dist/de/blog` exist, and the three `lang` values are `en`, `zh-Hans`, and `de`. This completes the check deferred in Task 4.

- [ ] **Step 3: Keep the redirect stubs and the feed English**

In `scripts/postbuild.mjs`, the `/posts/<slug>/` stubs already build from `posts`, which reads only `src/content/blog/`, so they stay English with no change. The feed is the same. Add a comment above the sitemap section recording the decision, since a future reader will wonder:

```js
// One feed, English only. Locale pages carry translated chrome around identical English
// posts, so a per-locale feed would ship the same items N times.
```

- [ ] **Step 4: Emit hreflang alternates in the sitemap**

In `scripts/postbuild.mjs`, replace the sitemap block that starts at `const shippedRoutes` with:

```js
const locales = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8'))
const byPrefix = new Map(locales.map((l) => [l.prefix, l]))

// map a shipped route back to (locale, bare path) so alternates can be grouped
function split(route) {
  const first = `/${route.split('/')[1]}`
  const locale = byPrefix.get(first)
  if (locale && !locale.default) {
    const rest = route.slice(first.length)
    return { locale, bare: rest === '' ? '/' : rest }
  }
  return { locale: locales.find((l) => l.default), bare: route }
}

const shippedRoutes = findPageDirs(dist)
  .filter((r) => !r.startsWith('/posts/') && r !== '/404')
  .sort()

// group by bare path so every URL in a cluster links to every other, which hreflang requires
const clusters = new Map()
for (const route of shippedRoutes) {
  const { locale, bare } = split(route)
  if (!clusters.has(bare)) clusters.set(bare, new Map())
  clusters.get(bare).set(locale.code, route)
}

const urls = shippedRoutes
  .map((route) => {
    const { bare } = split(route)
    const cluster = clusters.get(bare)
    const alternates = [...cluster.entries()]
      .map(([code, url]) => {
        const l = locales.find((x) => x.code === code)
        return `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${ORIGIN}${url}"/>`
      })
      .join('\n')
    const xDefault = cluster.get(locales.find((l) => l.default).code)
    const fallback = xDefault
      ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${xDefault}"/>`
      : ''
    return `  <url>\n    <loc>${ORIGIN}${route}</loc>\n${alternates}${fallback}\n  </url>`
  })
  .join('\n')

writeFileSync(
  `${dist}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`,
)
```

Alternates must be reciprocal and must name only pages that shipped. Both fall out of building the clusters from the walked `dist/` tree rather than from the manifest.

- [ ] **Step 5: Verify the sitemap**

Run: `pnpm build`

```bash
head -20 dist/sitemap.xml
grep -c 'hreflang="x-default"' dist/sitemap.xml
grep -c '<loc>' dist/sitemap.xml
```

Expected: the two counts match, since every cluster has an English member. Confirm the first `<url>` block lists five `xhtml:link` alternates.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts scripts/postbuild.mjs
git commit -s -m "i18n: prerender every locale and emit hreflang alternates"
```

---

### Task 10: Chinese font coverage

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: the `locale` prop already in scope inside `LocaleTree`, and `headState.lang` in `src/main.tsx`.
- Produces: a Noto Sans SC stylesheet that loads only on `/zh` pages.

None of the four loaded families cover Hanzi. Zen Kaku Gothic New covers Japanese, and the Latin families cover Finnish and German once their diacritic coverage is confirmed.

- [ ] **Step 1: Confirm Latin Extended coverage**

On the running dev server, open `/de` and check that ä, ö, ü, and ß render in the nav and headings rather than falling back to a system face. Finnish needs ä and ö from the same set.

If any glyph falls back, widen the Fontshare request in `index.html:97` by adding `&subset=latin-ext` and re-check.

- [ ] **Step 2: Load the Chinese face only where it is needed**

In `src/App.tsx`, inside `LocaleTree`, add the effect after the existing `document.documentElement.lang` effect:

```tsx
  // Hanzi has no coverage in the four base families, and a CJK face is far too large to
  // load for the four locales that never render one
  useEffect(() => {
    if (locale.code !== 'zh') return
    const id = 'noto-sans-sc'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
    document.head.appendChild(link)
  }, [locale.code])
```

For the prerendered pages, add the same stylesheet to the head elements in `src/main.tsx`, guarded on the language, immediately before the `return`:

```tsx
  if (headState.lang === 'zh-Hans') {
    elements.push({
      type: 'link',
      props: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap',
      },
    })
  }
```

- [ ] **Step 3: Put the face in the stack**

`src/styles/global.css:21-33` declares the families as Tailwind 4 `@theme` tokens, and every font utility resolves `var(--font-body)` and friends at use time. Redefining those tokens under a selector therefore reaches every utility with no rule duplication.

Add this after the `@theme` block:

```css
/* Hanzi falls back per family rather than per rule, because every font utility reads these
   tokens through var(). Zen Kaku Gothic New already covers ja in --font-display. */
:lang(zh-Hans) {
  --font-display: 'Amulya', 'Noto Sans SC', 'Zen Kaku Gothic New', sans-serif;
  --font-body: 'Satoshi', 'Noto Sans SC', sans-serif;
  --font-prose: 'Supreme', 'Noto Sans SC', sans-serif;
}
```

`--font-mono` stays as it is. Code and identifiers render in JetBrains Mono in every locale.

- [ ] **Step 4: Verify**

Run: `pnpm build && pnpm preview`

Open `/zh` and confirm Chinese renders in Noto Sans SC. Open `/de` and confirm the Noto stylesheet is absent from the network panel.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/styles/global.css
git commit -s -m "i18n: load a Chinese face on zh pages only"
```

---

### Task 11: Full verification

**Files:**
- Modify: none, unless a check fails.

- [ ] **Step 1: Run the suite**

Run: `pnpm test`
Expected: every test passes, including the manifest, path, and catalog checks.

- [ ] **Step 2: Run the build**

Run: `pnpm build`
Expected: exit 0, and the postbuild line reports the redirect and sitemap counts.

- [ ] **Step 3: Check for a hydration flash**

Run: `pnpm preview`, then open `/ja` with the network throttled to Slow 3G.

Expected: Japanese nav labels are present in the first paint and never swap from English. A swap means a catalog is loading asynchronously, which contradicts the synchronous init in Task 2.

- [ ] **Step 4: Check the language markup across the tree**

```bash
grep -o '<html lang="[^"]*"' dist/index.html dist/fi/index.html dist/de/index.html dist/ja/index.html dist/zh/index.html
```

Expected: `en`, `fi`, `de`, `ja`, `zh-Hans`.

- [ ] **Step 5: Confirm the English URLs did not move**

```bash
test -f dist/blog/index.html && test -f dist/posts/hello-world/index.html && echo "English URLs intact"
```

Expected: `English URLs intact`. The legacy redirect stubs and the bare blog path are the reason English stays unprefixed, so a regression here defeats the whole URL design.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -s -m "i18n: fix issues found in full verification"
```
