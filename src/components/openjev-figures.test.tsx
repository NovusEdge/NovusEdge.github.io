import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { OPENJEV_FIGURES } from './openjev-figures'
import { posts } from '../lib/posts'
import { OPENJEV_SLUG } from '../lib/openjev-data'

const post = posts.find((p) => p.slug === OPENJEV_SLUG)!

describe('OpenJev figures', () => {
  it('covers every chart image the post embeds', () => {
    const srcs = [...post.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
    expect(srcs.length).toBeGreaterThan(0)
    for (const src of srcs) expect(Object.keys(OPENJEV_FIGURES), src).toContain(src)
  })

  it('draws every figure from theme tokens only', () => {
    for (const [src, figure] of Object.entries(OPENJEV_FIGURES)) {
      expect(renderToStaticMarkup(<>{figure}</>), src).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    }
  })

  it('labels the ablation bars with the post numbers', () => {
    const html = renderToStaticMarkup(<>{OPENJEV_FIGURES['/assets/img/blog/decision-models/ablations.png']}</>)
    for (const n of ['0.637', '0.724', '0.775', '0.787', '0.812']) expect(html).toContain(n)
  })
})
