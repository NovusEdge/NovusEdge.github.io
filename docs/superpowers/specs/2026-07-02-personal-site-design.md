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

## Design

### Color Scheme

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | Bone white `#f5f2eb` | Charcoal black `#1a1a1a` |
| Text | Charcoal black `#1a1a1a` | Bone white `#f5f2eb` |
| Primary accent | Paper blue `#6b8cae` | Paper blue `#6b8cae` |
| Secondary accent | Gold yellow `#d4a03c` | Gold yellow `#d4a03c` |

### Theme Toggle
- System preference as default
- Manual toggle in header to override

### Components
- Custom-built, no presets/templates
- Floating header with search bar
- Minimal interactivity — keep it clean

#### Blog
- Timeline list with year markers
- Search bar filters posts

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
- Color scheme implementation
- Responsive design
- Dark/light mode (if desired)
- SEO/meta tags
- Deploy to GitHub Pages

