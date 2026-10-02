import { describe, expect, it } from 'vitest'
import { drawTangle, ellipseAt, makeStrokes, presence, sectionProgress, stagePhase, type TangleCtx } from './meaning-tangle'

describe('makeStrokes', () => {
  it('is deterministic for a seed', () => {
    expect(makeStrokes(5, 20, 3)).toEqual(makeStrokes(5, 20, 3))
    expect(makeStrokes(5, 20, 3)).not.toEqual(makeStrokes(5, 20, 4))
  })
  it('stays roughly inside the unit circle', () => {
    for (const s of makeStrokes(40, 110, 5)) for (const [x, y] of s) expect(Math.hypot(x, y)).toBeLessThan(1.05)
  })
})

describe('drawTangle', () => {
  it('draws more and longer strokes when agitated', () => {
    const strokes = makeStrokes(80, 110, 5)
    const count = (agit: number) => {
      let n = 0
      let segs = 0
      const ctx: TangleCtx = {
        save() {}, restore() {}, beginPath() {}, moveTo() {}, quadraticCurveTo() { segs++ }, stroke() { n++ },
        strokeStyle: '', globalAlpha: 1, lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
      }
      drawTangle(ctx, strokes, { x: 0, y: 0, rx: 100, ry: 100 }, agit, 0, '#000', 1, 1)
      return { n, segs }
    }
    expect(count(0).n).toBe(20)
    expect(count(1).n).toBe(80)
    expect(count(1).segs).toBeGreaterThan(count(0).segs)
  })
})

describe('scroll maths', () => {
  it('maps a section scrolling past to 0..1', () => {
    expect(sectionProgress(100, 4200, 1000)).toBe(0)
    expect(sectionProgress(-1600, 4200, 1000)).toBe(0.5)
    expect(sectionProgress(-9000, 4200, 1000)).toBe(1)
  })
  it('pulls in, shows every line, then spills out', () => {
    expect(stagePhase(0, 8)).toEqual({ m: 0, shown: 0 })
    expect(stagePhase(0.16, 8)).toEqual({ m: 1, shown: 0 })
    expect(stagePhase(0.5, 8).shown).toBeGreaterThan(2)
    expect(stagePhase(0.86, 8)).toEqual({ m: 1, shown: 8 })
    expect(stagePhase(1, 8)).toEqual({ m: 0, shown: 8 })
  })
  it('fades the tangle in before the section and out after it', () => {
    expect(presence(1300, 5500, 1000)).toBe(0)
    expect(presence(0, 4200, 1000)).toBe(1)
    expect(presence(-4200, 0, 1000)).toBe(0)
  })
  it('moves the ellipse from the screen to the head', () => {
    const head = { x: 640, y: 300, rx: 62, ry: 78 }
    const at = ellipseAt(1, 1280, 900, head)
    for (const k of ['x', 'y', 'rx', 'ry'] as const) expect(at[k]).toBeCloseTo(head[k])
    expect(ellipseAt(0, 1280, 900, head).rx).toBeGreaterThan(900)
  })
})
