import { describe, expect, it } from 'vitest'
import me from '../../assets/sprites/me.json'
import type { Sprite } from '../../lib/pet/sprite'
import { DESK_LEFT, deskX, hitTop } from './desk-corner'

const ME = me as unknown as Sprite

describe('hitTop', () => {
  it('keeps the desk click target below its clear rows', () => {
    expect(hitTop(ME, 'desk')).toBe(12)
  })

  it("reaches pixel-me's head while he stands up and sits down", () => {
    for (const clip of ['stand_up', 'sit_down']) {
      const head = Math.min(...ME.animations[clip].frames.map((f) => f.px.findIndex((r) => /[^.]/.test(r))))
      expect(head).toBeLessThan(12)
      expect(hitTop(ME, clip)).toBe(head)
    }
  })
})

describe('deskX', () => {
  it('measures from the left edge for a left desk', () => {
    expect(deskX('left', 10, 32, 2, 1000)).toBe(DESK_LEFT + 20)
  })

  it('mirrors from the right edge for a right desk', () => {
    // the span's right edge sits x desk pixels in from the desk's right edge
    expect(deskX('right', 10, 32, 2, 1000)).toBe(1000 - DESK_LEFT - (10 + 32) * 2)
    expect(deskX('right', 0, 99, 1, 400) + 99).toBe(400 - DESK_LEFT)
  })
})

describe('hitTop cap', () => {
  it('can search the whole clip when no cap applies', () => {
    expect(hitTop(ME, 'desk', Infinity)).toBeLessThanOrEqual(hitTop(ME, 'desk'))
  })
})
