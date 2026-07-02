import { useEffect } from 'react'

// ponytail: module-global head state — single render pass per prerendered page, no context needed
export const headState = { title: 'NovusEdge', description: 'Security, systems, and writeups — personal site of NovusEdge.' }

export function Meta({ title, description }: { title?: string; description?: string }) {
  headState.title = title ? `${title} — NovusEdge` : 'NovusEdge'
  if (description) headState.description = description
  useEffect(() => {
    document.title = headState.title
  }, [title])
  return null
}
