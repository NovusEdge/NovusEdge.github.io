import { useEffect } from 'react'

// ponytail: module-global head state — single render pass per prerendered page, no context needed
const DEFAULT_DESCRIPTION = 'Security, systems, and writeups. Personal site of NovusEdge.'
export const headState = { title: 'NovusEdge', description: DEFAULT_DESCRIPTION, image: null as string | null }

export function Meta({ title, description, image }: { title?: string; description?: string; image?: string | null }) {
  headState.title = title ? `${title} · NovusEdge` : 'NovusEdge'
  headState.description = description ?? DEFAULT_DESCRIPTION
  headState.image = image ?? null
  useEffect(() => {
    document.title = headState.title
  }, [title])
  return null
}
