# Personal Site Redesign

## Overview

Complete rework of NovusEdge.github.io as a custom-built personal website for weekly blogs, portfolio projects, and research papers.

## Stack

| Layer | Choice |
|-------|--------|
| Bundler | Vite |
| Framework | React 19 |
| Language | TypeScript |
| Routing | react-router-dom v7 (remix-run) |
| Styling | Tailwind CSS |
| Animation | GSAP (scroll + transitions) |
| Markdown | react-markdown or MDX (TBD) |
| Deploy | GitHub Pages (static build) |
| Prerender | vite-prerender-plugin (for deep links + SEO) |

## Site Structure

### Pages

1. **Landing** (`/`) — TSX, hero + intro
2. **Blog** (`/blog`) — TSX, timeline list with year markers + search
3. **Blog Post** (`/blog/:slug`) — TSX wrapper rendering markdown content
4. **Portfolio** (`/portfolio`) — TSX, full-page scroll sections
5. **Project** (`/portfolio/:slug`) — TSX, custom design per-project
6. **Research** (`/research`) — TSX, cards grid + list toggle
7. **Paper** (`/research/:slug`) — TSX, custom design per-paper

### File Structure

```
src/
  main.tsx              # Entry + router setup
  routes/
    index.tsx           # Landing
    blog/
      index.tsx         # Timeline list + search
      [slug].tsx        # Post renderer (loads markdown)
    portfolio/
      index.tsx         # Projects grid
      [slug].tsx        # Per-project page
    research/
      index.tsx         # Papers list
      [slug].tsx        # Per-paper page
  components/           # Shared UI components
  content/
    blog/*.md           # Markdown blog posts
  styles/               # Global styles, Tailwind config
public/
  assets/               # Images, favicons, etc.
```

## Content Migration

Old content in `OLD_CONTENT/` to port:
- `_posts/*.md` — 12 blog posts (THM writeups, Linux Journeys, personal)
- `_drafts/*.md` — 1 draft
- `assets/` — images, gifs

**URL Redirects:** Old Chirpy URLs (`/posts/hello-world/`) must redirect to new scheme (`/blog/hello-world`) to preserve inbound links.

**External content to port (Phase 6, fetch later):**
- Blog post: https://blog.engrammic.ai/on-building-something-engrammic
- Research papers: https://engrammic.ai/research (includes DOI links) → seed `/research`

## Technical Considerations

- **Prerendering:** Required for GitHub Pages — deep links 404 without it. Use vite-prerender-plugin in Phase 1.
- **SEO:** Per-page meta tags + OG images require prerendering. Add RSS feed + sitemap in Phase 7.
- **Theme flash:** Inline `<head>` script to set dark/light class before hydration.
- **Markdown pipeline:** Frontmatter schema (title, date, tags, description), syntax highlighting (shiki/rehype-pretty-code), image path handling.
- **Reduced motion:** Respect prefers-reduced-motion — disable wipes/parallax, keep opacity fades.
- **Mobile:** Full-page scroll-snap can be janky on mobile/trackpad — fallback to plain stacked sections.

## Design

### Color Scheme

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | Bone white `#f5f2eb` | Charcoal black `#1a1a1a` |
| Text | Charcoal black `#1a1a1a` | Bone white `#f5f2eb` |
| Primary accent | Paper blue `#4a7095` | Paper blue `#6b8cae` |
| Secondary accent | Gold yellow `#d4a03c` | Gold yellow `#d4a03c` |

### Theme Toggle
- System preference as default
- Manual toggle in header to override

### Visual Direction — "Open + Anime"

**Typography**
- Display: Zen Kaku Gothic New or M PLUS 1 (Google Fonts)
- Body: Inter or same as display
- Mono accent: JetBrains Mono — small, uppercase, tracked-out for dates/tags/nav
- Signature: tiny vertical Japanese labels beside headings (ブログ, 研究, 作品)

**Graphic Motifs**
- Thin 1px rules with gold dot/square terminus
- Registration marks (+) at section corners
- Numbered sections: "01 / PORTFOLIO" in mono
- Optional: subtle halftone dot texture at low opacity

**Motion (GSAP)**
- Fast-then-settle easing: power3.out, 0.6-0.8s
- Color wipe page transitions (charcoal panel sweep)
- Staggered text reveals on headings
- Hover: underline draws left-to-right, links shift 2px (150ms)
- prefers-reduced-motion: disable wipes/parallax, keep opacity fades

**Color Discipline**
- 90% bone/charcoal as primary
- Gold = rare accent moments (active nav, selection, hero detail)
- Paper blue = links/interactive only
- Near-invisible warm gray for alternating section tints (#e8e4da light / #242424 dark)

**Anti-Cheese Rules**
- No particles, glow, neon, or anime characters
- Japanese text only as small structural labels
- Max one wipe per navigation

### Components
- Custom-built, no presets/templates
- Floating header with search bar
- Minimal interactivity — keep it clean

#### Header
- Pill-shaped, floating, glassmorphic
- Consistent across all pages

#### Landing
- Hero only — clean and focused
- No additional sections
- Animated cosmos strip (`public/assets/cosmos.webp`): plays 3 times then freezes on last frame (loop count encoded in the file, no JS)

#### Blog
- Index: Timeline list with year markers, search bar
- Post: Centered single column (Medium-style reading)

#### Portfolio
- Full-page scroll sections (scroll-snap)
- Each section = one project, full viewport height
- Layout: text left | vertical line | image right
- Transitions/animations between sections
- Individual project subpages: custom design per project

#### Research
- Cards grid (default view)
- List view toggle
- Individual paper subpages: custom design per paper

## Build Phases

### Phase 1: Foundation
- Vite + React + TypeScript setup
- react-router-dom routing
- Tailwind CSS config
- Prerendering setup (vite-prerender-plugin)
- Theme toggle with inline head script (no flash)
- Basic layout/nav component

### Phase 2: Landing Page
- Hero section
- Intro/about content
- Navigation

### Phase 3: Blog
- Timeline list with year markers
- Search functionality
- Markdown rendering pipeline
- Individual post pages

### Phase 4: Portfolio
- Full-page scroll sections with scroll-snap
- Text left / line / image right layout
- Scroll transitions/animations
- Individual project subpages (custom per project)

### Phase 5: Research
- Cards grid with list view toggle
- Individual paper subpages (custom per paper)

### Phase 6: Content Migration
- Port old blog posts
- Update asset paths
- Migrate images/gifs

### Phase 7: Polish
- Responsive design + mobile fallbacks
- SEO meta tags + OG images
- RSS feed + sitemap
- 404 page
- Deploy to GitHub Pages

