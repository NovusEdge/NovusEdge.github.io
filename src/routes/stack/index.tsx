import { useEffect, useRef, useState } from 'react'
import { animate, stagger, utils } from 'animejs'
import { Meta } from '../../lib/meta'
import { Rule, SectionNumber, JPLabel, RegMarks } from '../../components/motifs'
import { revealCards } from '../../lib/reveals'
import { prefersReducedMotion } from '../../lib/motion'
import DecryptedText from '../../components/react-bits/DecryptedText'
import { DOMAINS, STACK, LANGS, LANG_TOTAL, siClaude, type Tech } from './data'

// ambient constellation behind the page
function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const N = 46
    const pts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
    }))
    let w = 0
    let h = 0
    const resize = () => {
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)
    let raf = 0
    const max = 150 * dpr
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i]
          const b = pts[j]
          const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h)
          if (d < max) {
            ctx.strokeStyle = `rgba(212,160,60,${0.14 * (1 - d / max)})`
            ctx.lineWidth = dpr
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.stroke()
          }
        }
      }
      ctx.fillStyle = 'rgba(212,160,60,0.4)'
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, 1.5 * dpr, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-70" />
}

// language distribution bar that fills in on scroll
function TelemetryBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    utils.set(el.querySelectorAll('[data-seg]'), { scaleX: 0 })
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-seg]'), {
      scaleX: [0, 1],
      delay: stagger(60),
      duration: 700,
      ease: 'out(3)',
    })
  }, [seen])
  return (
    <div ref={ref} data-card className="mt-12">
      <div className="mb-3 flex items-center gap-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">telemetry</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-bone/40">
          repos by language
        </span>
      </div>
      <div className="flex h-3 w-full gap-px overflow-hidden rounded-full">
        {LANGS.map((l) => (
          <div
            key={l.name}
            data-seg
            className="h-full origin-left"
            style={{ width: `${(l.n / LANG_TOTAL) * 100}%`, background: l.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {LANGS.map((l) => (
          <span
            key={l.name}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-charcoal/60 dark:text-bone/60"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.name} <span className="text-charcoal/35 dark:text-bone/35">{l.n}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// logo tile that tilts toward the cursor in 3D
function TechTile({ t }: { t: Tech }) {
  const inner = useRef<HTMLDivElement>(null)
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!inner.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    inner.current.style.transform = `rotateY(${px * 18}deg) rotateX(${-py * 18}deg)`
  }
  const reset = () => {
    if (inner.current) inner.current.style.transform = ''
  }
  return (
    <div data-tile className="[perspective:600px]" onPointerMove={tilt} onPointerLeave={reset}>
      <div
        ref={inner}
        className="group flex flex-col items-center gap-3 rounded-lg border border-charcoal/10 bg-bone-tint/10 p-5 transition-[transform,border-color,box-shadow] duration-150 ease-out will-change-transform hover:border-gold/50 hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)] dark:border-bone/10 dark:bg-charcoal-tint/10"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`h-10 w-10 transition-transform duration-300 group-hover:scale-110 ${
            t.mono ? 'fill-charcoal/80 dark:fill-bone/80' : ''
          }`}
          style={t.mono ? undefined : { fill: `#${t.icon.hex}` }}
        >
          <path d={t.icon.path} />
        </svg>
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-charcoal/70 transition-colors group-hover:text-gold dark:text-bone/70">
          {t.name}
        </span>
      </div>
    </div>
  )
}

// tiles pop in with a staggered outBack when the group scrolls into view
function TechGrid({ items }: { items: Tech[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    utils.set(el.querySelectorAll('[data-tile]'), { opacity: 0 })
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-tile]'), {
      opacity: [0, 1],
      scale: [0.85, 1],
      translateY: [18, 0],
      delay: stagger(35),
      duration: 550,
      ease: 'outBack',
    })
  }, [seen])

  return (
    <div ref={ref} className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {items.map((t) => (
        <TechTile key={t.name} t={t} />
      ))}
    </div>
  )
}

export default function StackPage() {
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [])

  return (
    <>
      <Meta title="Stack" description="Intelligence architect building cognitive infrastructure for agents: specializations and the stack behind them." />
      <Constellation />
      <section ref={scope} className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-36">
        {/* identity hero */}
        <div data-card className="relative">
          <SectionNumber n="04" label="stack" />
          <div className="relative mt-3 w-fit">
            <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
              <JPLabel>技</JPLabel>
              <span aria-hidden className="h-4 w-px bg-gold/50" />
            </div>
            <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone md:text-6xl">
              <DecryptedText text="Stack" speed={50} delay={100} />
            </h1>
          </div>
          <p
            data-card
            className="mt-6 max-w-2xl font-display text-2xl font-bold leading-snug text-charcoal dark:text-bone md:text-3xl"
          >
            Intelligence architect, building cognitive infrastructure for agents.
          </p>
          <p data-card className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            structuring the unstructured
          </p>
        </div>

        <div data-card>
          <Rule className="mt-8" />
        </div>

        <TelemetryBar />

        {/* specializations */}
        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {DOMAINS.map((d) => (
            <div
              key={d.title}
              data-card
              className="group relative overflow-hidden rounded border border-charcoal/10 bg-bone-tint/10 p-7 transition-colors hover:border-gold/40 dark:border-bone/10 dark:bg-charcoal-tint/10"
            >
              <RegMarks />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-3 font-display text-7xl text-charcoal/[0.05] transition-colors group-hover:text-gold/10 dark:text-bone/[0.05]"
              >
                {d.jp}
              </span>
              <h2 className="font-display text-xl font-black text-charcoal dark:text-bone">{d.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">{d.blurb}</p>
            </div>
          ))}
        </div>

        {/* the stack */}
        {STACK.map((g) => (
          <div key={g.label}>
            <div data-card className="mb-8 mt-20 flex items-center gap-4">
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">{g.label}</span>
              <span className="font-display text-sm text-charcoal/30 dark:text-bone/30">{g.jp}</span>
              <div className="h-px flex-1 bg-charcoal/10 dark:bg-bone/10" />
            </div>
            {g.label === 'ai' && (
              <div
                data-card
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.06] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 fill-gold">
                  <path d={siClaude.path} />
                </svg>
                member · Claude Partner Network
              </div>
            )}
            <TechGrid items={g.items} />
          </div>
        ))}
      </section>
    </>
  )
}
