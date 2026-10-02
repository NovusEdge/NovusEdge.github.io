import { describe, expect, it } from 'vitest'
import type { Font } from 'opentype.js'
import { canPen, pathData, penLayout, penLines } from './meaning-pen'

const measure = (s: string) => s.length * 10

describe('penLines', () => {
  it('wraps greedily by words', () => {
    expect(penLines('aaaa bbbb cccc', measure, 100)).toEqual(['aaaa bbbb', 'cccc'])
  })
  it('keeps a word longer than the width on its own line', () => {
    expect(penLines('a bbbbbbbbbbbbbb c', measure, 50)).toEqual(['a', 'bbbbbbbbbbbbbb', 'c'])
  })
})

// Each glyph's path data records where it was placed, so the layout is visible in the output.
const font = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  hasChar: (c: string) => /[a-z]/.test(c),
  getAdvanceWidth: (s: string, size: number) => s.length * size * 0.5,
  getPaths: (s: string, x: number, y: number, size: number) =>
    [...s].map((c, i) => ({ commands: c === ' ' ? [] : [{ type: 'M', x: x + i * size * 0.5, y }] })),
} as unknown as Font

describe('pathData', () => {
  it('writes every command type with one decimal', () => {
    expect(
      pathData([
        { type: 'M', x: 1, y: 2.25 },
        { type: 'L', x: 3, y: 4 },
        { type: 'Q', x1: 5, y1: 6, x: 7, y: 8 },
        { type: 'C', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        { type: 'Z' },
      ]),
    ).toBe('M1.0 2.3L3.0 4.0Q5.0 6.0 7.0 8.0C1.0 2.0 3.0 4.0 5.0 6.0Z')
  })
})

describe('canPen', () => {
  it('needs a glyph for every visible character', () => {
    expect(canPen(font, 'cogito ergo')).toBe(true)
    expect(canPen(font, '我思故我在')).toBe(false)
  })
})

describe('penLayout', () => {
  it('drops blank glyphs and centres each line in its line box, as CSS does', () => {
    // 20px type in a 30px line: 5px half-leading, then the 16px ascender to the baseline.
    const out = penLayout(font, 'ab cd', 20, 30, 1.5)
    expect(out.glyphs).toEqual(['M0.0 21.0', 'M10.0 21.0', 'M0.0 51.0', 'M10.0 51.0'])
    expect(out.width).toBe(20)
    expect(out.height).toBe(60)
  })
})
