import { useSyncExternalStore } from 'react'
import { loadPetPrefs, savePetPrefs, type PetPrefs } from './prefs'

// One loaded value per page view: with blocked storage every loadPetPrefs call re-rolls
// the coat, so the layer and the settings panel must read the same object.
let current: PetPrefs | null = null
const listeners = new Set<() => void>()
const get = () => (current ??= loadPetPrefs())
const SERVER: PetPrefs = { cat: false, coat: 'tuxedo', stoat: 'off' }

export function usePetPrefs(): [PetPrefs, (next: PetPrefs) => void] {
  const prefs = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    get,
    () => SERVER,
  )
  const set = (next: PetPrefs) => {
    current = next
    savePetPrefs(next)
    listeners.forEach((l) => l())
  }
  return [prefs, set]
}
