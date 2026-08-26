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

const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// vite.config builds the route list from the directory, so a draft still gets
// a prerendered URL. getPost reads this filtered list, so that URL serves the
// not-found page.
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
      toc: data.toc === 'true',
      draft: data.draft === 'true',
    }
  })
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)
