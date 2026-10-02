import { useEffect, useRef } from 'react'
import { onBoil } from '../../lib/boil'
import { rng } from '../../lib/meaning-tangle'
import { prefersReducedMotion } from '../../lib/motion'
import type { DoodleKind } from '../../lib/meaning-data'

export type DrawnKind = 'underline' | 'ring' | 'squiggle' | 'strike' | 'quote' | DoodleKind

export function jitterPath(d: string, amp: number, r: () => number) {
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (parseFloat(n) + (r() - 0.5) * 2 * amp).toFixed(1))
}

// Circles as four cubics: jitterPath nudges every number, which would wreck an arc's flags.
function circ(cx: number, cy: number, rad: number) {
  const k = rad * 0.55
  return `M ${cx + rad} ${cy} C ${cx + rad} ${cy + k} ${cx + k} ${cy + rad} ${cx} ${cy + rad} C ${cx - k} ${cy + rad} ${cx - rad} ${cy + k} ${cx - rad} ${cy} C ${cx - rad} ${cy - k} ${cx - k} ${cy - rad} ${cx} ${cy - rad} C ${cx + k} ${cy - rad} ${cx + rad} ${cy - k} ${cx + rad} ${cy}`
}
const figure = (x: number) => `${circ(x, 28, 4)} M ${x} 32 L ${x} 46 M ${x} 46 L ${x - 4} 56 M ${x} 46 L ${x + 4} 56 M ${x - 5} 38 L ${x + 5} 38`

// The margin doodles, each a small picture of the paragraph it sits beside, in a 70x70 box.
const PICTURES: Partial<Record<DrawnKind, () => string>> = {
  wall: () =>
    `${figure(9)} ${figure(61)} M 26 58 L 26 22 L 44 22 L 44 58 M 26 31 L 44 31 M 26 40 L 44 40 M 26 49 L 44 49` +
    ' M 35 22 L 35 31 M 30 31 L 30 40 M 39 31 L 39 40 M 35 40 L 35 49 M 30 49 L 30 58 M 39 49 L 39 58',
  carry: () =>
    `${circ(35, 36, 5)} M 35 41 L 35 56 M 35 56 L 29 68 M 35 56 L 41 68 M 35 45 L 22 34 M 35 45 L 48 34` +
    [20, 30, 40, 50].map((x, i) => ` ${circ(x, i % 3 ? 14 : 20, 2.5)} M ${x} ${i % 3 ? 16.5 : 22.5} L ${x} ${i % 3 ? 26 : 31}`).join(''),
  pull: () =>
    circ(35, 35, 3) +
    [0.3, 1.2, 2.2, 3.1, 4.1, 5.2]
      .map((a, i) => {
        const len = 22 + (i % 3) * 5
        const [c, s] = [Math.cos(a), Math.sin(a)]
        const [ex, ey] = [35 + c * len, 35 + s * len]
        return ` M ${35 + c * 7} ${35 + s * 7} L ${ex} ${ey} M ${ex - c * 6 - s * 4} ${ey - s * 6 + c * 4} L ${ex} ${ey} L ${ex - c * 6 + s * 4} ${ey - s * 6 - c * 4}`
      })
      .join(''),
  hand: () =>
    'M 6 44 C 18 56 48 56 60 42 M 60 42 C 64 36 68 38 66 44 C 64 50 56 54 50 55 M 6 44 L 2 50' +
    ' M 35 22 C 35 16 27 16 27 22 C 27 27 35 31 35 34 C 35 31 43 27 43 22 C 43 16 35 16 35 22',
  door: () =>
    'M 18 62 L 18 8 L 52 8 L 52 62 M 18 8 L 34 14 L 34 58 L 18 62' +
    ` ${circ(30, 37, 1.5)} M 38 12 L 52 26 M 36 20 L 52 36 M 36 30 L 52 46 M 36 40 L 52 56 M 36 50 L 46 60`,
  tree: () =>
    'M 35 66 L 35 40 M 35 52 L 24 42 M 35 47 L 46 37 M 35 40 L 28 26 M 35 40 L 42 24 M 24 42 L 18 36 M 24 42 L 22 32' +
    ' M 46 37 L 54 31 M 46 37 L 48 27 M 28 26 L 24 18 M 42 24 L 46 16 M 28 26 L 31 17',
  spill: () =>
    'M 10 34 L 28 29 M 12 47 L 30 44 M 10 34 L 12 47 M 16 33 C 14 26 22 24 23 31' +
    ` M 29 31 C 38 33 40 46 50 46 C 56 46 58 50 66 50 ${circ(44, 36, 1.5)} ${circ(56, 40, 1.2)} ${circ(62, 33, 1.5)} ${circ(52, 29, 1)}`,
  lamp: () =>
    'M 28 64 L 28 36 L 42 36 L 42 64 M 24 64 L 46 64 M 35 36 L 35 32 M 35 32 C 30 26 32 18 35 11 C 38 18 40 26 35 32' +
    ' M 22 20 L 17 16 M 48 20 L 53 16 M 35 5 L 35 1 M 21 30 L 15 30 M 49 30 L 55 30',
  worm: () =>
    `M 2 54 C 16 42 28 42 40 52 C 50 60 60 54 68 48 M 18 50 C 18 30 38 22 48 34 M 26 48 C 26 36 38 32 42 40 ${circ(47, 38, 4)}` +
    ` M 22 38 L 30 42 M 28 30 L 34 36 M 36 26 L 39 33 ${circ(58, 14, 5)}`,
  magnifier: () => `${circ(28, 28, 15)} ${circ(28, 28, 11)} M 39 39 L 62 62 M 42 37 L 64 59`,
  road: () =>
    'M 2 20 L 68 20 M 10 68 C 30 50 20 36 33 21 M 44 68 C 48 50 34 36 37 21' +
    ' M 27 62 L 29 57 M 30 50 L 30 46 M 30 39 L 31 35 M 33 29 L 34 26 M 50 20 C 54 14 60 12 66 14',
}

function base(kind: DrawnKind, w: number, h: number, r: () => number): string {
  const picture = PICTURES[kind]
  if (picture) return picture()
  const j = (a: number) => (r() - 0.5) * a
  switch (kind) {
    case 'underline': {
      const y = h / 2
      const n = Math.max(3, Math.round(w / 60))
      let d = `M ${j(4)} ${y + j(3)}`
      for (let i = 1; i <= n; i++) {
        const x = (w * i) / n
        d += ` Q ${x - w / n / 2 + j(10)} ${y + j(6)} ${x + (i === n ? 8 : 0)} ${y + j(3)}`
      }
      return d
    }
    case 'ring': {
      // Overshoots its start and drifts up, the way a quick circle by hand does.
      const cx = w / 2
      const cy = h / 2
      let d = ''
      for (let i = 0; i <= 44; i++) {
        const a = -2.6 + (i / 40) * Math.PI * 2
        const wob = 1 + j(0.05)
        d += `${i ? ' L' : 'M'} ${cx + Math.cos(a) * (w / 2 - 2) * wob} ${cy + Math.sin(a) * (h / 2 - 2) * wob - i * 0.15}`
      }
      return d
    }
    case 'squiggle': {
      let d = `M ${w * 0.3} ${h / 2}`
      for (let x = w * 0.3; x < w * 0.7; x += 14) d += ` q 7 ${-14 + j(4)} 14 0`
      return d
    }
    // One quick stroke that climbs slightly and overshoots both ends.
    case 'strike':
      return `M ${-4 + j(2)} ${h * 0.62 + j(2)} Q ${w / 2 + j(8)} ${h * 0.5 + j(4)} ${w + 5 + j(2)} ${h * 0.42 + j(2)}`
    case 'spiral': {
      let d = ''
      for (let i = 0; i < 90; i++) {
        const a = i * 0.24
        const rad = 2 + i * 0.36
        d += `${i ? ' L' : 'M'} ${35 + Math.cos(a) * rad} ${35 + Math.sin(a) * rad}`
      }
      return d
    }
    case 'quote':
      return 'M 18 8 C 8 12 6 24 14 28 C 20 30 22 22 16 20 M 40 8 C 30 12 28 24 36 28 C 42 30 44 22 38 20'
    // Most of a circle, then an arrowhead where it closes.
    case 'cycle': {
      let d = ''
      for (let i = 0; i <= 30; i++) {
        const a = 0.5 + (i / 30) * 5.2
        d += `${i ? ' L' : 'M'} ${35 + Math.cos(a) * (24 + j(1.5))} ${35 + Math.sin(a) * (24 + j(1.5))}`
      }
      const end = 5.7
      const ex = 35 + Math.cos(end) * 24
      const ey = 35 + Math.sin(end) * 24
      return `${d} M ${ex - 9} ${ey - 3} L ${ex} ${ey} L ${ex - 1} ${ey + 10}`
    }
    case 'question':
      return 'M 22 22 C 22 6 50 6 50 22 C 50 34 36 34 36 46 M 36 58 L 37 60'
    case 'arrow':
      return 'M 6 14 C 24 6 48 20 66 34 M 54 34 L 67 35 L 62 22'
    case 'star': {
      const c = w / 2
      return `M ${c - 18} 44 L ${c} 6 L ${c + 18} 44 L ${c - 22} 20 L ${c + 22} 20 Z`
    }
    default:
      throw new Error(`no drawing for ${kind}`)
  }
}

export function drawnVariants(kind: DrawnKind, w: number, h: number, seed: number) {
  const d = base(kind, w, h, rng(seed))
  return [1, 2, 3].map((v) => jitterPath(d, 0.8, rng(seed * 31 + v * 7919)))
}

export function Drawn({ kind, accent, seed = 1, delay = 150, className = '' }: { kind: DrawnKind; accent?: boolean; seed?: number; delay?: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    const path = svg?.firstElementChild as SVGPathElement | null
    if (!svg || !path) return
    let variants: string[] = []
    const build = () => {
      const { width, height } = svg.getBoundingClientRect()
      variants = drawnVariants(kind, width, height, seed)
      path.setAttribute('d', variants[0])
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(svg)

    if (prefersReducedMotion()) {
      svg.classList.add('ms-drawn')
      return () => ro.disconnect()
    }

    let off = () => {}
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        off()
        if (!entry.isIntersecting) return
        timer = window.setTimeout(() => svg.classList.add('ms-drawn'), delay)
        off = onBoil((f) => path.setAttribute('d', variants[f % 3]))
      },
      { rootMargin: '0px 0px -25% 0px' },
    )
    io.observe(svg)
    return () => {
      ro.disconnect()
      io.disconnect()
      off()
      clearTimeout(timer)
    }
  }, [kind, seed, delay])

  return (
    <svg ref={ref} aria-hidden="true" className={`ms-draw ms-draw-${kind}${accent ? ' ms-accent' : ''}${className ? ` ${className}` : ''}`}>
      <path pathLength={1} />
    </svg>
  )
}
