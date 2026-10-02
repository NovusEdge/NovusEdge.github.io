import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Drawn, drawnVariants, jitterPath, type DrawnKind } from './drawn'
import { rng } from '../../lib/meaning-tangle'

const KINDS: DrawnKind[] = ['underline', 'ring', 'squiggle', 'question', 'spiral', 'arrow', 'star']

describe('drawnVariants', () => {
  it.each(KINDS)('gives three distinct, repeatable paths for %s', (kind) => {
    const v = drawnVariants(kind, 300, 40, 7)
    expect(v).toHaveLength(3)
    expect(new Set(v).size).toBe(3)
    for (const d of v) expect(d.startsWith('M')).toBe(true)
    expect(drawnVariants(kind, 300, 40, 7)).toEqual(v)
  })
})

describe('jitterPath', () => {
  it('moves every coordinate by at most the amplitude', () => {
    const out = jitterPath('M 10 10 L 20 20', 1, rng(1))
    const nums = out.match(/-?\d+(\.\d+)?/g)!.map(Number)
    expect(nums).toHaveLength(4)
    nums.forEach((n, i) => expect(Math.abs(n - [10, 10, 20, 20][i])).toBeLessThanOrEqual(1))
  })
})

describe('Drawn', () => {
  it('renders a hidden, undrawn path that effects fill in on the client', () => {
    const html = renderToStaticMarkup(<Drawn kind="ring" accent />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('ms-draw-ring')
    expect(html).toContain('ms-accent')
    expect(html).toContain('pathLength="1"')
  })
})
