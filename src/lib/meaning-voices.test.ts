import { describe, expect, it } from 'vitest'
import { parseVoiceItem, sideRows, voicesFromNode } from './meaning-voices'

const text = (value: string) => ({ type: 'text', value })
const el = (tagName: string, children: unknown[]) => ({ type: 'element', tagName, children })
const quote = (first: string, items: string[]) =>
  el('blockquote', [text('\n'), el('p', [text(first)]), text('\n'), el('ul', items.map((i) => el('li', [text(i)])))])

describe('parseVoiceItem', () => {
  it('reads the side from the leading arrow', () => {
    expect(parseVoiceItem('← You are thinking.')).toEqual({ side: 'left', text: 'You are thinking.' })
    expect(parseVoiceItem('  →   About what?  ')).toEqual({ side: 'right', text: 'About what?' })
  })
  it('drops an item without an arrow', () => {
    expect(parseVoiceItem('no arrow here')).toBeNull()
    expect(parseVoiceItem('→   ')).toBeNull()
  })
})

describe('voicesFromNode', () => {
  it('returns the lines of a [!voices] blockquote in order', () => {
    expect(voicesFromNode(quote('[!voices]', ['← one', '→ two', 'stray', '← three']))).toEqual([
      { side: 'left', text: 'one' },
      { side: 'right', text: 'two' },
      { side: 'left', text: 'three' },
    ])
  })
  it('leaves an ordinary blockquote alone', () => {
    expect(voicesFromNode(quote('Just a quote.', ['← one']))).toBeNull()
  })
  it('falls back to a blockquote when a translation lost every arrow', () => {
    expect(voicesFromNode(quote('[!voices]', ['- one', '* two']))).toBeNull()
  })
})

describe('sideRows', () => {
  it('stacks each side from the top, so the stage is as tall as the longer side', () => {
    const sides = ['right', 'left', 'left', 'right', 'right'] as const
    expect(sideRows(sides.map((side) => ({ side, text: 'x' })))).toEqual({ row: [1, 1, 2, 2, 3], rows: 3 })
  })
})
