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
  return {
    html,
    head: {
      title: headState.title,
      elements: new Set([{ type: 'meta', props: { name: 'description', content: headState.description } }]),
    },
  }
}
