import { describe, expect, it } from 'vitest'
import { isWinter, stoatCoat } from './season'

describe('season', () => {
  it('counts November through March as winter', () => {
    expect(isWinter(new Date(2026, 10, 1))).toBe(true)
    expect(isWinter(new Date(2027, 2, 31))).toBe(true)
    expect(isWinter(new Date(2026, 3, 1))).toBe(false)
    expect(isWinter(new Date(2026, 9, 31))).toBe(false)
  })

  it('puts the stoat in white for winter', () => {
    expect(stoatCoat(new Date(2026, 11, 1))).toBe('winter')
    expect(stoatCoat(new Date(2026, 6, 1))).toBe('summer')
  })
})
