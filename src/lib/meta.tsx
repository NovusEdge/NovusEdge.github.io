import { useEffect } from 'react'

// ponytail: module-global head state — single render pass per prerendered page, no context needed
const DEFAULT_DESCRIPTION = 'Security, systems, and writeups. Personal site of NovusEdge.'
export const headState = { title: 'NovusEdge', description: DEFAULT_DESCRIPTION }

export function Meta({ title, description }: { title?: string; description?: string }) {
  headState.title = title ? `${title} · NovusEdge` : 'NovusEdge'
  headState.description = description ?? DEFAULT_DESCRIPTION
  useEffect(() => {
    document.title = headState.title
  }, [title])
  return null
}
