import { describe, expect, it } from 'vitest'
import { atDesk, personaFor, stoatOnRoute } from './persona'

const list = [
  { slug: 'deep', pixel: 'thinking' },
  { slug: 'lab-notes', pixel: 'scientist' },
  { slug: 'odd', pixel: 'astronaut' },
  { slug: 'plain', pixel: undefined },
]

describe('personaFor', () => {
  it('maps the fixed routes', () => {
    expect(personaFor('/', list)).toBe('desk')
    expect(personaFor('/about', list)).toBe('desk')
    expect(personaFor('/research', list)).toBe('scientist')
    expect(personaFor('/portfolio', list)).toBe('desk-right')
    expect(personaFor('/portfolio/veil', list)).toBe('desk-right')
  })

  it('reads the pixel field from the post', () => {
    expect(personaFor('/blog/deep', list)).toBe('thinking')
    expect(personaFor('/blog/lab-notes', list)).toBe('scientist')
    expect(personaFor('/blog/plain', list)).toBe('desk')
    expect(personaFor('/blog', list)).toBe('desk')
  })

  it('falls back to the desk for unknown values and slugs', () => {
    expect(personaFor('/blog/odd', list)).toBe('desk')
    expect(personaFor('/blog/missing', list)).toBe('desk')
  })

  it('ignores the locale prefix and trailing slashes, so translations follow the English flag', () => {
    expect(personaFor('/ja/blog/deep', list)).toBe('thinking')
    expect(personaFor('/blog/deep/', list)).toBe('thinking')
    expect(personaFor('/de/research/', list)).toBe('scientist')
    expect(personaFor('/fi/portfolio/', list)).toBe('desk-right')
    expect(personaFor('/de/', list)).toBe('desk')
  })
})

describe('atDesk', () => {
  it('is true only for the desk personas', () => {
    expect(atDesk('desk')).toBe(true)
    expect(atDesk('desk-right')).toBe(true)
    expect(atDesk('thinking')).toBe(false)
    expect(atDesk('scientist')).toBe(false)
  })
})

describe('stoatOnRoute', () => {
  it('sends the stoat away on a thinking route and back after it', () => {
    expect(stoatOnRoute('desk', 'thinking', 'idle', 600, 32, 100)).toEqual([{ type: 'leave', width: 600, off: 32 }])
    expect(stoatOnRoute('thinking', 'desk', 'gone', 600, 32, 100)).toEqual([{ type: 'return', width: 600, off: 32, target: 100 }])
  })

  it('bounds somewhere new on an ordinary route change', () => {
    expect(stoatOnRoute('desk', 'desk', 'idle', 600, 32, 100)).toEqual([{ type: 'go', target: 100 }])
  })

  it('wakes a desk nap first when the desk goes away or changes corner', () => {
    expect(stoatOnRoute('desk', 'scientist', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'input' }, { type: 'go', target: 100 }])
    expect(stoatOnRoute('desk', 'desk-right', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'input' }, { type: 'go', target: 100 }])
    expect(stoatOnRoute('desk', 'desk', 'desk_nap', 600, 32, 100)).toEqual([{ type: 'go', target: 100 }])
  })
})
