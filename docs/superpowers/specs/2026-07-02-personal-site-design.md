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
| Markdown | react-markdown or MDX (TBD) |
| Deploy | GitHub Pages (static build) |

## Site Structure

### Pages

1. **Landing** (`/`) — TSX, hero + intro
2. **Blog** (`/blog`) — TSX, bento grid hero + chronological post list
3. **Blog Post** (`/blog/:slug`) — TSX wrapper rendering markdown content
4. **Portfolio** (`/portfolio`) — TSX, projects grid
5. **Project** (`/portfolio/:slug`) — TSX, custom styled per-project
6. **Research** (`/research`) — TSX, papers list
7. **Paper** (`/research/:slug`) — TSX, custom styled per-paper

### File Structure

```
src/
  main.tsx              # Entry + router setup
  routes/
    index.tsx           # Landing
    blog/
      index.tsx         # Bento hero + post list
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

## Design (TBD)

- Color scheme: User has one in mind (to be specified)
- Component library: Custom-built, no presets
- Bento grid: For blog hero section
- Visual vibe: To be determined

## Build Phases

### Phase 1: Foundation
- Vite + React + TypeScript setup
- react-router-dom routing
- Tailwind CSS config
- Basic layout/nav component

### Phase 2: Landing Page
- Hero section
- Intro/about content
- Navigation

### Phase 3: Blog
- Bento grid hero
- Post list component
- Markdown rendering pipeline
- Individual post pages

### Phase 4: Portfolio
- Projects grid
- Individual project pages
- Custom styling per project

### Phase 5: Research
- Papers list
- Individual paper pages
- Custom styling per paper

### Phase 6: Content Migration
- Port old blog posts
- Update asset paths
- Migrate images/gifs

### Phase 7: Polish
- Color scheme implementation
- Responsive design
- Dark/light mode (if desired)
- SEO/meta tags
- Deploy to GitHub Pages

## Open Questions

1. Color scheme details?
2. Specific component designs (bento grid style, cards, etc.)?
3. Any interactive features beyond navigation?
4. Dark mode / light mode toggle?
