import { describe, expect, it } from 'vitest'
import { loadPetPrefs, PREFS_KEY, savePetPrefs } from './prefs'

function memory(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial))
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    get length() {
      return m.size
    },
  }
}

const throwing: Storage = {
  ...memory(),
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('loadPetPrefs', () => {
  it('is on by default', () => {
    expect(loadPetPrefs(memory())).toEqual({ on: true })
  })

  it('keeps a saved off', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: JSON.stringify({ on: false }) }))).toEqual({ on: false })
  })

  it('reads a cat-era off as off', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: JSON.stringify({ cat: false, coat: 'black', stoat: 'off' }) }))).toEqual({ on: false })
  })

  it('survives garbage, non-object JSON, throwing storage and no storage', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '{nope' }))).toEqual({ on: true })
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '5' }))).toEqual({ on: true })
    expect(loadPetPrefs(throwing)).toEqual({ on: true })
    expect(loadPetPrefs(null)).toEqual({ on: true })
    expect(() => savePetPrefs({ on: false }, throwing)).not.toThrow()
  })
})
