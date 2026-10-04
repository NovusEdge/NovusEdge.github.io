export type Mode = 'idle' | 'groom' | 'loaf' | 'sleep' | 'wake' | 'walk' | 'run' | 'sit_down' | 'startle' | 'pounce' | 'swat' | 'zoomies' | 'parked'
export type CatState = { mode: Mode; x: number; dir: 1 | -1; target: number | null; lastInput: number; zoomLeg: 0 | 1; home: number }
export type CatEvent =
  | { type: 'tick'; now: number; width: number; roll: number }
  | { type: 'input'; now: number }
  | { type: 'hover'; now: number }
  | { type: 'click'; now: number; roll: number }
  | { type: 'go'; now: number; target: number }
  | { type: 'step'; now: number; px: number }
  | { type: 'end'; now: number }
  | { type: 'stoat'; now: number; dir: 1 | -1; roll: number }

export const GROOM_AFTER = 20_000
export const LOAF_AFTER = 40_000
export const SLEEP_AFTER = 60_000
export const RUN_OVER = 24
export const ZOOMIES_PER_TICK = 0.00002
export const IGNORE_CLICK = 0.2

const RESTING: Mode[] = ['idle', 'groom', 'loaf', 'sleep']
const ONE_SHOTS: Mode[] = ['wake', 'sit_down', 'startle', 'pounce', 'swat']

export const clipFor = (m: Mode) => (m === 'parked' ? 'sleep' : m === 'zoomies' ? 'run' : m)

export const initCat = (now: number, x: number, reduced: boolean): CatState => ({
  mode: reduced ? 'parked' : 'idle',
  x,
  dir: -1,
  target: null,
  lastInput: now,
  zoomLeg: 0,
  home: x,
})

const restingMode = (idleFor: number): Mode =>
  idleFor >= SLEEP_AFTER ? 'sleep' : idleFor >= LOAF_AFTER ? 'loaf' : idleFor >= GROOM_AFTER ? 'groom' : 'idle'

const heading = (from: number, to: number): 1 | -1 => (to >= from ? 1 : -1)

export function catReducer(s: CatState, e: CatEvent): CatState {
  if (s.mode === 'parked') return s
  switch (e.type) {
    case 'tick': {
      const room = Math.max(0, e.width)
      const x = Math.min(Math.max(0, s.x), room)
      // a stoat chase aims past the edge; the room clamps it
      if (s.target !== null && s.target > room) s = { ...s, target: room }
      if (s.mode === 'idle' && e.roll < ZOOMIES_PER_TICK) {
        return { ...s, x, mode: 'zoomies', target: e.width, dir: heading(x, e.width), zoomLeg: 0, home: x }
      }
      if (!RESTING.includes(s.mode)) return { ...s, x }
      return { ...s, x, mode: restingMode(e.now - s.lastInput) }
    }
    case 'input':
      if (s.mode === 'sleep') return { ...s, mode: 'wake', lastInput: e.now }
      return RESTING.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : { ...s, lastInput: e.now }
    case 'hover':
      return s.mode === 'sleep' || !RESTING.includes(s.mode) ? s : { ...s, mode: 'startle', lastInput: e.now }
    case 'click':
      if (!RESTING.includes(s.mode) || s.mode === 'sleep') return s
      if (e.roll < IGNORE_CLICK) return { ...s, mode: 'idle', lastInput: e.now }
      return { ...s, mode: e.roll < 0.6 ? 'pounce' : 'swat', lastInput: e.now }
    case 'go': {
      if (s.mode === 'zoomies') return s
      const d = Math.abs(e.target - s.x)
      if (d < 1) return s
      return { ...s, mode: d > RUN_OVER ? 'run' : 'walk', target: e.target, dir: heading(s.x, e.target), lastInput: e.now }
    }
    case 'step': {
      if (s.target === null) return s
      const x = s.dir === 1 ? Math.min(s.target, s.x + e.px) : Math.max(s.target, s.x - e.px)
      if (x !== s.target) return { ...s, x }
      if (s.mode === 'zoomies' && s.zoomLeg === 0) return { ...s, x, zoomLeg: 1, target: s.home, dir: heading(x, s.home) }
      return { ...s, x, mode: 'sit_down', target: null, zoomLeg: 0, lastInput: e.now }
    }
    case 'end':
      return ONE_SHOTS.includes(s.mode) ? { ...s, mode: 'idle', lastInput: e.now } : s
    case 'stoat':
      if (s.mode === 'sleep' || !RESTING.includes(s.mode)) return s
      if (e.roll < 0.5) {
        const edge = e.dir === 1 ? Number.MAX_SAFE_INTEGER : 0
        return { ...s, mode: 'zoomies', target: edge, dir: e.dir, zoomLeg: 0, home: s.x, lastInput: e.now }
      }
      return { ...s, mode: 'startle', lastInput: e.now }
  }
}

export function lookPose(cat: { x: number; y: number }, pointer: { x: number; y: number } | null, radius: number) {
  if (!pointer) return null
  const dx = pointer.x - cat.x
  const dy = pointer.y - cat.y
  if (Math.hypot(dx, dy) > radius) return null
  if (-dy > Math.abs(dx) && -dy > 24) return 'up'
  if (Math.abs(dx) < 24) return 'center'
  return dx < 0 ? 'left' : 'right'
}
