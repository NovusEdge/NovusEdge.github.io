import { describe, expect, it } from 'vitest'
import { drawWindows, partialStroke, scrollOut, signal, strokeLength } from './voyager'

describe('strokeLength', () => {
  it('sums the segments', () => {
    expect(strokeLength([0, 0, 3, 4, 3, 5])).toBe(6)
    expect(strokeLength([1, 1])).toBe(0)
  })
})

describe('drawWindows', () => {
  it('gives longer strokes longer windows, in order, finishing at 1', () => {
    const w = drawWindows([1, 3, 1], 0.2)
    expect(w[0][0]).toBe(0)
    expect(w[2][1]).toBeCloseTo(1)
    expect(w[1][1] - w[1][0]).toBeCloseTo(3 * (w[0][1] - w[0][0]))
    expect(w[1][0]).toBeLessThan(w[0][1])
  })
  it('handles an empty etching', () => {
    expect(drawWindows([])).toEqual([])
  })
})

describe('partialStroke', () => {
  const line = [0, 0, 2, 0, 2, 2]
  it('stops partway along a segment', () => {
    expect(partialStroke(line, 0.25)).toEqual([0, 0, 1, 0])
    expect(partialStroke(line, 0.75)).toEqual([0, 0, 2, 0, 2, 1])
  })
  it('is empty before it starts and whole once done', () => {
    expect(partialStroke(line, 0)).toEqual([])
    expect(partialStroke(line, 1)).toBe(line)
  })
})

describe('scrollOut', () => {
  it('starts in place with the greeting up and ends far off with the plate up', () => {
    expect(scrollOut(0)).toEqual({ z: -0, x: 0, y: 0, title: 1, plate: 0 })
    const end = scrollOut(1)
    expect(end.z).toBeLessThan(-60)
    expect(end.title).toBe(0)
    expect(end.plate).toBe(1)
  })
})

describe('signal', () => {
  it('drops to the sync level at the start of each line and stays in range', () => {
    expect(signal(0, 0)).toBe(-0.8)
    for (let x = 0; x <= 1; x += 0.01) {
      const v = signal(x, 2.3)
      expect(v).toBeGreaterThanOrEqual(-0.8)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})
