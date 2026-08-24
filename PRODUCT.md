# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers, recruiters, and grant/funding evaluators deciding whether to hire, fund, or collaborate with NovusEdge. They skim, and they need fast proof of real, serious work.

Co-primary: NovusEdge's own identity on the web. The site exists to read unmistakably as this person, not a template.

Secondary, per project: technical peers judging depth, and people who might use or contribute to the projects (stoat, ØCLOAK, engrammic, veil, and others).

## Product Purpose

Personal portfolio and site for NovusEdge. It presents the person and the body of work: a projects portfolio with bespoke detail pages, a blog, a stack page, an about page, research, and short-form "blips". Success is a visitor leaving convinced the work is real and the maker is worth their time, and remembering the site afterward.

## Positioning

A hand-built engineer's site with visible craft and a point of view, set against the wall of templated, AI-generated portfolios. Every flagship project gets its own designed page rather than a shared card grid. The identity (dark, terminal-textured, kanji-accented) and the blunt voice are the moat; a generic portfolio builder cannot reproduce them.

## Operating Context

- Single-page React app (react-router) deployed as a static site on GitHub Pages.
- Routes: `/` (landing), `/about`, `/blog` + `/blog/:slug`, `/portfolio` + `/portfolio/:slug`, `/research`, `/stack` (+ editorial/graph views), `/blips`.
- Portfolio index at `/portfolio`: pixel-blast WebGL hero, framed carousel, side poem, global click-spark cursor.
- Project detail pages render via `src/routes/portfolio/project.tsx`: a slug in `CUSTOM_PAGES` gets a fully bespoke page, otherwise the shared `Dossier` layout. Bespoke pages so far: stoat, ØCLOAK.
- Project data lives in `src/content/projects.ts`; per-project written content in `src/routes/portfolio/content/<slug>.tsx`.

## Capabilities and Constraints

- Stack is established by the existing codebase: React 19, Vite, Tailwind CSS v4 (no config file; `@import` + `@plugin` in `src/styles/global.css`), GSAP (ScrollTrigger, SplitText), react-router.
- WebGL effects via vendored react-bits components (PixelBlast on three+postprocessing; EvilEye and others on ogl) and @paper-design/shaders-react on the landing.
- Tailwind v4 does not scan directories created after the dev server starts; new source files go in already-watched directories.
- Static hosting only: no server, no backend, no database. Everything ships as client-side assets.
- Terminology: projects carry a JP kanji tag (`jp`), a `phase` (building/shipped/etc.), a `kind`, and a `group` (now/shipped/oss/chaos).

## Brand Commitments

Binding, confirmed by the user. Future design work must not break these:

- **Voice.** Casual, blunt, a little sweary. No AI-generated smell, no marketing-speak, no LinkedIn cadence, no over-explained jokes. Trust the reader. A "rather than" sentence leads with the "rather than" clause. Commits carry no em-dashes and no co-author trailer.
- **Identity.** Dark base (charcoal `#1a1a1a`, bone `#f5f2eb`), gold accent (`#d4a03c`), JP kanji accents on projects, terminal/systems texture. Heavy geometric display font, mono for labels.
- **Bespoke pages.** Every flagship project gets its own custom-designed detail page, not a shared template.
- **Real content only.** No fabricated metrics, testimonials, stars, licenses, or claims. Only true facts about real projects.

## Evidence on Hand

- Real projects in `src/content/projects.ts` with real descriptions, tech, links, and status: stoat (local QEMU VMs, Go, AGPL), ØCLOAK (counter-surveillance hardware + network, ESP32/RF), engrammic, veil, palpatine, money-mesh, and others.
- Real written long-form content per project in `src/routes/portfolio/content/`.
- No third-party proof (press, testimonials, user counts) exists; future work must not invent any.

## Product Principles

1. Distinction over convention. The site should read as hand-made and opinionated; sameness with other portfolios is the failure mode.
2. Proof over polish-for-its-own-sake. Recruiters need to believe the work is real and deep; every flourish must still leave the substance legible fast.
3. Each flagship project is its own world. Depth and bespoke design signal seriousness better than a uniform grid.
4. Only true things. Credibility is the whole point; a single fabricated number would poison it.
5. Craft is the brand. Motion, typography, and detail carry the identity; they are the differentiator, not decoration.

## Accessibility & Inclusion

- Motion respects `prefers-reduced-motion` (WebGL and GSAP effects gate on it via `src/lib/motion.ts`).
- A site-wide accessibility panel exists, including a high-contrast mode (`.a11y-high-contrast`).
- Dark-first palette; contrast of small text on charcoal must stay legible (a recurring correction target).
