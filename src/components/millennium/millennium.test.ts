import { describe, expect, it } from 'vitest'
import { buildCloud, rk4, type Vec3 } from './attractor'
import { RESULTS, STATUS_KEY, TRACES, tracesThrough } from './timeline-data'
import { LOOKS, SLOTS, parsePost, slug } from './chapters'
import { ETH_C, ETH_CROSS, ON_LINE, ZEROS, blowup, smooth, subExponent } from './figure-data'
import { parseFrontmatter } from '../../lib/frontmatter'
import raw from '../../content/blog/two-millennium-problems-in-one-day.md?raw'

describe('four-wing attractor', () => {
  it('stays bounded from seeds on and off the attractor', () => {
    const seeds: Vec3[] = [[1, 1, 1], [-1, 1, -1], [0.5, -2, 1], [3, 0.2, -1], [0.01, 0.01, 0.01]]
    for (const seed of seeds) {
      let p = seed
      let max = 0
      for (let i = 0; i < 400_000; i++) {
        p = rk4(p, 0.01)
        max = Math.max(max, Math.hypot(...p))
      }
      expect(Number.isFinite(max)).toBe(true)
      expect(max).toBeLessThan(6)
    }
  })

  it('visits all four wings rather than settling on a fixed point', () => {
    let p: Vec3 = [1, 1, 1]
    const quadrants = new Set<number>()
    for (let i = 0; i < 200_000; i++) {
      p = rk4(p, 0.01)
      if (i > 5000) quadrants.add((p[0] > 0 ? 1 : 0) + (p[1] > 0 ? 2 : 0))
    }
    expect(quadrants.size).toBe(4)
  })

  it('builds one trajectory set per result, finite and ordered along each path', () => {
    const cloud = buildCloud(TRACES, 200, 0.014)
    expect(cloud.count).toBe(tracesThrough(TRACES.length) * 200)
    expect(cloud.position.every(Number.isFinite)).toBe(true)
    expect(cloud.meta[0]).toBe(0)
    expect(cloud.meta[199 * 4]).toBe(1)
    expect(cloud.meta[(cloud.count - 1) * 4 + 1]).toBe(TRACES.length - 1)
    expect(buildCloud(TRACES, 50, 0.014).position).toEqual(buildCloud(TRACES, 50, 0.014).position)
  })
})

describe('timeline data', () => {
  it('has a trace count per result and a key entry for every tone in use', () => {
    expect(TRACES).toHaveLength(RESULTS.length)
    for (const r of RESULTS) expect(STATUS_KEY[r.tone]).toBeTruthy()
    expect(tracesThrough(1)).toBe(1)
    expect(tracesThrough(RESULTS.length)).toBe(53)
  })
})

describe('parsePost', () => {
  it('splits headings into chapters and placeholder lines into slots, without losing text', () => {
    const { lead, chapters } = parsePost('intro\n\n## One (maybe)\n\na [x](https://www.example.com/a) b\n\n{{timeline}}\n\nc\n\n## Two\n\nd')
    expect(lead).toBe('intro')
    expect(chapters.map((c) => [c.id, c.title, c.aside])).toEqual([['one-maybe', 'One', '(maybe)'], ['two', 'Two', undefined]])
    expect(chapters[0].blocks).toEqual([{ kind: 'md', text: 'a [x](https://www.example.com/a) b' }, { kind: 'slot', name: 'timeline' }, { kind: 'md', text: 'c' }])
    expect(chapters[0].sources).toEqual([{ host: 'example.com', url: 'https://www.example.com/a' }])
    expect(chapters[1].blocks).toEqual([{ kind: 'md', text: 'd' }])
  })

  it('keeps an unknown or inline placeholder as text', () => {
    expect(parsePost('## A\n\nsee {{timeline}} inline\n\n{{nope}}\n\nend').chapters[0].blocks).toEqual([{ kind: 'md', text: 'see {{timeline}} inline\n\n{{nope}}\n\nend' }])
    expect(parsePost('just prose')).toEqual({ lead: 'just prose', chapters: [] })
  })

  it('gives the post eight chapters, each with a look, and every slot exactly once', () => {
    const { lead, chapters } = parsePost(parseFrontmatter(raw).content)
    expect(lead).toBe('')
    expect(chapters.map((c) => c.id)).toEqual(Object.keys(LOOKS))
    const slots = chapters.flatMap((c) => c.blocks.flatMap((b) => (b.kind === 'slot' ? [`${c.id}:${b.name}`] : [])))
    expect(slots).toEqual(['how-we-got-here:timeline', 'eth:eth_figure', 'navierstokes:ns_figure', 'the-riemann-hypothesis:rh_figure', 'the-riemann-hypothesis:proof_scale', 'is-it-real:lean_statement'])
    expect(slots).toHaveLength(SLOTS.length)
    expect(chapters[6].aside).toBe('(speculation)')
    expect(chapters[2].sources.map((s) => s.host)).toEqual(['openai.com', 'datacamp.com'])
    expect(raw).not.toMatch(/^\|/m)
    expect(slug("What's next")).toBe('whats-next')
  })

  it('points each problem at its own rows of the timeline', () => {
    const what = (id: string) => LOOKS[id].results!.map((i) => RESULTS[i].what).join(' | ')
    expect(what('eth')).toMatch(/Exponential Time Hypothesis/)
    expect(what('navierstokes')).toMatch(/\*forced\* Navier.*\| Unforced/)
    expect(what('the-riemann-hypothesis')).toMatch(/^Riemann Hypothesis/)
  })
})

describe('figure data', () => {
  it('lists the first ten zeta zeros in rising order inside the plotted range', () => {
    expect(ZEROS).toHaveLength(10)
    expect([...ZEROS].sort((a, b) => a - b)).toEqual([...ZEROS])
    expect(ZEROS[0]).toBeCloseTo(14.1347, 4)
    expect(ZEROS[9]).toBeLessThan(53)
    expect(ON_LINE.map((s) => s.share)).toEqual([41.6, 67.25, 100])
    expect(RESULTS[3].what).toContain('41.6% to 67.25%')
  })

  it('draws a sub-exponential curve that ends under the ETH floor, crossing where it says', () => {
    expect(subExponent(ETH_CROSS)).toBeCloseTo(ETH_C * ETH_CROSS, 10)
    expect(subExponent(1)).toBeLessThan(ETH_C)
    expect(subExponent(ETH_CROSS / 2)).toBeGreaterThan((ETH_C * ETH_CROSS) / 2)
    // sublinear: the exponent per variable keeps falling
    for (let x = 0.1; x < 1; x += 0.1) expect(subExponent(x + 0.1) / (x + 0.1)).toBeLessThan(subExponent(x) / x)
  })

  it('has one curve that runs away before T and one that stays bounded past it', () => {
    expect(blowup(0)).toBeCloseTo(smooth(0), 10)
    expect(blowup(0.999)).toBeGreaterThan(5)
    for (let t = 0; t <= 1.5; t += 0.05) expect(smooth(t)).toBeLessThan(0.4)
  })
})
