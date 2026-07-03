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
