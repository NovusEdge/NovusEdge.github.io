export const COATS = ['tuxedo', 'orange', 'black', 'shiny'] as const
export type Coat = (typeof COATS)[number]
export type StoatFreq = 'off' | 'rare' | 'normal'
export type PetPrefs = { cat: boolean; coat: Coat; stoat: StoatFreq }

export const PREFS_KEY = 'pet-prefs'
const FREQS: StoatFreq[] = ['off', 'rare', 'normal']

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

export function loadPetPrefs(storage: Storage | null = browserStorage(), rand: () => number = Math.random): PetPrefs {
  let saved: Partial<PetPrefs> = {}
  try {
    saved = JSON.parse(storage?.getItem(PREFS_KEY) ?? '{}') ?? {}
  } catch {
    saved = {}
  }
  const known = COATS.includes(saved.coat as Coat)
  const prefs: PetPrefs = {
    cat: saved.cat !== false,
    coat: known ? (saved.coat as Coat) : COATS[Math.floor(rand() * COATS.length)],
    stoat: FREQS.includes(saved.stoat as StoatFreq) ? (saved.stoat as StoatFreq) : 'normal',
  }
  if (!known) savePetPrefs(prefs, storage)
  return prefs
}
