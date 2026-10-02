/** One etched line of the record cover: stroke width and flat [x0, y0, x1, y1, ...] points, in disc radii from the centre. */
export type Stroke = [number, number[]]

export function strokeLength(flat: number[]) {
  let len = 0
  for (let i = 2; i < flat.length; i += 2) len += Math.hypot(flat[i] - flat[i - 2], flat[i + 1] - flat[i - 1])
  return len
}

/**
 * When each stroke draws, as [start, end] fractions of the whole etching. Strokes take time
 * in proportion to their length so the stylus moves at one speed, and each starts a little
 * before the last ends so the drawing never stalls on a run of tiny marks.
 */
export function drawWindows(lengths: number[], overlap = 0.35) {
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  const windows: [number, number][] = []
  let at = 0
  for (const len of lengths) {
    const span = len / total
    windows.push([at, at + span])
    at += span * (1 - overlap)
  }
  // The overlap leaves the last stroke ending before 1; stretch so the etching finishes at t = 1.
  const end = windows.length ? windows[windows.length - 1][1] : 1
  return windows.map(([a, b]) => [a / end, b / end] as [number, number])
}

/** The points of a stroke drawn up to `frac` of its length, ending partway along a segment. */
export function partialStroke(flat: number[], frac: number): number[] {
  if (frac >= 1) return flat
  if (frac <= 0 || flat.length < 4) return []
  let left = strokeLength(flat) * frac
  const out = [flat[0], flat[1]]
  for (let i = 2; i < flat.length; i += 2) {
    const seg = Math.hypot(flat[i] - flat[i - 2], flat[i + 1] - flat[i - 1])
    if (seg >= left) {
      const k = seg ? left / seg : 0
      out.push(flat[i - 2] + (flat[i] - flat[i - 2]) * k, flat[i - 1] + (flat[i + 1] - flat[i - 1]) * k)
      return out
    }
    left -= seg
    out.push(flat[i], flat[i + 1])
  }
  return out
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * Where the record is as the page scrolls past it (p from 0 to 1): it drifts off and
 * shrinks to a speck while the greeting fades and the launch plate comes up.
 */
export function scrollOut(p: number) {
  const k = smoothstep(0, 1, p)
  return {
    z: -k * k * 70,
    x: k * 1.6,
    y: k * 0.9,
    title: 1 - smoothstep(0.05, 0.35, p),
    plate: smoothstep(0.55, 0.8, p),
  }
}

/**
 * A video-signal-like trace at x (0..1 across the strip) and time t in seconds: a sync
 * pulse train with noisy picture content between pulses, after the cover's waveform diagram.
 */
export function signal(x: number, t: number) {
  const u = x * 3 + t * 0.6
  const phase = u - Math.floor(u)
  if (phase < 0.06) return -0.8
  const s = Math.sin(u * 37.1) * 0.35 + Math.sin(u * 91.7 + 1.3) * 0.22 + Math.sin(u * 211.3 + t) * 0.12
  return 0.15 + s * smoothstep(0.06, 0.14, phase)
}
