import { describe, expect, it } from 'vitest'
import { buildCloud, rk4, type Vec3 } from './attractor'
import { RESULTS, STATUS_KEY, TRACES, splitPost, tracesThrough } from './timeline-data'
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

describe('splitPost', () => {
  it('splits around the placeholder and the still heading without losing text', () => {
    const parts = splitPost('intro\n\n{{timeline}}\n\nmiddle\n\n## Is it real\n\nend')
    expect(parts).toEqual({ before: 'intro', middle: 'middle', tail: '## Is it real\n\nend', hasTimeline: true })
  })

  it('keeps everything when a marker is missing', () => {
    expect(splitPost('just prose')).toEqual({ before: 'just prose', middle: '', tail: '', hasTimeline: false })
    expect(splitPost('a\n\n{{timeline}}\n\nb').tail).toBe('')
    expect(splitPost('see {{timeline}} inline').hasTimeline).toBe(false)
  })

  it('finds both markers in the post, with the table gone', () => {
    const parts = splitPost(parseFrontmatter(raw).content)
    expect(parts.hasTimeline).toBe(true)
    expect(parts.before).toMatch(/## How we got here/)
    expect(parts.middle).toMatch(/^Blue has been checked/)
    expect(parts.middle).toMatch(/## The Riemann Hypothesis/)
    expect(parts.tail).toMatch(/^## Is it real/)
    expect(raw).not.toMatch(/^\|/m)
  })
})
