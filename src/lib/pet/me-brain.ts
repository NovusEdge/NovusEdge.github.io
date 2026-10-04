export type MeMode = 'still' | 'desk' | 'due' | 'standing' | 'walking' | 'returning' | 'sitting'
export type MeState = { mode: MeMode; x: number; home: number; target: number | null; dir: 1 | -1; nextWalk: number }
export type MeEvent =
  | { type: 'tick'; now: number; width: number; roll: number }
  | { type: 'end'; now: number; roll: number }
  | { type: 'step'; px: number }
  | { type: 'wrap' }
  | { type: 'reset'; now: number; roll: number }

export const WALK_EVERY_MIN = 60_000
export const WALK_EVERY_MAX = 180_000
export const WALK_MIN = 40
export const WALK_MAX = 120
// The walk clip is 16 frames at 1 px per frame, so out and back must total whole cycles.
export const WALK_UNIT = 8

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
      // Floored to a whole walk cycle past home: turning back anywhere else leaves
      // sit_down starting mid-stride when the viewport shrinks under a walk.
      const width = s.home + Math.floor((Math.max(s.home, e.width) - s.home) / WALK_UNIT) * WALK_UNIT
      if (s.mode === 'desk' && e.now >= s.nextWalk) {
        const room = width - s.home
        if (room < WALK_UNIT) return { ...s, nextWalk: nextWalkAt(e.now, e.roll) }
        const want = Math.round((WALK_MIN + e.roll * (WALK_MAX - WALK_MIN)) / WALK_UNIT) * WALK_UNIT
        return { ...s, mode: 'due', target: s.home + Math.min(room, want) }
      }
      if (s.mode === 'walking' && s.x >= width) return { ...s, mode: 'returning', x: width, target: s.home, dir: -1 }
      if (s.mode === 'returning' && s.x > width) return { ...s, x: width }
      return s
    }
    case 'wrap':
      // stand_up is drawn from desk frame 0, so leaving mid-loop would pop
      return s.mode === 'due' ? { ...s, mode: 'standing' } : s
    case 'reset':
      return { ...s, mode: 'desk', x: s.home, target: null, dir: 1, nextWalk: nextWalkAt(e.now, e.roll) }
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
