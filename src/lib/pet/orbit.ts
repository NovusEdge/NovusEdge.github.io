import type { Frame } from './sprite'

export const TURN_MS = 18000
export const FLY_MS = 900
export const RETURN_MS = 420
export const FLY_STAGGER_MS = 45
export const RETURN_STAGGER_MS = 40
export const SPIRAL_RAD = -2.4
export const FAR_SIN = -0.15

export type Mode = 'desk' | 'phone'
export type Layout = { scale: number; rx: number; ry: number; around: [number, number]; logo: number }

// CSS px from the footer friend's origin: the glyph on desktop, the figure's centre on phones
export const LAYOUT: Record<Mode, Layout> = {
  desk: { scale: 3, rx: 260, ry: 100, around: [0, 80], logo: 30 },
  phone: { scale: 2, rx: 150, ry: 80, around: [0, 10], logo: 20 },
}

export type Phase = { kind: 'fly'; t: number } | { kind: 'orbit' } | { kind: 'return'; t: number }

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const outCubic = (t: number) => 1 - (1 - t) ** 3
const inCubic = (t: number) => t ** 3

export function orbitAngle(i: number, n: number, orbitMs: number, flyMs: number | null) {
  const base = ((-90 + (i * 360) / n) * Math.PI) / 180 + (orbitMs / TURN_MS) * 2 * Math.PI
  return flyMs === null ? base : base + (1 - outCubic(clamp01(flyMs / FLY_MS))) * SPIRAL_RAD
}

export function reach(p: Phase) {
  if (p.kind === 'fly') return outCubic(clamp01(p.t / FLY_MS))
  if (p.kind === 'return') return 1 - inCubic(clamp01(p.t / RETURN_MS))
  return 1
}

export function bubbleAt(from: [number, number], l: Layout, ang: number, k: number) {
  const ox = l.rx * Math.cos(ang)
  const oy = l.ry * Math.sin(ang)
  return {
    x: from[0] + (l.around[0] + ox - from[0]) * k,
    y: from[1] + (l.around[1] + oy - from[1]) * k,
    far: Math.sin(ang) < FAR_SIN && k > 0.6,
    ox,
  }
}

export const snap = (v: number, s: number) => Math.round(v / s) * s

// On a 390 px phone the ellipse's sides leave no room for a centred label.
export function labelAlign(ox: number, l: Layout, mode: Mode): 'center' | 'start' | 'end' {
  if (mode === 'desk' || Math.abs(ox) <= l.rx / 2) return 'center'
  return ox > 0 ? 'end' : 'start'
}

// The glyph floats 9 sprite rows above its anchor, so the phone slot centres on both.
export function figureCentreY(f: Frame, anchorY: number) {
  let top = Infinity
  let bottom = -1
  f.px.forEach((row, y) => {
    if (/[^.]/.test(row)) {
      top = Math.min(top, y)
      bottom = y
    }
  })
  return (Math.min(top, anchorY - 9) + bottom + 1) / 2
}
