import { describe, expect, it } from 'vitest'
import { a11ySide, deskSide } from './corners'

describe('corners', () => {
  it('puts the desk on the right only on desk-right routes', () => {
    expect(deskSide('desk')).toBe('left')
    expect(deskSide('thinking')).toBe('left')
    expect(deskSide('scientist')).toBe('left')
    expect(deskSide('desk-right')).toBe('right')
  })

  it('moves the accessibility button to the left on desk-right and keeps it right elsewhere', () => {
    expect(a11ySide('desk-right')).toBe('left')
    for (const p of ['desk', 'thinking', 'scientist'] as const) expect(a11ySide(p)).toBe('right')
  })
})
