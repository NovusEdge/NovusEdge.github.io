import { useEffect } from 'react'

export const SITE_NAME = 'Aliasgar Khimani'
export const HOME_TITLE = 'Aliasgar Khimani | NovusEdge | Systems Architect'

// ponytail: module-global head state — single render pass per prerendered page, no context needed
const DEFAULT_DESCRIPTION = 'Security, systems, and writeups. Personal site of NovusEdge.'
export const headState = {
  title: HOME_TITLE,
  pageTitle: null as string | null,
  description: DEFAULT_DESCRIPTION,
  image: null as string | null,
  lang: 'en',
}

export function Meta({ title, description, image }: { title?: string; description?: string; image?: string | null }) {
  headState.title = title ? `${title} · ${SITE_NAME}` : HOME_TITLE
  headState.pageTitle = title ?? null
  headState.description = description ?? DEFAULT_DESCRIPTION
  headState.image = image ?? null
  useEffect(() => {
    document.title = headState.title
  }, [title])
  return null
}
