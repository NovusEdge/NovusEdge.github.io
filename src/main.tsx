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
  const { prerender: renderStatic } = await import('react-dom/static')
  const { StaticRouter } = await import('react-router')
  const { headState } = await import('./lib/meta')
  const { getPost } = await import('./lib/posts')
  const { LOCALES, localeFromPath, stripLocale } = await import('./i18n/paths')
  // Blog routes suspend while loading a post, so metadata is only final once
  // the complete tree has rendered. renderToString only emits the fallback.
  const { prelude } = await renderStatic(
    <StaticRouter location={data.url}>
      <App />
    </StaticRouter>,
    { onError(error) { throw error } },
  )
  const html = await new Response(prelude).text()
  const origin = 'https://novusedge.github.io'
  const pathname = new URL(data.url, origin).pathname.replace(/\/+$/, '') || '/'
  const locale = localeFromPath(pathname)
  const slug = /^\/blog\/([^/]+)$/.exec(stripLocale(pathname))?.[1]
  const post = slug ? await getPost(slug, locale.code) : undefined
  const canonicalPath = post && post.contentLocale !== locale.code ? `/blog/${post.slug}` : pathname
  const canonical = `${origin}${canonicalPath === '/' ? '/' : `${canonicalPath}/`}`
  const elements: { type: string; props: Record<string, string>; children?: string }[] = [
    { type: 'link', props: { rel: 'canonical', href: canonical } },
    { type: 'meta', props: { name: 'description', content: headState.description } },
    { type: 'meta', props: { property: 'og:title', content: headState.title } },
    { type: 'meta', props: { property: 'og:description', content: headState.description } },
    { type: 'meta', props: { property: 'og:url', content: canonical } },
    { type: 'meta', props: { property: 'og:type', content: post ? 'article' : 'website' } },
    { type: 'meta', props: { name: 'twitter:title', content: headState.title } },
    { type: 'meta', props: { name: 'twitter:description', content: headState.description } },
    { type: 'meta', props: { name: 'twitter:card', content: headState.image ? 'summary_large_image' : 'summary' } },
  ]
  if (post) {
    for (const alternate of LOCALES) {
      const translated = await getPost(post.slug, alternate.code)
      if (translated?.contentLocale !== alternate.code) continue
      elements.push({ type: 'link', props: { rel: 'alternate', hreflang: alternate.htmlLang, href: `${origin}${alternate.prefix}/blog/${post.slug}/` } })
    }
    elements.push({ type: 'link', props: { rel: 'alternate', hreflang: 'x-default', href: `${origin}/blog/${post.slug}/` } })
    elements.push(
      { type: 'meta', props: { property: 'article:published_time', content: new Date(post.date).toISOString() } },
      {
        type: 'script',
        props: { type: 'application/ld+json' },
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: new Date(post.date).toISOString(),
          url: canonical,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          inLanguage: LOCALES.find((entry) => entry.code === post.contentLocale)?.htmlLang ?? post.contentLocale,
          author: { '@type': 'Person', name: 'NovusEdge', url: `${origin}/about/` },
          ...(headState.image ? { image: `${origin}${headState.image}` } : {}),
        }).replace(/</g, '\\u003c'),
      },
    )
  }
  if (headState.image) {
    const imageUrl = `https://novusedge.github.io${headState.image}`
    elements.push(
      { type: 'meta', props: { property: 'og:image', content: imageUrl } },
      { type: 'meta', props: { name: 'twitter:image', content: imageUrl } },
    )
  }
  if (headState.lang === 'zh-Hans') {
    elements.push({
      type: 'link',
      props: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap',
      },
    })
  }
  return {
    html,
    head: {
      lang: headState.lang,
      title: headState.title,
      elements: new Set(elements),
    },
  }
}
