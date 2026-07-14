import { parseFrontmatter } from './frontmatter'

export type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  content: string
  toc?: boolean
}

const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// ponytail: hidden slugs — uncomment when ready to publish
const HIDDEN = ['im-back-pt-1', 'im-back-pt-2', 'ai-industry-trends', 'plan-a-ai']

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
    }
  })
  .filter((p) => !HIDDEN.includes(p.slug))
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)
