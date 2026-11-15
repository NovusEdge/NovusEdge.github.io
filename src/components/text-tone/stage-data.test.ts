import { describe, expect, it } from 'vitest'
import { FLAT, READINGS, SENTENCE, STRESSED, clipKey, contour, ramp } from './stage-data'

const WORDS = SENTENCE.split(' ')

describe('stage data', () => {
  it('has the seven stressed readings in sentence order, then the flat one', () => {
    expect(STRESSED.map((r) => r.stress)).toEqual(WORDS)
    expect(READINGS).toHaveLength(8)
    expect(FLAT.src).toBe('flat.mp3')
    expect(STRESSED.map(clipKey)).toEqual(['i', 'didnt', 'say', 'she', 'stole', 'the', 'money'])
  })

  it('times every word of every reading, in order, inside the clip', () => {
    for (const r of READINGS) {
      expect(r.words.map((w) => w.word)).toEqual(WORDS)
      r.words.forEach((w, i) => {
        expect(w.end).toBeGreaterThan(w.start)
        if (i) expect(w.start).toBeGreaterThanOrEqual(r.words[i - 1].start)
      })
      expect(r.words.at(-1)!.end).toBeLessThanOrEqual(r.duration)
    }
  })

  it('turns each reading into voiced strokes within the trace height', () => {
    for (const r of READINGS) {
      const strokes = contour(r)
      expect(strokes.length).toBeGreaterThan(0)
      for (const g of strokes) {
        expect(g.length).toBeGreaterThan(2)
        for (const p of g) expect(Math.abs(p.h)).toBeLessThanOrEqual(1.3)
      }
    }
  })

  it('maps time through word anchors and clamps outside them', () => {
    const x = ramp([[0, 0], [1, 10], [2, 30]])
    expect([x(-1), x(0.5), x(1.5), x(5)]).toEqual([0, 5, 20, 30])
  })
})
