export const MEANING_PREFIX = 'in-search-of-meaning-'

export const isMeaningSlug = (slug: string) => slug.startsWith(MEANING_PREFIX) && slug.length > MEANING_PREFIX.length

export type DoodleKind = 'question' | 'spiral' | 'arrow' | 'star'
export type Doodle = { after: string; kind: DoodleKind; side: 'left' | 'right' }
export type VoiceMeta = { agit: number; audio?: string }

export type MeaningPost = {
  hero: { text: string; svg?: string }
  /** `after` is a headingId(); renaming the heading drops the doodle. */
  doodles?: Doodle[]
  /** By line index in the post's [!voices] block, so the markdown holds only translatable text. */
  voices?: Partial<VoiceMeta>[]
}

export const MEANING_POSTS: Record<string, MeaningPost> = {
  'in-search-of-meaning-01': { hero: { text: 'cogito, ergo sum' } },
}

// Rises to the peak three quarters of the way through, then the last line settles.
function defaultAgitation(index: number, count: number) {
  if (count <= 1) return 0.5
  if (index === count - 1) return 0.12
  return Math.min(1, 0.2 + (0.8 * index) / ((count - 1) * 0.75))
}

export function voiceMeta(slug: string, index: number, count: number): VoiceMeta {
  const given = MEANING_POSTS[slug]?.voices?.[index]
  return { agit: given?.agit ?? defaultAgitation(index, count), ...(given?.audio ? { audio: given.audio } : {}) }
}
