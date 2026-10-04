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
  it('picks a random coat on the first visit and remembers it', () => {
    const s = memory()
    const first = loadPetPrefs(s, () => 0.99)
    expect(first).toEqual({ cat: true, coat: 'shiny', stoat: 'normal' })
    expect(JSON.parse(s.getItem(PREFS_KEY)!).coat).toBe('shiny')
    expect(loadPetPrefs(s, () => 0).coat).toBe('shiny')
  })

  it('keeps saved values', () => {
    const s = memory({ [PREFS_KEY]: JSON.stringify({ cat: false, coat: 'black', stoat: 'off' }) })
    expect(loadPetPrefs(s)).toEqual({ cat: false, coat: 'black', stoat: 'off' })
  })

  it('replaces an unknown coat or frequency', () => {
    const s = memory({ [PREFS_KEY]: JSON.stringify({ cat: true, coat: 'calico', stoat: 'always' }) })
    expect(loadPetPrefs(s, () => 0)).toEqual({ cat: true, coat: 'tuxedo', stoat: 'normal' })
  })

  it('survives garbage JSON', () => {
    expect(loadPetPrefs(memory({ [PREFS_KEY]: '{nope' }), () => 0).coat).toBe('tuxedo')
  })

  it('survives storage that throws, and without storage at all', () => {
    expect(loadPetPrefs(throwing, () => 0)).toEqual({ cat: true, coat: 'tuxedo', stoat: 'normal' })
    expect(loadPetPrefs(null, () => 0).cat).toBe(true)
    expect(() => savePetPrefs({ cat: true, coat: 'orange', stoat: 'rare' }, throwing)).not.toThrow()
  })
})
