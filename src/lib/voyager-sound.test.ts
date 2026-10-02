import { describe, expect, it } from 'vitest'
import { mix } from './voyager-sound'

const at = (s: Partial<Parameters<typeof mix>[0]>) => mix({ drawRate: 0, spin: 0, scroll: 0, signal: 0, ...s })

describe('mix', () => {
  it('is only the drone at rest', () => {
    const m = at({})
    expect(m.drone).toBeGreaterThan(0)
    expect([m.etch, m.hiss, m.scratch]).toEqual([0, 0, 0])
  })
  it('cuts while the etching draws, capped at full speed', () => {
    expect(at({ drawRate: 0.1 }).etch).toBeGreaterThan(0)
    expect(at({ drawRate: 5 }).etch).toBe(at({ drawRate: 0.25 }).etch)
  })
  it('scratches higher and louder the faster it spins, in either direction', () => {
    expect(at({ spin: -6 })).toEqual(at({ spin: 6 }))
    expect(at({ spin: 8 }).scratchHz).toBeGreaterThan(at({ spin: 2 }).scratchHz)
    expect(at({ spin: 2 }).scratch).toBeLessThan(at({ spin: 6 }).scratch)
  })
  it('fades as the record leaves', () => {
    expect(at({ scroll: 1 }).drone).toBeLessThan(at({ scroll: 0 }).drone)
    expect(at({ scroll: 1, signal: 1 }).hiss).toBeLessThan(at({ signal: 1 }).hiss)
  })
})
