import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './styles/global.css'

// mount synchronously: a top-level `await import(...)` here made the entry an async
// module and the mount side-effect silently never ran in the prerendered build.
if (typeof window !== 'undefined') {
  const root = document.getElementById('root')!
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
  if (root.childElementCount > 0) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

export async function prerender(data: { url: string }) {
  const { renderToString } = await import('react-dom/server')
  const { StaticRouter } = await import('react-router')
  const { headState } = await import('./lib/meta')
  const html = renderToString(
    <StaticRouter location={data.url}>
      <App />
    </StaticRouter>,
  )
  const elements: { type: string; props: Record<string, string> }[] = [
    { type: 'meta', props: { name: 'description', content: headState.description } },
    { type: 'meta', props: { property: 'og:title', content: headState.title } },
    { type: 'meta', props: { property: 'og:description', content: headState.description } },
  ]
  if (headState.image) {
    const imageUrl = `https://novusedge.github.io${headState.image}`
    elements.push(
      { type: 'meta', props: { property: 'og:image', content: imageUrl } },
      { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
      { type: 'meta', props: { name: 'twitter:image', content: imageUrl } },
    )
  }
  return {
    html,
    head: {
      title: headState.title,
      elements: new Set(elements),
    },
  }
}
