# Localization: UI Chrome in Five Locales

Serve the site's interface strings in English, Finnish, German, Japanese, and Simplified
Chinese. Blog posts and portfolio prose stay in English.

## Scope

In scope: navigation, buttons, headings, labels, footer, empty states, 404 copy, and date
formatting. Roughly 150 strings.

Out of scope, decided deliberately:

- Translating the 26 blog posts (27,000 words). Machine translation flattens the voice the
  site is built around, and Google's scaled-content-abuse policy names unreviewed
  auto-translation, which risks the ranking of the English pages.
- Translating portfolio detail prose, which is essay-length and carries the same problem.
- Arabic and any RTL locale. The codebase uses physical direction utilities throughout with
  zero logical properties, and none of the four loaded fonts carry Arabic glyphs. An RTL
  locale requires a logical-properties migration as its own change, done first.
- Per-locale RSS. One feed stays English and canonical.
- Localized JSON-LD. The Person block in `index.html` stays English.
- `Accept-Language` sniffing and any localStorage-driven redirect. Both require a
  client-side redirect that fights prerendering and confuses crawlers. The switcher may
  remember a choice for links it renders, never as a redirect.

## Locales

| code | URL prefix | html lang / hreflang | label |
|------|-----------|----------------------|-------|
| en | none | en | English |
| fi | /fi | fi | Suomi |
| de | /de | de | Deutsch |
| ja | /ja | ja | 日本語 |
| zh | /zh | zh-Hans | 简体中文 |

English keeps the bare paths. The sitemap, `feed.xml`, and the legacy `/posts/<slug>/`
redirect stubs written by `scripts/postbuild.mjs` all assume today's URLs, and re-prefixing
English to `/en/` would break inbound links for no gain.

The URL prefix and the language tag are separate fields because `/zh` reads better in a URL
while `zh-Hans` is the correct tag for markup and hreflang.

## Locale Manifest

`src/i18n/locales.json` is the single source of truth. Abbreviated to two of the five entries:

```json
[
  { "code": "en", "prefix": "", "htmlLang": "en", "label": "English", "default": true },
  { "code": "zh", "prefix": "/zh", "htmlLang": "zh-Hans", "label": "简体中文", "default": false }
]
```

Three files read it: `src/App.tsx` for the route tree, `vite.config.ts` for the prerender
route list, and `scripts/postbuild.mjs` for sitemap alternates. Rather than a TS module, it is
JSON, because `postbuild.mjs` is plain ESM and cannot import TypeScript.

This closes a real hole. Today `vite.config.ts:10`, `scripts/postbuild.mjs:18`, and
`src/lib/posts.ts:14` each walk `src/content/blog/` independently with their own filename
logic, so any convention change has to land in three places at once.

## Routing

The inner route tree is defined exactly once, inside a `LocaleTree` component in
`src/App.tsx`. The outer `<Routes>` mounts it once per prefixed locale and once bare:

```tsx
<Routes>
  {prefixed.map((l) => (
    <Route key={l.code} path={`${l.code}/*`} element={<LocaleTree locale={l} />} />
  ))}
  <Route path="/*" element={<LocaleTree locale={DEFAULT} />} />
</Routes>
```

React-router ranks a literal segment above a splat, so `/about` resolves to the English tree
and cannot be captured as a locale code. A single `/:locale?` pattern would swallow it,
because react-router 7 has no regex constraint on params.

`LocaleTree` provides the locale through context and renders the existing route table
unchanged. Adding a route stays a one-line edit inside `LocaleTree`.

Internal links must carry the active prefix. A `useLocalePath()` hook returns a prefixing
function, and `TNavLink` call sites route through it.

## Runtime

`react-i18next` with `i18next`, chosen over Paraglide JS and Lingui because it runs purely at
runtime. Both alternatives need a build plugin, and the prerender pass in this repo is
already held together by two module aliases and a timed `process.exit(0)` in `vite.config.ts`.

`src/i18n/index.ts` builds one `i18n.createInstance()` per locale at module load, with all
five catalogs imported statically as `resources`. No backend plugin, no lazy loading, and
`react: { useSuspense: false }`. Every string must be present synchronously on first render,
or hydration flashes English before swapping.

`fallbackLng: 'en'`, so rather than a raw key path, a missing key renders English.

Catalogs live at `src/i18n/locales/<code>.json`, flat key namespace, dotted keys such as
`nav.about`. `src/components/header.tsx:6-12` already carries a `jp` label beside each
English one, so those Japanese values seed `ja.json` directly.

Dates go through `Intl.DateTimeFormat(htmlLang)`. The prerendered string and the hydrated
string must match, so rather than picking up the environment's, the formatter takes an
explicit locale and time zone.

## Language Markup

`headState` in `src/lib/meta.tsx` gains a `lang` field, set by `LocaleTree` during render.
`src/main.tsx:44` returns it as `head.lang`.

`vite-prerender-plugin` reads `head.lang` and writes it onto the `<html>` element
(`src/plugins/prerender-plugin.js:483` in the installed package), so every prerendered page
ships correct language markup. On the client, `LocaleTree` sets
`document.documentElement.lang` in an effect for client-side navigation.

## Switcher

A compact `LocaleSwitcher` renders links to the current path with the prefix swapped, so
switching language holds your place on the page.

It mounts beside `ThemeToggle` in `src/components/header.tsx:91`, in both the desktop and
mobile navs. It also mounts in the landing's nav pill row at `src/routes/index.tsx:101`,
because `src/App.tsx:36` renders no header on `/`.

## Translation Script

`scripts/translate-ui.mjs`, run by hand, never in the build.

It reads `src/i18n/locales/en.json` and writes the other four catalogs. It posts to
`https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` with
`fetch` and no SDK dependency.

The key comes from `GEMINI_API_KEY` in the environment. No key and no absolute path belongs
in this repo, so the script never reads a `.env` file itself. Node loads one natively:

```
node --env-file=$HOME/Projects/goob/.env scripts/translate-ui.mjs
```

Rather than Flash Lite, the model is a full Flash tier, with the exact id confirmed against
Google's model docs at implementation time. Lite tiers trade quality for throughput, and
translation into Chinese and Japanese is where that shows. The whole run costs cents on
either tier, so price does not decide it.

Staleness is tracked in `src/i18n/translations.lock.json`, mapping each key to a SHA-256 hash
of its English source string. On each run the script translates keys that are missing from a
catalog and keys whose English hash no longer matches the lock, then rewrites the lock.
Without this, translations rot silently the first time an English string gets edited.

Flags: `--force` retranslates everything, `--check` exits nonzero when anything is stale.

The script validates that the set of `{{placeholder}}` tokens in each translated string
matches its English source. On a mismatch it keeps the catalog's previous value for that key,
reports the key, and exits nonzero, so a broken interpolation never reaches a catalog file.

## Build Output

`vite.config.ts` builds `additionalPrerenderRoutes` as the existing route list crossed with
every locale prefix from the manifest. Route count goes from roughly 40 to roughly 200. That
is fine for GitHub Pages and for repo size, and it multiplies build time for the blog
prerender pass by five.

In `scripts/postbuild.mjs`, the `/posts/<slug>/` redirect stubs stay English-only and skip
locale-prefixed directories, `feed.xml` stays English-only, and the sitemap gains reciprocal
`xhtml:link` hreflang alternates per page plus `x-default` pointing at the English URL.
Alternates must be reciprocal and must only name pages that exist, or the hreflang cluster is
worse than having none.

## Fonts

Finnish and German need Latin Extended coverage for ä, ö, ü, and ß. Verify the installed
Satoshi and Amulya subsets carry them before shipping, and widen the Fontshare request if not.

Japanese is already covered by Zen Kaku Gothic New, loaded in `index.html:93`.

Simplified Chinese has no coverage in any loaded family. Noto Sans SC loads only on `/zh`
pages, injected as a prerender `head` element and as a client-side effect on locale change,
so the other four locales never pay for it.

## Testing

Vitest is already configured. Four checks in `src/i18n/i18n.test.ts`:

- Every catalog has exactly the key set of `en.json`. No missing keys, no orphans.
- Every translated string carries the same `{{placeholder}}` tokens as its English source.
- The manifest has exactly one default, unique prefixes, and unique codes.
- Route resolution: `/about` renders the About page in English, `/de/about` renders it in
  German, and `/xx/about` renders the 404 page.

## Known Issue Left Alone

`src/lib/posts.ts:14` globs all 26 posts eagerly with `?raw`, so all 27,000 words already
ship in the entry bundle to every visitor on every page. Chrome-only localization does not
multiply this, so it stays as it is. Translating posts later would make it roughly five times
worse and requires making that glob lazy first.

## Files

Add:

- `src/i18n/locales.json`
- `src/i18n/index.ts`
- `src/i18n/locales/{en,fi,de,ja,zh}.json`
- `src/i18n/translations.lock.json`
- `src/i18n/i18n.test.ts`
- `src/components/locale-switcher.tsx`
- `scripts/translate-ui.mjs`

Modify:

- `src/App.tsx`, route tree and `LocaleTree`
- `src/main.tsx`, `head.lang`
- `src/lib/meta.tsx`, `lang` in `headState`
- `vite.config.ts`, prerender routes crossed with locales
- `scripts/postbuild.mjs`, hreflang alternates, English-only stubs and feed
- `src/components/header.tsx`, `src/components/site-footer.tsx`, `src/routes/index.tsx`, and
  the remaining route and component files holding chrome strings
- `index.html`, Chinese font handling

Dependencies added: `i18next`, `react-i18next`. Nothing else.
