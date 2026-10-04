export type MeMode = 'still' | 'desk' | 'standing' | 'walking' | 'returning' | 'sitting'
export type MeState = { mode: MeMode; x: number; home: number; target: number | null; dir: 1 | -1; nextWalk: number }
export type MeEvent =
  | { type: 'tick'; now: number; width: number; roll: number }
  | { type: 'end'; now: number; roll: number }
  | { type: 'step'; px: number }

export const WALK_EVERY_MIN = 60_000
export const WALK_EVERY_MAX = 180_000
export const WALK_MIN = 40
export const WALK_MAX = 120

const nextWalkAt = (now: number, roll: number) => now + WALK_EVERY_MIN + roll * (WALK_EVERY_MAX - WALK_EVERY_MIN)

export const initMe = (now: number, home: number, reduced: boolean, roll: number): MeState => ({
  mode: reduced ? 'still' : 'desk',
  x: home,
  home,
  target: null,
  dir: 1,
  nextWalk: nextWalkAt(now, roll),
})

export function meClips(mode: MeMode) {
  if (mode === 'standing') return { desk: 'stand_up', walker: false }
  if (mode === 'sitting') return { desk: 'sit_down', walker: false }
  if (mode === 'walking' || mode === 'returning') return { desk: 'desk_empty', walker: true }
  return { desk: 'desk', walker: false }
}

export function meReducer(s: MeState, e: MeEvent): MeState {
  if (s.mode === 'still') return s
  switch (e.type) {
    case 'tick': {
      const width = Math.max(s.home, e.width)
      if (s.mode === 'desk' && e.now >= s.nextWalk) {
        return { ...s, mode: 'standing', target: Math.min(width, Math.round(s.home + WALK_MIN + e.roll * (WALK_MAX - WALK_MIN))) }
      }
      if (s.mode === 'walking' && s.x >= width) return { ...s, mode: 'returning', x: width, target: s.home, dir: -1 }
      if (s.mode === 'returning' && s.x > width) return { ...s, x: width }
      return s
    }
    case 'end':
      if (s.mode === 'standing') return { ...s, mode: 'walking', dir: 1 }
      if (s.mode === 'sitting') return { ...s, mode: 'desk', nextWalk: nextWalkAt(e.now, e.roll) }
      return s
    case 'step': {
      if (s.mode === 'walking' && s.target !== null) {
        const x = Math.min(s.target, s.x + e.px)
        return x === s.target ? { ...s, x, mode: 'returning', target: s.home, dir: -1 } : { ...s, x }
      }
      if (s.mode === 'returning') {
        const x = Math.max(s.home, s.x - e.px)
        return x === s.home ? { ...s, x, mode: 'sitting', target: null } : { ...s, x }
      }
      return s
    }
  }
}
