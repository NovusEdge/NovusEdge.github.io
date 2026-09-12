import { describe, expect, it } from 'vitest'
import { prerender } from './main'
import { getPost } from './lib/posts'

describe('blog prerendering', () => {
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
    expect(page.html).toContain('The Joke About the Million Dollars')
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
