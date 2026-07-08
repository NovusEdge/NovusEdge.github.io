import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { prefersReducedMotion } from '../lib/motion'

// Decorative flourish for the top of the blog heading. anime.js variants to pick from.
export const TOP_VARIANTS = ['Readout', 'Barcode', 'Kana', 'Sweep'] as const
export type BlogStats = { posts: number; tags: number; since: string }

/* 1 — a metadata readout whose counters tick up */
function Readout({ stats }: { stats: BlogStats }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    root.querySelectorAll<HTMLElement>('[data-num]').forEach((el) => {
      const target = Number(el.dataset.num)
      const proxy = { n: 0 }
      animate(proxy, {
        n: target,
        duration: 1200,
        delay: 200,
        ease: 'out(3)',
        onUpdate: () => {
          el.textContent = String(Math.round(proxy.n)).padStart(2, '0')
        },
      })
    })
    animate(root.querySelectorAll('[data-seg]'), {
      opacity: [0, 1],
      translateY: [6, 0],
      delay: stagger(120),
      duration: 500,
      ease: 'out(2)',
    })
  }, [])
  return (
    <div
      ref={ref}
      className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-charcoal/55 dark:text-bone/55"
    >
      <span data-seg>
        posts <span data-num={stats.posts} className="text-gold">00</span>
      </span>
      <span data-seg>
        tags <span data-num={stats.tags} className="text-gold">00</span>
      </span>
      <span data-seg>
        since <span className="text-gold">{stats.since}</span>
      </span>
    </div>
  )
}

/* 2 — a barcode strip that draws in */
function Barcode() {
  const ref = useRef<HTMLDivElement>(null)
  const N = 42
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-b]'), {
      scaleY: [0, 1],
      opacity: [0, 1],
      delay: stagger(18),
      duration: 500,
      ease: 'out(3)',
    })
  }, [])
  return (
    <div ref={ref} className="mb-6 flex h-8 items-end gap-[3px]">
      {Array.from({ length: N }).map((_, i) => (
        <span
          key={i}
          data-b
          className="w-[3px] origin-bottom bg-charcoal/65 dark:bg-bone/65"
          style={{ height: `${30 + ((i * 37) % 70)}%` }}
        />
      ))}
    </div>
  )
}

/* 3 — ブログ drops in with an elastic settle */
function KanaTop() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-k]'), {
      opacity: [0, 0.6],
      translateY: [-14, 0],
      rotate: ['-20deg', '0deg'],
      delay: stagger(90),
      duration: 700,
      ease: 'outElastic(1, .7)',
    })
  }, [])
  return (
    <div ref={ref} className="mb-5 flex gap-2 font-display text-lg text-charcoal/45 dark:text-bone/45">
      {['ブ', 'ロ', 'グ'].map((c, i) => (
        <span key={i} data-k>
          {c}
        </span>
      ))}
    </div>
  )
}

/* 4 — a rule that draws across with a travelling gold node */
function Sweep() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    animate(root.querySelectorAll('[data-line]'), { scaleX: [0, 1], duration: 900, ease: 'inOut(3)' })
    animate(root.querySelectorAll('[data-node]'), { left: ['0%', '100%'], duration: 900, ease: 'inOut(3)' })
  }, [])
  return (
    <div ref={ref} className="relative mb-6 h-4 w-44">
      <span data-line className="absolute left-0 top-1/2 h-px w-full origin-left bg-charcoal/25 dark:bg-bone/25" />
      <span
        data-node
        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
        style={{ left: '0%' }}
      />
    </div>
  )
}

export function TopFlourish({ variant, stats }: { variant: number; stats: BlogStats }) {
  if (variant === 1) return <Barcode key={1} />
  if (variant === 2) return <KanaTop key={2} />
  if (variant === 3) return <Sweep key={3} />
  return <Readout key={0} stats={stats} />
}
