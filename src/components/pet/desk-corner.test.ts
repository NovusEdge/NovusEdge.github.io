import { describe, expect, it } from 'vitest'
import me from '../../assets/sprites/me.json'
import type { Sprite } from '../../lib/pet/sprite'
import { hitTop } from './desk-corner'

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
