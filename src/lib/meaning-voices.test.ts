import { describe, expect, it } from 'vitest'
import { linesToPlay, parseVoiceItem, voicesFromNode } from './meaning-voices'

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

describe('linesToPlay', () => {
  it('plays the line that just appeared', () => {
    expect(linesToPlay(2, 3, new Set([0, 1]))).toEqual([2])
  })
  it('plays only the newest line after a jump', () => {
    expect(linesToPlay(0, 6, new Set())).toEqual([5])
  })
  it('never replays on the way back up or down again', () => {
    expect(linesToPlay(5, 4, new Set([4]))).toEqual([])
    expect(linesToPlay(4, 5, new Set([4]))).toEqual([])
  })
  it('plays nothing before the first line', () => {
    expect(linesToPlay(0, 0, new Set())).toEqual([])
  })
})
