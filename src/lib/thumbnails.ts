import thumbnails from '../content/thumbnails.json'

type Entry = { hero: string; list?: string }
const map: Record<string, Entry> = thumbnails

// The OpenJev featured card plays the grid as an mp4 on hover; its `list` image is the resting frame.
export function getListThumbnail(slug: string): string | null {
  const e = map[slug]
  return e ? (e.list ?? e.hero) : null
}

export function getPostThumbnail(slug: string): string | null {
  return map[slug]?.hero ?? null
}
