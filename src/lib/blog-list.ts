import type { Post } from './posts'

export function filterPosts(posts: Post[], q: string): Post[] {
  const query = q.trim().toLowerCase()
  if (!query) return posts
  return posts.filter(
    (p) => p.title.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query)),
  )
}

export function groupByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const groups: { year: string; posts: Post[] }[] = []
  for (const post of posts) {
    const year = post.date.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last?.year === year) last.posts.push(post)
    else groups.push({ year, posts: [post] })
  }
  return groups
}
