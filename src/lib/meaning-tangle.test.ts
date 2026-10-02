import { describe, expect, it } from 'vitest'
import { drawTangle, drawTendrils, ellipseAt, makeStrokes, makeTendrils, presence, pullToward, type TangleCtx } from './meaning-tangle'

describe('tendrils', () => {
  it('start at the rim and wander outward', () => {
    const ts = makeTendrils(12, 4)
    expect(makeTendrils(12, 4)).toEqual(ts)
    for (const t of ts) {
      expect(Math.hypot(...t[0])).toBeCloseTo(1, 1)
      expect(Math.hypot(...t[t.length - 1])).toBeGreaterThan(1.5)
    }
  })
  it('stay inside the head when calm and reach further toward the lean when agitated', () => {
    const calls: number[] = []
    const ctx: TangleCtx = {
      save() {}, restore() {}, beginPath() {}, stroke() {},
      moveTo: (x: number) => void calls.push(x),
      quadraticCurveTo: (_cx: number, _cy: number, x: number) => void calls.push(x),
      strokeStyle: '', globalAlpha: 1, lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
    }
    const e = { x: 0, y: 0, rx: 60, ry: 60 }
    drawTendrils(ctx, makeTendrils(12, 4), e, 0.2, 0, '#000', 1, 1, { x: 1, y: 0 })
    expect(calls).toHaveLength(0)
    drawTendrils(ctx, makeTendrils(12, 4), e, 1, 0, '#000', 1, 1, { x: 1, y: 0 })
    expect(Math.max(...calls)).toBeGreaterThan(-Math.min(...calls))
  })
})

describe('pullToward', () => {
  const head = { x: 100, y: 100, rx: 60, ry: 80 }
  it('points at the target and grows with strength', () => {
    const weak = pullToward(head, { x: 400, y: 100 }, 0.3)
    const strong = pullToward(head, { x: 400, y: 100 }, 1)
    expect(strong.dy).toBeCloseTo(0)
    expect(strong.dx).toBeGreaterThan(weak.dx)
    expect(weak.dx).toBeGreaterThan(0)
    expect(pullToward(head, { x: 100, y: -50 }, 1).dy).toBeLessThan(0)
  })
  it('stays inside the head at full strength', () => {
    const p = pullToward(head, { x: 1000, y: 1000 }, 1)
    expect(Math.hypot(p.dx, p.dy)).toBeLessThan(head.rx / 2)
  })
  it('does not pull without strength or direction', () => {
    expect(pullToward(head, { x: 400, y: 100 }, 0)).toEqual({ dx: 0, dy: 0 })
    expect(pullToward(head, { x: 100, y: 100 }, 1)).toEqual({ dx: 0, dy: 0 })
  })
})

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

  const strokesDrawn = (rx: number, agit: number) => {
    let n = 0
    const ctx: TangleCtx = {
      save() {}, restore() {}, beginPath() {}, moveTo() {}, quadraticCurveTo() {}, stroke() { n++ },
      strokeStyle: '', globalAlpha: 1, lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
    }
    drawTangle(ctx, makeStrokes(80, 110, 5), { x: 0, y: 0, rx, ry: rx }, agit, 0, '#000', 1, 1)
    return n
  }

  it('draws fewer strokes into a small head', () => {
    expect(strokesDrawn(31, 1)).toBe(40)
  })
  it('draws about half the segments at stride 2', () => {
    const segsAt = (stride: number) => {
      let segs = 0
      let n = 0
      const ctx: TangleCtx = {
        save() {}, restore() {}, beginPath() {}, moveTo() {}, quadraticCurveTo() { segs++ }, stroke() { n++ },
        strokeStyle: '', globalAlpha: 1, lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
      }
      drawTangle(ctx, makeStrokes(80, 110, 5), { x: 0, y: 0, rx: 100, ry: 100 }, 1, 0, '#000', 1, 1, stride)
      return { segs, n }
    }
    const one = segsAt(1)
    const two = segsAt(2)
    expect(two.segs).toBeLessThan(one.segs)
    expect(two.segs).toBeLessThanOrEqual(Math.ceil(one.segs / 2) + two.n)
  })
  it('clamps an agitation above 1', () => {
    expect(strokesDrawn(100, 2)).toBe(strokesDrawn(100, 1))
  })
})

describe('stage maths', () => {
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
