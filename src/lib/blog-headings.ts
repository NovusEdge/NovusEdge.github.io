import { posts } from './posts'

export function headingId(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s+/g, '-')
}

export function blogHeadings(markdown: string, slug: string) {
  const source = posts.find((post) => post.slug === slug)?.content ?? markdown
  const canonical = [...source.matchAll(/^## (.+)$/gm)]
  return [...markdown.matchAll(/^## (.+)$/gm)].map((match, index) => ({
    // Shared anchors keep translations connected to section annotations and scroll effects.
    id: headingId(canonical[index]?.[1] ?? match[1]),
    text: match[1],
    line: markdown.slice(0, match.index).split('\n').length,
  }))
}
