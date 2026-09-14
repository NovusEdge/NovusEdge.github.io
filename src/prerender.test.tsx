import { describe, expect, it } from 'vitest'
import { prerender } from './main'
import { getPost } from './lib/posts'

describe('blog prerendering', () => {
  it.each(['plan-a-ai', 'googles-13-billion-in-finland', 'what-did-we-all-miss'])('publishes article metadata for %s', async (slug) => {
    const page = await prerender({ url: `/blog/${slug}/` })
    const post = await getPost(slug, 'en')
    const elements = [...page.head.elements]
    const canonical = `https://novusedge.github.io/blog/${slug}/`

    expect(elements).toContainEqual({ type: 'link', props: { rel: 'canonical', href: canonical } })
    expect(elements).toContainEqual({ type: 'meta', props: { property: 'og:url', content: canonical } })
    expect(elements).toContainEqual({ type: 'meta', props: { property: 'og:type', content: 'article' } })
    expect(elements).toContainEqual({ type: 'meta', props: { name: 'twitter:title', content: page.head.title } })
    const article = JSON.parse(elements.find((element) => element.type === 'script')!.children!)
    expect(article).toMatchObject({ '@type': 'BlogPosting', headline: post!.title, url: canonical, inLanguage: 'en' })
  })

  it('uses translated article metadata and canonical URLs', async () => {
    const page = await prerender({ url: '/fi/blog/hello-world/' })
    const elements = [...page.head.elements]
    expect(elements).toContainEqual({ type: 'link', props: { rel: 'canonical', href: 'https://novusedge.github.io/fi/blog/hello-world/' } })
    const article = JSON.parse(elements.find((element) => element.type === 'script')!.children!)
    expect(article).toMatchObject({ inLanguage: 'fi', headline: 'hei, maailma!' })
  })

  it('renders the same Plan A overlays with or without a trailing slash', async () => {
    const canonical = await prerender({ url: '/blog/plan-a-ai' })
    const trailing = await prerender({ url: '/blog/plan-a-ai/' })

    expect(trailing.head.title).toBe(canonical.head.title)
    expect(trailing.html.match(/<canvas\b/g)).toEqual(canonical.html.match(/<canvas\b/g))
  })

  it('reuses a post request across suspended render retries', async () => {
    const first = getPost('what-did-we-all-miss', 'en')
    expect(getPost('what-did-we-all-miss', 'en')).toBe(first)
    await first
    expect(getPost('what-did-we-all-miss', 'en')).toBe(first)
  })

  it('renders the article and its metadata after a not-found route', async () => {
    await prerender({ url: '/404' })
    const page = await prerender({ url: '/blog/what-did-we-all-miss' })

    expect(page.head.title).toBe('What Did We All Miss? · NovusEdge')
    expect(page.html).toContain('The Million Dollar Joke')
    expect(page.html).not.toContain('<!--$!-->')
    expect([...page.head.elements]).toContainEqual({
      type: 'meta',
      props: { property: 'og:image', content: 'https://novusedge.github.io/assets/blog/fatigue-thumb.webp' },
    })
  })

  it('keeps missing posts as not found after rendering an article', async () => {
    await prerender({ url: '/blog/what-did-we-all-miss' })
    const page = await prerender({ url: '/blog/missing-post' })

    expect(page.head.title).toBe('404 · NovusEdge')
    expect(page.html).not.toContain('<!--$!-->')
    expect([...page.head.elements].some((element) => element.props.property === 'og:image')).toBe(false)
  })

  it('waits for translated content and records the locale metadata', async () => {
    const page = await prerender({ url: '/fi/blog/hello-world' })

    expect(page.head.title).toBe('hei, maailma! · NovusEdge')
    expect(page.head.lang).toBe('fi')
    expect(page.html).toContain('hei, maailma!')
    expect(page.html).not.toContain('<!--$!-->')
  })
})
