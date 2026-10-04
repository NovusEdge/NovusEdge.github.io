import { describe, expect, it } from 'vitest'
import { edgeGlow, NET, pulseLevel } from './neural-net'

describe('neural net', () => {
  it('has six nodes, every edge pointing at real nodes', () => {
    expect(NET.nodes).toHaveLength(6)
    for (const [a, b] of NET.edges) {
      expect(NET.nodes[a]).toBeDefined()
      expect(NET.nodes[b]).toBeDefined()
    }
  })

  it('rises while typing and settles within half a second of a break', () => {
    let level = 0
    for (let i = 0; i < 20; i++) level = pulseLevel(level, true, 16)
    expect(level).toBeGreaterThan(0.9)
    for (let i = 0; i < 32; i++) level = pulseLevel(level, false, 16)
    expect(level).toBe(0)
  })

  it('never leaves 0..1', () => {
    expect(pulseLevel(1, true, 1000)).toBe(1)
    expect(pulseLevel(0, false, 1000)).toBe(0)
    for (let t = 0; t < 2000; t += 37) {
      const g = edgeGlow(1, 3, t)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(1)
    }
  })

  it('is dark when the level is zero', () => {
    expect(edgeGlow(0, 0, 500)).toBe(0)
  })
})
