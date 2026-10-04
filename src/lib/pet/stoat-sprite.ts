import type { Sprite } from './sprite'

// The sprite JSON is ~200 KB, so it stays out of the entry chunk. These are its
// canvas dimensions, so the box can be reserved before the data arrives.
export const STOAT_SIZE = { w: 32, h: 20 }

let loaded: Sprite | null = null
let pending: Promise<Sprite> | null = null

export const stoatIfLoaded = () => loaded

export function loadStoat() {
  pending ??= import('../../assets/sprites/stoat.json').then((m) => (loaded = m.default as unknown as Sprite))
  return pending
}
