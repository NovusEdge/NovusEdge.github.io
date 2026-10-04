import { describe, expect, it } from 'vitest'
import { activation, bubbleQueue, footerNext, modeFor, type FooterEvent, type FooterState } from './footer-machine'

describe('footerNext', () => {
  const rows: [FooterState, FooterEvent, FooterState][] = [
    ['idle', 'toggle', 'bursting'],
    ['idle', 'dismiss', 'idle'],
    ['bursting', 'toggle', 'closing'],
    ['bursting', 'dismiss', 'closing'],
    ['bursting', 'burstEnd', 'open'],
    ['open', 'toggle', 'closing'],
    ['open', 'dismiss', 'closing'],
    ['open', 'burstEnd', 'open'],
    ['closing', 'toggle', 'bursting'],
    ['closing', 'dismiss', 'closing'],
    ['closing', 'closeEnd', 'idle'],
    ['idle', 'reset', 'idle'],
    ['bursting', 'reset', 'idle'],
    ['open', 'reset', 'idle'],
    ['closing', 'reset', 'idle'],
  ]
  it.each(rows)('%s + %s -> %s', (s, e, next) => expect(footerNext(s, e)).toBe(next))
})

describe('activation', () => {
  it('sends keyboard clicks and reduced motion to the card, pointer clicks to the burst', () => {
    expect(activation(0, false)).toBe('card')
    expect(activation(1, false)).toBe('burst')
    expect(activation(2, false)).toBe('burst')
    expect(activation(1, true)).toBe('card')
  })
})

describe('bubble focus modes', () => {
  it('focuses one bubble and recedes the rest', () => {
    expect([0, 1, 2].map((i) => modeFor(i, 1))).toEqual(['recede', 'focus', 'recede'])
    expect(modeFor(0, null)).toBe('normal')
  })

  it('plays the leave clip, the enter clip, then the held loop', () => {
    expect(bubbleQueue('normal', 'focus')).toEqual(['focus_in', 'focus'])
    expect(bubbleQueue('focus', 'recede')).toEqual(['focus_out', 'recede_in', 'recede'])
    expect(bubbleQueue('recede', 'normal')).toEqual(['recede_out', 'idle'])
    expect(bubbleQueue('focus', 'focus')).toEqual([])
  })
})
