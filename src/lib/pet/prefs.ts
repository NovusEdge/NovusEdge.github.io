export type PetPrefs = { on: boolean }

export const PREFS_KEY = 'pet-prefs'

const browserStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function savePetPrefs(p: PetPrefs, storage: Storage | null = browserStorage()) {
  try {
    storage?.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    // blocked storage: the choice lasts for this page view only
  }
}

export function loadPetPrefs(storage: Storage | null = browserStorage()): PetPrefs {
  let saved: unknown = null
  try {
    saved = JSON.parse(storage?.getItem(PREFS_KEY) ?? 'null')
  } catch {
    saved = null
  }
  const o = saved && typeof saved === 'object' ? (saved as Record<string, unknown>) : {}
  // prefs saved before the stoat replaced the cat carry `cat` instead of `on`
  return { on: o.on !== false && o.cat !== false }
}
