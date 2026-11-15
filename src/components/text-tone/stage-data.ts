import raw from '../../data/text-tone-stage.json'

export type Word = { word: string; start: number; end: number }
export type Reading = { stress: string | null; src: string; duration: number; words: Word[]; f0: [number, number][] }
export type Point = { t: number; h: number }
export type TracePoint = { t: number; x: number; y: number }

export const SENTENCE = "I didn't say she stole the money"
export const READINGS = raw as unknown as Reading[]
export const STRESSED = READINGS.filter((r) => r.stress !== null)
export const FLAT = READINGS.find((r) => r.stress === null)!
export const clipUrl = (src: string) => `/assets/blog/didnt-say/${src}`
// The i18n keys for the meanings are the clip names.
export const clipKey = (r: Reading) => r.src.replace(/\.mp3$/, '')

// f0 as semitones about the clip's own median, 9 semitones to full height. Normalising to each clip's
// range would draw the flat reading as tall as the stressed ones. Points more than 13 semitones out are
// octave errors from the tracker; gaps over 90 ms are unvoiced.
export function contour(r: Reading): Point[][] {
  const s = r.f0.map(([t, hz]) => [t, 12 * Math.log2(hz)] as const)
  const med = s.map((p) => p[1]).sort((a, b) => a - b)[s.length >> 1]
  const pts = s.filter((p) => Math.abs(p[1] - med) < 13).map(([t, v]) => ({ t, h: (v - med) / 9 }))
  const segs: Point[][] = [[]]
  pts.forEach((p, i) => {
    if (i && p.t - pts[i - 1].t > 0.09) segs.push([])
    segs.at(-1)!.push(p)
  })
  const at = (g: Point[], i: number) => g[Math.min(g.length - 1, Math.max(0, i))].h
  return segs
    .filter((g) => g.length > 2)
    .map((g) => g.map((p, i) => ({ t: p.t, h: Math.max(-1.3, Math.min(1.3, (at(g, i - 2) + at(g, i - 1) + p.h + at(g, i + 1) + at(g, i + 2)) / 5)) })))
}

export function ramp(a: [number, number][]) {
  return (t: number) => {
    if (t <= a[0][0]) return a[0][1]
    for (let i = 1; i < a.length; i++) {
      if (t <= a[i][0]) return a[i - 1][1] + ((a[i][1] - a[i - 1][1]) * (t - a[i - 1][0])) / (a[i][0] - a[i - 1][0] || 1)
    }
    return a.at(-1)![1]
  }
}

// DrawSVG draws by length; this ease turns playback time into drawn length so the pen stays under the sound.
export function penEase(pts: TracePoint[]) {
  const L = [0]
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  const t0 = pts[0].t
  const span = pts.at(-1)!.t - t0
  return (p: number) => {
    const t = t0 + p * span
    let i = 1
    while (i < pts.length - 1 && pts[i].t < t) i++
    const f = Math.min(1, Math.max(0, (t - pts[i - 1].t) / (pts[i].t - pts[i - 1].t || 1)))
    return (L[i - 1] + (L[i] - L[i - 1]) * f) / L.at(-1)!
  }
}
