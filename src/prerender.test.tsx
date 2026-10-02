import { describe, expect, it } from 'vitest'
import { prerender } from './main'
import { getPost } from './lib/posts'
import { OPENJEV_SLUG } from './lib/openjev-data'

describe('blog prerendering', () => {
  it.each(['plan-a-ai', 'googles-13-billion-in-finland', 'what-did-we-all-miss'])('publishes article metadata for %s', async (slug) => {
    const page = await prerender({ url: `/blog/${slug}/` })
    const post = await getPost(slug, 'en')
    const elements = [...page.head.elements]
    const canonical = `https://khimani.dev/blog/${slug}/`

    expect(elements).toContainEqual({ type: 'link', props: { rel: 'canonical', href: canonical } })
    expect(elements).toContainEqual({ type: 'meta', props: { property: 'og:url', content: canonical } })
    expect(elements).toContainEqual({ type: 'meta', props: { property: 'og:type', content: 'article' } })
    expect(elements).toContainEqual({ type: 'meta', props: { name: 'twitter:title', content: page.head.title } })
    const article = graphNode(elements, 'BlogPosting')
    expect(article).toMatchObject({ headline: post!.title, url: canonical, inLanguage: 'en', author: { '@id': PERSON_ID } })
  })

  it('uses translated article metadata and canonical URLs', async () => {
    const page = await prerender({ url: '/fi/blog/hello-world/' })
    const elements = [...page.head.elements]
    expect(elements).toContainEqual({ type: 'link', props: { rel: 'canonical', href: 'https://khimani.dev/fi/blog/hello-world/' } })
    expect(graphNode(elements, 'BlogPosting')).toMatchObject({ inLanguage: 'fi', headline: 'hei, maailma!' })
    const crumbs = (graphNode(elements, 'WebPage').breadcrumb as { itemListElement: { item: string }[] }).itemListElement
    expect(crumbs.map((crumb) => crumb.item)).toEqual(['https://khimani.dev/fi/', 'https://khimani.dev/fi/blog/', 'https://khimani.dev/fi/blog/hello-world/'])
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

    expect(page.head.title).toBe('What Did We All Miss? · Aliasgar Khimani')
    expect(page.html).toContain('The Million Dollar Joke')
    expect(page.html).not.toContain('<!--$!-->')
    expect([...page.head.elements]).toContainEqual({
      type: 'meta',
      props: { property: 'og:image', content: 'https://khimani.dev/assets/blog/fatigue-thumb.webp' },
    })
  })

  it('renders the OpenJev board inline for readers without the rail', async () => {
    const page = await prerender({ url: `/blog/${OPENJEV_SLUG}` })

    expect(page.html).toContain('class="oj-board"')
    expect(page.html).toContain('~chance')
    expect(page.html).toContain('id="ablations"')
    expect(page.html).toContain('pa-body')
    expect(page.html).not.toMatch(/<canvas\b/)
  })

  it('features the OpenJev post on the blog index with a still frame', async () => {
    const page = await prerender({ url: '/blog' })

    expect(page.html).toContain('/assets/blog/openjev-still.webp')
    expect(page.html).not.toContain('/assets/blog/openjev-thumb.gif')
  })

  it('keeps missing posts as not found after rendering an article', async () => {
    await prerender({ url: '/blog/what-did-we-all-miss' })
    const page = await prerender({ url: '/blog/missing-post' })

    expect(page.head.title).toBe('404 · Aliasgar Khimani')
    expect(page.html).not.toContain('<!--$!-->')
    expect([...page.head.elements].some((element) => element.props.property === 'og:image')).toBe(false)
    expect([...page.head.elements].some((element) => element.props.type === 'application/ld+json')).toBe(false)
  })

  it('waits for translated content and records the locale metadata', async () => {
    const page = await prerender({ url: '/fi/blog/hello-world' })

    expect(page.head.title).toBe('hei, maailma! · Aliasgar Khimani')
    expect(page.head.lang).toBe('fi')
    expect(page.html).toContain('hei, maailma!')
    expect(page.html).not.toContain('<!--$!-->')
  })
})

describe('structured data', () => {
  it('names the site and its owner on the home page', async () => {
    const page = await prerender({ url: '/' })
    const elements = [...page.head.elements]

    expect(page.head.title).toBe('Aliasgar Khimani | NovusEdge | Systems Architect')
    expect(graphNode(elements, 'WebSite')).toMatchObject({ name: 'Aliasgar Khimani', url: 'https://khimani.dev/' })
    expect(graphNode(elements, 'Person')).toMatchObject({ '@id': PERSON_ID, name: 'Aliasgar Khimani', alternateName: 'NovusEdge' })
    expect(graphNode(elements, 'WebPage')).toMatchObject({ mainEntity: { '@id': PERSON_ID } })
    expect(graphNode(elements, 'WebPage')).not.toHaveProperty('breadcrumb')
  })

  it('marks the about page as the profile page', async () => {
    const page = await prerender({ url: '/about' })
    expect(graphNode([...page.head.elements], 'ProfilePage')).toMatchObject({ mainEntity: { '@id': PERSON_ID } })
  })

  it('describes a project with a breadcrumb back to the portfolio', async () => {
    const page = await prerender({ url: '/portfolio/docket' })
    const elements = [...page.head.elements]

    expect(graphNode(elements, 'SoftwareSourceCode')).toMatchObject({
      name: 'docket',
      codeRepository: 'https://github.com/NovusEdge/docket',
      author: { '@id': PERSON_ID },
    })
    const crumbs = (graphNode(elements, 'WebPage').breadcrumb as { itemListElement: { name: string }[] }).itemListElement
    expect(crumbs.map((crumb) => crumb.name)).toEqual(['Aliasgar Khimani', 'Portfolio', 'docket'])
  })

  it('lists every project on the portfolio, crediting upstream ones to him as a contributor', async () => {
    const page = await prerender({ url: '/portfolio' })
    const list = graphNode([...page.head.elements], 'CollectionPage').mainEntity as { itemListElement: { item: Record<string, unknown> }[] }
    const items = list.itemListElement.map((entry) => entry.item)

    expect(items.find((item) => item.name === 'docket')).toMatchObject({ author: { '@id': PERSON_ID } })
    const deepspeed = items.find((item) => item.name === 'DeepSpeed')
    expect(deepspeed).toMatchObject({ contributor: { '@id': PERSON_ID } })
    expect(deepspeed).not.toHaveProperty('author')
  })
})

const PERSON_ID = 'https://khimani.dev/#person'

function graphNode(elements: { type: string; props: Record<string, string>; children?: string }[], type: string) {
  const script = elements.find((element) => element.props.type === 'application/ld+json')
  const graph = JSON.parse(script!.children!)['@graph'] as Record<string, unknown>[]
  return graph.find((node) => node['@type'] === type)!
}
