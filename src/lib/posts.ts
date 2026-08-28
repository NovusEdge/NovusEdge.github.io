import { parseFrontmatter } from './frontmatter'

export type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  content: string
  toc?: boolean
  draft?: boolean
}

// Exclude locale variants (*.de.md, *.ja.md, etc.) from the English-only list
const files = import.meta.glob(['../content/blog/*.md', '!../content/blog/*.*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const localeFiles = import.meta.glob('../content/blog/*.*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

function parsePost(slug: string, raw: string): Post {
  const { data, content } = parseFrontmatter(raw)
  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || '1970-01-01',
    tags: Array.isArray(data.tags) ? data.tags : [],
    description: (data.description as string) || '',
    content,
    toc: data.toc === 'true',
    draft: data.draft === 'true',
  }
}

// Drafts list and open normally under `vite dev` and drop out of the build.
// vite.config builds the route list from the directory either way, so a draft
// still gets a prerendered URL, and getPost reads this filtered list, so that
// URL serves the not-found page in production.
export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => parsePost(path.split('/').pop()!.replace(/\.md$/, ''), raw))
  .filter((p) => !p.draft || import.meta.env.DEV)
  .sort((a, b) => b.date.localeCompare(a.date))

export async function getPost(slug: string, locale: string): Promise<Post | undefined> {
  const en = posts.find((p) => p.slug === slug)
  if (!en) return undefined
  if (locale === 'en') return en
  const key = `../content/blog/${slug}.${locale}.md`
  const loader = localeFiles[key]
  if (!loader) return en
  const raw = await loader()
  return parsePost(slug, raw)
}
