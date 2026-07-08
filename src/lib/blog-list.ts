import type { Post } from './posts'

// subsequence "fuzzy" match: every char of the query appears in order (not necessarily
// contiguous) in the text. Substrings still match, so it's a strict superset of the old
// behaviour — just more forgiving of typos/partials. Plenty for a small blog; no lib needed.
export function fuzzyMatch(text: string, query: string): boolean {
  let i = 0
  for (const ch of query) {
    i = text.indexOf(ch, i)
    if (i === -1) return false
    i += 1
  }
  return true
}

export function filterPosts(posts: Post[], q: string): Post[] {
  const query = q.trim().toLowerCase()
  if (!query) return posts
  return posts.filter(
    (p) =>
      fuzzyMatch(p.title.toLowerCase(), query) ||
      fuzzyMatch(p.description.toLowerCase(), query) ||
      p.tags.some((t) => fuzzyMatch(t.toLowerCase(), query)),
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
