import { useEffect, useRef, useState } from 'react'
import { animate, stagger, utils } from 'animejs'
import { Dithering } from '@paper-design/shaders-react'
import { Meta } from '../../lib/meta'
import { Rule, SectionNumber, JPLabel, RegMarks } from '../../components/motifs'
import { revealCards } from '../../lib/reveals'
import { prefersReducedMotion } from '../../lib/motion'
import DecryptedText from '../../components/react-bits/DecryptedText'
import Magnetic from '../../components/react-bits/Magnetic'
import SpotlightCard from '../../components/react-bits/SpotlightCard'
import { DOMAINS, STACK, LANGS, LANG_TOTAL, siClaude, type Tech } from '../stack/data'

// ── lab config ──────────────────────────────────────────────────────────────
// throwaway preview harness: flip variants live, pick winners, port to /stack, delete this.
type Bg = 'none' | 'constellation' | 'graph' | 'dither'
type Cfg = { bg: Bg; tilt: boolean; magnetic: boolean; spotlight: boolean }
const DEFAULT: Cfg = { bg: 'graph', tilt: true, magnetic: false, spotlight: false }
const KEY = 'lab-cfg'

function useCfg(): [Cfg, (c: Partial<Cfg>) => void] {
  const [cfg, set] = useState<Cfg>(() => {
    try {
      return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
    } catch {
      return DEFAULT
    }
  })
  const patch = (c: Partial<Cfg>) =>
    set((prev) => {
      const next = { ...prev, ...c }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  return [cfg, patch]
}

// ── backgrounds ───────────────────────────────────────────────────────────────

// current stack bg: static drifting nodes + proximity links
function ConstellationBg() {
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

// interactive: nodes drift, gravitate toward the cursor, links + cursor-tethers glow near it
function GraphBg() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const N = 54
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

    // mouse in normalized coords; -1 = off-screen
    const mouse = { x: -1, y: -1 }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }
    const onLeave = () => {
      mouse.x = -1
      mouse.y = -1
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    let raf = 0
    const max = 150 * dpr
    const pull = 0.16 // normalized-space radius the cursor influences
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const near = mouse.x >= 0
      for (const p of pts) {
        if (near) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const d = Math.hypot(dx, dy)
          if (d < pull && d > 0.001) {
            const f = (1 - d / pull) * 0.00035
            p.vx += (dx / d) * f
            p.vy += (dy / d) * f
          }
        }
        p.vx *= 0.985 // damp so the gravity well doesn't fling nodes forever
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
      }
      // node-to-node links, brighter when near the cursor
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i]
          const b = pts[j]
          const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h)
          if (d < max) {
            let alpha = 0.14 * (1 - d / max)
            if (near) {
              const mid = Math.hypot(mouse.x - (a.x + b.x) / 2, mouse.y - (a.y + b.y) / 2)
              if (mid < pull) alpha += 0.4 * (1 - mid / pull)
            }
            ctx.strokeStyle = `rgba(212,160,60,${alpha})`
            ctx.lineWidth = dpr
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.stroke()
          }
        }
      }
      // tethers from the cursor to nearby nodes
      if (near) {
        for (const p of pts) {
          const d = Math.hypot(mouse.x - p.x, mouse.y - p.y)
          if (d < pull) {
            ctx.strokeStyle = `rgba(212,160,60,${0.5 * (1 - d / pull)})`
            ctx.lineWidth = dpr
            ctx.beginPath()
            ctx.moveTo(mouse.x * w, mouse.y * h)
            ctx.lineTo(p.x * w, p.y * h)
            ctx.stroke()
          }
        }
      }
      for (const p of pts) {
        const lit = near && Math.hypot(mouse.x - p.x, mouse.y - p.y) < pull
        ctx.fillStyle = lit ? 'rgba(212,160,60,0.85)' : 'rgba(212,160,60,0.4)'
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, (lit ? 2.2 : 1.5) * dpr, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-70" />
}

// landing's dither shader as a bg; cursor motion nudges its speed, decaying back to idle
function DitherBg() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    type Mount = { setSpeed?: (n?: number) => void }
    const mount = () => (ref.current as { paperShaderMount?: Mount } | null)?.paperShaderMount
    let speed = 0.06
    let raf = 0
    const onMove = () => {
      speed = Math.min(speed + 0.08, 0.5)
    }
    window.addEventListener('mousemove', onMove)
    const tick = () => {
      speed = Math.max(0.06, speed * 0.96)
      mount()?.setSpeed?.(speed)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])
  return (
    <Dithering
      ref={ref as never}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
      width="100%"
      height="100%"
      minPixelRatio={1}
      maxPixelCount={620_000}
      colorBack="#00000000"
      colorFront="#d4a03c"
      shape="swirl"
      type="4x4"
      size={2}
      speed={0.06}
    />
  )
}

function Background({ bg }: { bg: Bg }) {
  if (bg === 'constellation') return <ConstellationBg />
  if (bg === 'graph') return <GraphBg />
  if (bg === 'dither') return <DitherBg />
  return null
}

// ── tiles / grid ──────────────────────────────────────────────────────────────

function TechTile({ t, tilt, magnetic }: { t: Tech; tilt: boolean; magnetic: boolean }) {
  const inner = useRef<HTMLDivElement>(null)
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tilt || !inner.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    inner.current.style.transform = `rotateY(${px * 18}deg) rotateX(${-py * 18}deg)`
  }
  const reset = () => {
    if (inner.current) inner.current.style.transform = ''
  }
  const tile = (
    <div className="[perspective:600px]" onPointerMove={onMove} onPointerLeave={reset}>
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
  return <div data-tile>{magnetic ? <Magnetic range={90}>{tile}</Magnetic> : tile}</div>
}

function TechGrid({ items, tilt, magnetic }: { items: Tech[]; tilt: boolean; magnetic: boolean }) {
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
        <TechTile key={t.name} t={t} tilt={tilt} magnetic={magnetic} />
      ))}
    </div>
  )
}

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

// ── picker panel ──────────────────────────────────────────────────────────────

function Picker({ cfg, patch }: { cfg: Cfg; patch: (c: Partial<Cfg>) => void }) {
  const [open, setOpen] = useState(true)
  const bgs: Bg[] = ['none', 'constellation', 'graph', 'dither']
  const toggles: { k: keyof Cfg; label: string }[] = [
    { k: 'tilt', label: '3D tile tilt' },
    { k: 'magnetic', label: 'magnetic tiles' },
    { k: 'spotlight', label: 'spotlight cards' },
  ]
  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {open ? (
        <div className="w-56 rounded-lg border border-gold/30 bg-charcoal/90 p-4 text-bone shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.25em] text-gold">lab</span>
            <button onClick={() => setOpen(false)} className="text-bone/50 hover:text-bone" aria-label="collapse">
              ×
            </button>
          </div>
          <div className="mb-1 uppercase tracking-widest text-bone/40">background</div>
          <div className="mb-4 flex flex-col gap-1">
            {bgs.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 hover:text-gold">
                <input type="radio" name="bg" checked={cfg.bg === b} onChange={() => patch({ bg: b })} />
                {b}
              </label>
            ))}
          </div>
          <div className="mb-1 uppercase tracking-widest text-bone/40">interactions</div>
          <div className="flex flex-col gap-1">
            {toggles.map(({ k, label }) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 hover:text-gold">
                <input
                  type="checkbox"
                  checked={cfg[k] as boolean}
                  onChange={(e) => patch({ [k]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-gold/30 bg-charcoal/90 px-3 py-2 uppercase tracking-[0.25em] text-gold shadow-2xl backdrop-blur"
        >
          lab
        </button>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function LabPage() {
  const scope = useRef<HTMLElement>(null)
  const [cfg, patch] = useCfg()
  useEffect(() => revealCards(scope.current), [])

  return (
    <>
      <Meta title="Lab" description="Variant preview harness for the stack page." />
      {/* remount bg on change so canvas/shader tear down cleanly */}
      <Background key={cfg.bg} bg={cfg.bg} />
      <Picker cfg={cfg} patch={patch} />
      <section ref={scope} className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-36">
        <div data-card className="relative">
          <SectionNumber n="04" label="lab" />
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

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {DOMAINS.map((d) => {
            const body = (
              <>
                <RegMarks />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-3 font-display text-7xl text-charcoal/[0.05] transition-colors group-hover:text-gold/10 dark:text-bone/[0.05]"
                >
                  {d.jp}
                </span>
                <h2 className="font-display text-xl font-black text-charcoal dark:text-bone">{d.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">{d.blurb}</p>
              </>
            )
            return cfg.spotlight ? (
              <SpotlightCard key={d.title} className="group !p-7" spotlightColor="rgba(212,160,60,0.12)">
                <div className="relative" data-card>
                  {body}
                </div>
              </SpotlightCard>
            ) : (
              <div
                key={d.title}
                data-card
                className="group relative overflow-hidden rounded border border-charcoal/10 bg-bone-tint/10 p-7 transition-colors hover:border-gold/40 dark:border-bone/10 dark:bg-charcoal-tint/10"
              >
                {body}
              </div>
            )
          })}
        </div>

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
            <TechGrid items={g.items} tilt={cfg.tilt} magnetic={cfg.magnetic} />
          </div>
        ))}
      </section>
    </>
  )
}
