# What Did We All Miss: the orientation portal

A bespoke page treatment for `/blog/what-did-we-all-miss`. Implementation spec.

## What it is

The essay is served as a corporate onboarding portal. Numbered modules, completion
percentages, procedural language, and an interface that measures whether you got to
the end while having no opinion on what you understood.

## Why this and not something else

The piece argues that people are too worn down to engage with anything specific, and
that real signals arrive and go unread. Wrapping it in an interface built to track
consumption makes the page disagree with its own contents. `plan-a-ai` does the same
trick by wearing the typography of the report it argues with.

## Design sources

Mid-century corporate modernism, institutional wayfinding systems, and the cold office
computing of the late seventies and eighties. Flat, gridded, symmetrical, generous with
empty space, procedurally cheerful about things that are not cheerful.

**Build all of it original.** Do not reproduce any television programme's title design,
logotype, corporate branding or set identity, and do not reproduce any streaming
service's marks, colours or card layout. Those are trade dress. Go to the shared design
lineage that sits underneath them and work from there.

## Palette

Starting values. Tune them by eye and report what you land on.

| role | hex |
| --- | --- |
| ground | `#eceee9` |
| panel | `#f6f7f4` |
| ink | `#1b2a33` |
| structural teal | `#2f6b63` |
| rule | `rgba(27, 42, 51, 0.18)` |
| alarm | `#b4401f` |

The alarm colour appears at most twice on the whole page. It is worth more when it is
rationed.

## Typography

Existing families only, no additions. `--font-display` is Amulya, `--font-body`
Satoshi, `--font-prose` Supreme, `--font-mono` JetBrains Mono.

Every institutional label, file reference, number and percentage is mono, small,
uppercase, letterspaced. Body prose stays comfortable to read; the coldness lives in the
furniture around it.

## Structure

**Header.** A file reference, a revision date, and a clearance chip. Invent a consistent
reference scheme and use it throughout.

**Hero.** The title, a procedural subtitle, and a metadata row.

**Module list.** The eight `##` headings become modules. Each row carries its number, its
title, a one-line procedural description, and a completion percentage that reflects
reading progress.

**Body.** Each module opens with a header block carrying its number and title. Prose
follows in a comfortable measure.

**Progress.** A reading indicator that fills as the reader moves. It reports position
only; it never comments on the content.

**Footer.** Offers the next item in sequence, pointing at another post on the site.

## The procedural one-liners

Each module needs a flat descriptive line that summarises the section without engaging
with it. That tone is the joke: bureaucratic neutrality applied to an essay about
exhaustion and missed signals.

You write these. Flag them clearly in your report, because they publish under the
author's name and he reviews every word that does.

## Behaviour

- Reading progress per module, driven by one scroll listener.
- Everything animated respects `prefersReducedMotion()` from `src/lib/motion.ts`.
- No new dependencies.

## How this repo does bespoke pages

Read `src/routes/blog/plan-a-page.tsx` and the `.plan-a-paper` / `.pa-*` block in
`src/styles/global.css` first, then `src/routes/blog/grid-page.tsx` and its `.fg-*`
block. Both follow the pattern:

- A page component branched by slug from `src/routes/blog/post.tsx`.
- A class added to `document.documentElement` in an effect and removed on cleanup, the
  way `.plan-a-paper`, `.fg-frost`, `.veil-dark` and `.eg-sepia` do. The site is dark by
  default, so this page forces its own light ground.
- The floating site header stays visible and gets repainted. Scope those rules to
  `header.fixed` so they do not catch the page's own masthead element.
- The shared footer gets repainted too, or it seams.
- Its own CSS block in `src/styles/global.css`.

## This replaces the encyclopedia treatment

That treatment was built for this slug before the post existed and is now superseded.
Remove it: `src/routes/blog/ency-page.tsx`, `src/components/ency-markdown.tsx`, the
`.ency-plate` / `.enc-*` block in `src/styles/global.css`, and the `EncyPage` branch and
import in `src/routes/blog/post.tsx`.

Leave `src/lib/thumbnails.ts` alone. The author is supplying new artwork separately.

## Constraints

- No new dependencies.
- No em-dashes anywhere, including CSS comments and the one-liners.
- Read files with the Read tool and change them with Edit or Write. No `sed -i`, no
  `cat >`, no heredocs. Grep, find and git on the shell are fine.
- Comments only where they carry a fact the code cannot show.
- A dev server is already running on port 5173. Use it, do not start another, do not
  stop it.
- Do not commit. Leave the work in the working tree.
- The post keeps `draft: true`.

## Acceptance

- `npx tsc --noEmit` clean.
- No new entry in `package.json`.
- Checked at 1920px and 390px, no horizontal overflow at either.
- The page forces its own ground with the site in dark mode.
- The site header is legible against the new ground and the footer does not seam.
- No trace of the encyclopedia treatment remains in the tree.
