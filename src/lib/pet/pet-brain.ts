export type Mode =
  | 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down'
  | 'startle' | 'pounce' | 'peek' | 'periscope' | 'zoomies' | 'parked' | 'desk_nap' | 'gone'
export type PetState = {
  mode: Mode
  x: number
  dir: 1 | -1
  target: number | null
  lastInput: number
  lastNear: number
  zoomLeg: 0 | 1
  home: number
  napAtDesk: boolean
  returnTo: number | null
  leaving: boolean
  still: boolean
}
export type PetEvent =
  | { type: 'tick'; now: number; width: number; roll: number; desk: number | null }
  | { type: 'input'; now: number }
  | { type: 'hover'; now: number }
  | { type: 'near'; now: number; dir: 1 | -1 }
  | { type: 'click'; now: number; roll: number }
  | { type: 'go'; now: number; target: number }
  | { type: 'follow'; now: number; target: number; roll: number }
  | { type: 'unfollow'; now: number }
  | { type: 'step'; now: number; px: number }
  | { type: 'end'; now: number }
  | { type: 'leave'; now: number; width: number; off: number }
  | { type: 'return'; now: number; width: number; off: number; target: number }

export const GROOM_AFTER = 20_000
export const LOAF_AFTER = 40_000
export const SLEEP_AFTER = 60_000
export const RUN_OVER = 24
export const ZOOMIES_PER_TICK = 0.00002
export const IGNORE_CLICK = 0.2
export const POUNCE_THRESHOLD = 0.6
export const DESK_NAP_CHANCE = 0.4
export const FOLLOW_CHANCE = 0.5
export const NEAR_COOLDOWN = 8_000

const RESTING: Mode[] = ['idle', 'groom', 'loaf', 'sleep']
const AWAKE_RESTING: Mode[] = ['idle', 'groom', 'loaf']
const ONE_SHOTS: Mode[] = ['wake', 'sit_down', 'startle', 'pounce', 'peek', 'periscope']
const CLIPS: Partial<Record<Mode, string>> = {
  idle: 'sit',
  loaf: 'curl',
  walk: 'bound',
  run: 'bound',
  zoomies: 'bound',
  parked: 'sleep',
  desk_nap: 'sleep',
}

export const clipFor = (m: Mode) => CLIPS[m] ?? m

export const stoatSpot = (m: Mode, claimed: boolean) => (claimed || m === 'gone' ? null : m === 'desk_nap' ? 'desk' : 'floor')

export const initPet = (now: number, x: number, reduced: boolean, away = false): PetState => ({
  mode: away ? 'gone' : reduced ? 'parked' : 'idle',
  x,
  dir: -1,
  target: null,
  lastInput: now,
  lastNear: -Infinity,
  zoomLeg: 0,
  home: x,
  napAtDesk: false,
  returnTo: null,
  leaving: false,
  still: reduced,
})

const restingMode = (idleFor: number): Mode =>
  idleFor >= SLEEP_AFTER ? 'sleep' : idleFor >= LOAF_AFTER ? 'loaf' : idleFor >= GROOM_AFTER ? 'groom' : 'idle'

const heading = (from: number, to: number): 1 | -1 => (to >= from ? 1 : -1)

function moveTo(s: PetState, target: number, now: number, returnTo: number | null = null): PetState {
  const d = Math.abs(target - s.x)
  return { ...s, mode: d > RUN_OVER ? 'run' : 'walk', target, dir: heading(s.x, target), lastInput: now, napAtDesk: false, returnTo }
}

const offEdge = (toward: number, width: number, off: number) => (toward < width / 2 ? -off : width + off)

function leave(s: PetState, e: Extract<PetEvent, { type: 'leave' }>): PetState {
  if (s.mode === 'gone' || s.leaving) return s
  if (s.still) return { ...s, mode: 'gone', target: null, returnTo: null }
  return { ...moveTo(s, offEdge(s.x, e.width, e.off), e.now), mode: 'run', leaving: true }
}

function comeBack(s: PetState, e: Extract<PetEvent, { type: 'return' }>): PetState {
  if (s.mode !== 'gone' && !s.leaving) return s
  const target = Math.max(0, Math.min(e.width, e.target))
  if (s.still) return { ...s, mode: 'parked', x: target, target: null }
  const x = s.leaving ? s.x : offEdge(target, e.width, e.off)
  return moveTo({ ...s, x, leaving: false }, target, e.now)
}

export function petReducer(s: PetState, e: PetEvent): PetState {
  if (e.type === 'leave') return leave(s, e)
  if (e.type === 'return') return comeBack(s, e)
  if (s.mode === 'gone') return s
  // the tick clamp would pull a leaving stoat back on screen
  if (s.leaving && e.type !== 'step') return s
  if (s.mode === 'parked' && e.type !== 'tick') return s
  switch (e.type) {
    case 'tick': {
      const room = Math.max(0, e.width)
      // a stoat bounding in from off-screen keeps its x; its target is already clamped to the room
      const x = s.target === null ? Math.min(Math.max(0, s.x), room) : s.x
      if (s.mode === 'parked' || s.mode === 'desk_nap') return { ...s, x }
      const next = { ...s, x, home: Math.min(s.home, room), target: s.target === null ? null : Math.max(0, Math.min(room, s.target)) }
      if (next.mode === 'idle' && e.roll < ZOOMIES_PER_TICK) {
        return { ...next, mode: 'zoomies', target: room, dir: heading(x, room), zoomLeg: 0, home: x }
      }
      if (!RESTING.includes(next.mode)) return next
      const mode = restingMode(e.now - next.lastInput)
      if (mode === 'sleep' && next.mode !== 'sleep' && e.desk !== null && e.roll < DESK_NAP_CHANCE) {
        const desk = Math.max(0, Math.min(room, e.desk))
        if (Math.abs(desk - x) < 1) return { ...next, mode: 'desk_nap' }
        return { ...next, mode: Math.abs(desk - x) > RUN_OVER ? 'run' : 'walk', target: desk, dir: heading(x, desk), napAtDesk: true }
      }
      return { ...next, mode }
    }
    case 'input':
      // pointermove and scroll fire at frame rate; an unchanged state skips the re-render
      if (s.mode === 'idle' && e.now - s.lastInput < 250) return s
      if (s.mode === 'sleep' || s.mode === 'desk_nap') return { ...s, mode: 'wake', lastInput: e.now }
      if (RESTING.includes(s.mode)) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, lastInput: e.now, napAtDesk: false }
    case 'hover':
      return AWAKE_RESTING.includes(s.mode) ? { ...s, mode: 'startle', lastInput: e.now } : s
    case 'near':
      if (!AWAKE_RESTING.includes(s.mode) || e.now - s.lastNear < NEAR_COOLDOWN) return s
      return { ...s, mode: 'periscope', dir: e.dir, lastNear: e.now, lastInput: e.now }
    case 'click':
      if (!AWAKE_RESTING.includes(s.mode)) return s
      if (e.roll < IGNORE_CLICK) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, mode: e.roll < POUNCE_THRESHOLD ? 'pounce' : 'peek', lastInput: e.now }
    case 'go': {
      if (s.mode === 'zoomies' || s.mode === 'desk_nap') return s
      const target = Math.max(0, e.target)
      return Math.abs(target - s.x) < 1 ? s : moveTo(s, target, e.now)
    }
    case 'follow': {
      if (!AWAKE_RESTING.includes(s.mode) || e.roll >= FOLLOW_CHANCE) return s
      const target = Math.max(0, e.target)
      return Math.abs(target - s.x) < 1 ? s : moveTo(s, target, e.now, s.returnTo ?? s.x)
    }
    case 'unfollow': {
      if (s.returnTo === null) return s
      const free = AWAKE_RESTING.includes(s.mode) || s.mode === 'walk' || s.mode === 'run' || s.mode === 'sit_down'
      if (!free || Math.abs(s.returnTo - s.x) < 1) return { ...s, returnTo: null }
      return moveTo(s, s.returnTo, e.now)
    }
    case 'step': {
      if (s.target === null) return s
      const x = s.dir === 1 ? Math.min(s.target, s.x + e.px) : Math.max(s.target, s.x - e.px)
      if (x !== s.target) return { ...s, x }
      if (s.leaving) return { ...s, x, mode: 'gone', target: null, leaving: false }
      if (s.mode === 'zoomies' && s.zoomLeg === 0) return { ...s, x, zoomLeg: 1, target: s.home, dir: heading(x, s.home) }
      if (s.napAtDesk) return { ...s, x, mode: 'desk_nap', target: null, napAtDesk: false, zoomLeg: 0 }
      return { ...s, x, mode: 'sit_down', target: null, zoomLeg: 0, lastInput: e.now }
    }
    case 'end':
      return ONE_SHOTS.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : s
  }
}
