import { useSyncExternalStore } from 'react'
import { loadPetPrefs, savePetPrefs, type PetPrefs } from './prefs'

// One loaded value per page view, shared by the layer and the settings panel.
let current: PetPrefs | null = null
const listeners = new Set<() => void>()
const get = () => (current ??= loadPetPrefs())
const SERVER: PetPrefs = { on: false }

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
