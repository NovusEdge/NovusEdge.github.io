import { useEffect, useRef } from 'react'
import { onBoil } from '../../lib/boil'
import { rng } from '../../lib/meaning-tangle'
import { prefersReducedMotion } from '../../lib/motion'
import type { DoodleKind } from '../../lib/meaning-data'

export type DrawnKind = 'underline' | 'ring' | 'squiggle' | 'strike' | 'quote' | DoodleKind

export function jitterPath(d: string, amp: number, r: () => number) {
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (parseFloat(n) + (r() - 0.5) * 2 * amp).toFixed(1))
}

function base(kind: DrawnKind, w: number, h: number, r: () => number): string {
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
