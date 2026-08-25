import { useMemo } from 'react'

/* Engraving primitives for the money-mesh page. Both shapes are parametric and
   deterministic, so the prerendered HTML and the first client render agree.
   Point counts are the cheapest that still read as a continuous line at the
   sizes used here; raising them costs path string size, not frame time. */

// banknote engraving ink; the page ground is the paper
const INK = '#1f4536'

// hypotrochoid: the rosette a guilloche lathe cuts, one gear inside another
function rosette(R: number, r: number, d: number, turns: number, steps: number, cx: number, cy: number) {
  const pts: string[] = []
  const k = (R - r) / r
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns
    const x = cx + (R - r) * Math.cos(t) + d * Math.cos(k * t)
    const y = cy + (R - r) * Math.sin(t) - d * Math.sin(k * t)
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `M ${pts.join(' L ')}`
}

/* One rosette geometry, defined once and pointed at by every small instance.
   Inlining the paths per node put 140 kB of path text in the prerendered HTML. */
const DEF_SIZE = 200
const DEF_ID = 'mm-rosette'

export function RosetteDefs() {
  const paths = useMemo(() => {
    const c = DEF_SIZE / 2
    return Array.from({ length: 2 }, (_, i) => rosette(c - 6, (c - 6) / (3 + i * 0.06), c * 0.42, 3, 320, c, c))
  }, [])
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <g id={DEF_ID}>
          {paths.map((d, i) => (
            <path key={i} d={d} stroke={INK} strokeWidth={0.5} fill="none" opacity={0.5 - i * 0.12} />
          ))}
        </g>
      </defs>
    </svg>
  )
}

export function RosetteRef({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${DEF_SIZE} ${DEF_SIZE}`} className={className} aria-hidden fill="none">
      <use href={`#${DEF_ID}`} />
    </svg>
  )
}

export function Rosette({
  size = 220,
  className = '',
  rings = 4,
  opacity = 0.5,
}: {
  size?: number
  className?: string
  rings?: number
  opacity?: number
}) {
  const paths = useMemo(() => {
    const c = size / 2
    // each ring shifts the inner gear slightly, which is what makes the moire
    // a non-integer gear ratio makes the curve precess instead of closing, and
    // the overlap of successive passes is the moire a lathe cuts
    return Array.from({ length: rings }, (_, i) => {
      const R = c - 4
      const r = R / (6.04 + i * 0.11)
      return rosette(R, r, r * (1.5 + i * 0.05), 7, 560, c, c)
    })
  }, [size, rings])

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={INK} strokeWidth={0.35} opacity={opacity * (1 - i * 0.16)} />
      ))}
    </svg>
  )
}

/* The wave band that runs across a note. Two frequencies beating against each
   other, stacked with a vertical offset per line. */
export function Band({
  w = 900,
  h = 64,
  lines = 14,
  className = '',
  opacity = 0.4,
}: {
  w?: number
  h?: number
  lines?: number
  className?: string
  opacity?: number
}) {
  const paths = useMemo(() => {
    const out: string[] = []
    for (let l = 0; l < lines; l++) {
      const phase = (l / lines) * Math.PI * 2
      const base = (h / (lines - 1)) * l
      const pts: string[] = []
      for (let i = 0; i <= 110; i++) {
        const x = (i / 110) * w
        const y =
          base +
          Math.sin((x / w) * Math.PI * 14 + phase) * (h * 0.3) +
          Math.sin((x / w) * Math.PI * 27 + phase * 1.7) * (h * 0.12)
        pts.push(`${x.toFixed(1)},${y.toFixed(2)}`)
      }
      out.push(`M ${pts.join(' L ')}`)
    }
    return out
  }, [w, h, lines])

  return (
    <svg viewBox={`0 0 ${w} ${h * 1.35}`} className={className} preserveAspectRatio="none" aria-hidden fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={INK} strokeWidth={0.4} opacity={opacity} />
      ))}
    </svg>
  )
}
