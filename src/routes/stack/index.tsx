import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Meta } from '../../lib/meta'
import { prefersReducedMotion } from '../../lib/motion'
import StackEditorial from './editorial'
import StackGraph from './graph'

// two views of the same stack; click the page edge to slide between them
const VIEWS = ['editorial', 'graph'] as const
type View = (typeof VIEWS)[number]

// a firefly field at the page edge; drifts toward the exit direction, swarms brighter on hover
function EdgeZone({ side, label, onClick }: { side: 'left' | 'right'; label: string; onClick: () => void }) {
  const left = side === 'left'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hovering = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const N = 20
    let W = 0
    let H = 0
    type P = { x: number; y: number; vx: number; vy: number; ph: number; r: number }
    let ps: P[] = []
    const init = () => {
      ps = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (left ? -1 : 1) * (0.06 + Math.random() * 0.14),
        vy: (Math.random() - 0.5) * 0.14,
        ph: Math.random() * Math.PI * 2,
        r: 0.8 + Math.random() * 1.7,
      }))
    }
    const resize = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }
    resize()
    window.addEventListener('resize', resize)

    const drawStatic = () => {
      for (const p of ps) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(212,160,60,0.4)'
        ctx.fill()
      }
    }
    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const hot = hovering.current
      for (const p of ps) {
        p.ph += 0.03
        const spd = hot ? 2.6 : 1
        p.x += p.vx * spd
        p.y += p.vy * spd + Math.sin(p.ph) * 0.15
        if (p.x < -6) p.x = W + 6
        if (p.x > W + 6) p.x = -6
        if (p.y < -6) p.y = H + 6
        if (p.y > H + 6) p.y = -6
        const flick = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(p.ph))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (hot ? 1.6 : 1), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,160,60,${(hot ? 0.95 : 0.5) * flick})`
        ctx.shadowColor = 'rgba(212,160,60,0.9)'
        ctx.shadowBlur = hot ? 14 : 7
        ctx.fill()
      }
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(draw)
    }
    if (reduced) drawStatic()
    else draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [left])

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      aria-label={`Switch to ${label} view`}
      className={`group fixed inset-y-0 z-40 hidden w-24 md:block ${left ? 'left-0' : 'right-0'}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${
          left ? 'bg-gradient-to-r' : 'bg-gradient-to-l'
        } from-gold/[0.10] to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <canvas ref={canvasRef} className="pointer-events-none relative h-full w-full" />
    </button>
  )
}

export default function StackPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduced = prefersReducedMotion()

  const view: View = pathname.endsWith('/graph') ? 'graph' : 'editorial'
  const idx = VIEWS.indexOf(view)

  // track travel direction so the slide matches the edge you clicked
  const last = useRef(idx)
  const dir = idx === last.current ? 0 : idx > last.current ? 1 : -1
  last.current = idx

  // stack sub-views have their own framer-motion slide, so no view transition here (would double up)
  const goTo = (i: number) => navigate(`/stack/${VIEWS[i]}`)

  return (
    <>
      <Meta
        title={view === 'graph' ? 'Stack · Graph' : 'Stack'}
        description="What i build with: the tools, and the map of how they connect."
      />
      {idx > 0 && <EdgeZone side="left" label={VIEWS[idx - 1]} onClick={() => goTo(idx - 1)} />}
      {idx < VIEWS.length - 1 && <EdgeZone side="right" label={VIEWS[idx + 1]} onClick={() => goTo(idx + 1)} />}

      {/* mobile: the edge zones are desktop-only, so surface a segmented switch */}
      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 md:hidden">
        <div className="flex gap-1 rounded-full border border-gold/25 bg-charcoal/85 p-1 font-mono text-[11px] shadow-xl backdrop-blur">
          {VIEWS.map((v, i) => (
            <button
              key={v}
              onClick={() => goTo(i)}
              className={`rounded-full px-4 py-1.5 uppercase tracking-[0.2em] transition-colors ${
                view === v ? 'bg-gold/15 text-gold' : 'text-bone/55'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={view}
          custom={dir}
          initial={reduced ? false : 'enter'}
          animate="center"
          exit={reduced ? undefined : 'exit'}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d === 0 ? 0 : d > 0 ? 56 : -56 }),
            center: { opacity: 1, x: 0 },
            exit: (d: number) => ({ opacity: 0, x: d > 0 ? -56 : 56 }),
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {view === 'graph' ? <StackGraph /> : <StackEditorial />}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
