import { describe, expect, it } from 'vitest'
import { bubbleAt, figureCentreY, FLY_MS, labelAlign, LAYOUT, orbitAngle, reach, RETURN_MS, snap, SPIRAL_RAD, TURN_MS } from './orbit'

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6)

describe('orbitAngle', () => {
  it('starts bubble 0 at the top and spaces six bubbles 60 degrees apart', () => {
    close(orbitAngle(0, 6, 0, null), -Math.PI / 2)
    close(orbitAngle(1, 6, 0, null) - orbitAngle(0, 6, 0, null), Math.PI / 3)
  })

  it('turns once per TURN_MS', () => {
    close(orbitAngle(2, 6, TURN_MS, null) - orbitAngle(2, 6, 0, null), 2 * Math.PI)
  })

  it('spirals in while flying and lands on the orbit angle', () => {
    close(orbitAngle(0, 6, 0, 0) - orbitAngle(0, 6, 0, null), SPIRAL_RAD)
    close(orbitAngle(0, 6, 0, FLY_MS), orbitAngle(0, 6, 0, null))
  })
})

describe('reach', () => {
  it('grows from 0 to 1 over the fly-out, holds in orbit, and falls back to 0 on return', () => {
    expect(reach({ kind: 'fly', t: 0 })).toBe(0)
    expect(reach({ kind: 'fly', t: FLY_MS })).toBe(1)
    expect(reach({ kind: 'orbit' })).toBe(1)
    expect(reach({ kind: 'return', t: 0 })).toBe(1)
    expect(reach({ kind: 'return', t: RETURN_MS })).toBe(0)
  })
})

describe('bubbleAt', () => {
  const desk = LAYOUT.desk
  it('sits on the ellipse around the orbit centre at full reach', () => {
    const p = bubbleAt([0, 0], desk, 0, 1)
    close(p.x, desk.around[0] + desk.rx)
    close(p.y, desk.around[1])
  })

  it('sits at its start point at zero reach', () => {
    const p = bubbleAt([5, -9], desk, 1.2, 0)
    expect([p.x, p.y]).toEqual([5, -9])
  })

  it('is far only above the threshold and once mostly out', () => {
    expect(bubbleAt([0, 0], desk, -Math.PI / 2, 1).far).toBe(true)
    expect(bubbleAt([0, 0], desk, Math.PI / 2, 1).far).toBe(false)
    expect(bubbleAt([0, 0], desk, Math.asin(-0.1), 1).far).toBe(false)
    expect(bubbleAt([0, 0], desk, -Math.PI / 2, 0.5).far).toBe(false)
  })

  it('uses the phone ellipse', () => {
    const p = bubbleAt([0, 0], LAYOUT.phone, Math.PI, 1)
    close(p.x, -150)
    close(p.y, 10)
  })
})

describe('snap and labels', () => {
  it('snaps to the sprite scale', () => {
    expect(snap(7, 3)).toBe(6)
    expect(snap(8, 3)).toBe(9)
  })

  it('keeps labels centred on desktop and turns outer phone labels inward', () => {
    expect(labelAlign(250, LAYOUT.desk, 'desk')).toBe('center')
    expect(labelAlign(40, LAYOUT.phone, 'phone')).toBe('center')
    expect(labelAlign(140, LAYOUT.phone, 'phone')).toBe('end')
    expect(labelAlign(-140, LAYOUT.phone, 'phone')).toBe('start')
  })
})

describe('figureCentreY', () => {
  it('centres the painted rows, counting the glyph space above the head', () => {
    const f = { ms: 1, px: ['....', '.xx.', '.xx.', '....'] }
    expect(figureCentreY(f, 10)).toBe(2)
    expect(figureCentreY(f, 5)).toBe((-4 + 3) / 2)
  })
})
