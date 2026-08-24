import { useEffect, useRef, useState, type ComponentType } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { Building2, Briefcase, Footprints, HouseWifi, Store, UserSearch } from './icons'

// Interactive: an unprotected read lets a monitoring authority build a
// confident profile; ØCLOAK floods the same stream with decoy reads until the
// aggregate can no longer be trusted. Controlled toggle: the page owns `mode`
// so the same switch also drives the watching eyes. Restrained, no glow/neon.
const AMBER = '#FF6F37'
const GOLD = '#d4a03c'
const DECOY = 'rgba(245,242,235,0.34)'
const GRID = 'rgba(245,242,235,0.10)'

export type Mode = 'passive' | 'scrambled'

function createAudio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)
  const noiseBuffer = (() => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return b
  })()
  const env = (node: AudioNode, peak: number, decay: number, at = 0) => {
    const g = ctx.createGain()
    const t = ctx.currentTime + at
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(peak, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    node.connect(g)
    g.connect(master)
    return g
  }
  return {
    resume: () => ctx.state === 'suspended' && ctx.resume(),
    click() {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1700
      bp.Q.value = 0.9
      src.connect(bp)
      env(bp, 0.35, 0.05)
      src.start()
      src.stop(ctx.currentTime + 0.06)
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = 220
      env(o, 0.18, 0.05)
      o.start()
      o.stop(ctx.currentTime + 0.06)
    },
    tick() {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = 3200
      env(o, 0.05, 0.02)
      o.start()
      o.stop(ctx.currentTime + 0.03)
    },
    thunk() {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.setValueAtTime(150, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25)
      env(o, 0.4, 0.32)
      o.start()
      o.stop(ctx.currentTime + 0.34)
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 500
      src.connect(lp)
      env(lp, 0.22, 0.28)
      src.start()
      src.stop(ctx.currentTime + 0.3)
    },
    restore() {
      ;[520, 780].forEach((f, i) => {
        const o = ctx.createOscillator()
        o.type = 'triangle'
        o.frequency.value = f
        env(o, 0.14, 0.09, i * 0.07)
        o.start(ctx.currentTime + i * 0.07)
        o.stop(ctx.currentTime + i * 0.07 + 0.11)
      })
    },
  }
}
type Audio = ReturnType<typeof createAudio>

type Scenario = {
  id: string
  label: string
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>
  passive: string
  scrambled: string
}
const SCENARIOS: Scenario[] = [
  {
    id: 'building',
    label: 'Apartment block',
    Icon: Building2,
    passive: 'The building can see which units are lived in and when people are home.',
    scrambled: 'The building cannot tell if a unit holds nobody or a dozen people, so its occupancy records are guesswork.',
  },
  {
    id: 'store',
    label: 'Storefront',
    Icon: Store,
    passive: 'The store measures who walks in, how long they linger, and who returns.',
    scrambled: 'The store counts crowds of shoppers who were never there, so the foot-traffic numbers mean nothing.',
  },
  {
    id: 'work',
    label: 'Workplace',
    Icon: Briefcase,
    passive: 'The office can tell who was at their desk and for how long.',
    scrambled: 'The office reads people as present who never came in, so it cannot use the data to track anyone.',
  },
  {
    id: 'tail',
    label: 'The tail',
    Icon: Footprints,
    passive: 'Someone can quietly check whether you are home before they act.',
    scrambled: 'You show up as home and away at the same time, so there is nothing reliable to act on.',
  },
]

export default function TrustCollapse({
  mode,
  onMode,
  scenario,
  onScenario,
  muted,
  onMuted,
}: {
  mode: Mode
  onMode: (m: Mode) => void
  scenario: string
  onScenario: (s: string) => void
  muted: boolean
  onMuted: (m: boolean) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const audio = useRef<Audio>(null)
  const modeRef = useRef<Mode>(mode)
  const mutedRef = useRef(muted)
  const confRef = useRef(94)
  const targetRef = useRef(94)
  const confLabel = useRef<HTMLParagraphElement>(null)
  // collection economics over time: once scrambled, the data loses value until
  // gathering it costs more than it returns and the authority abandons it.
  const valueRef = useRef(100)
  const dryRef = useRef(false)
  const [dry, setDry] = useState(false)
  const authRef = useRef<HTMLDivElement>(null)

  modeRef.current = mode
  mutedRef.current = muted
  targetRef.current = mode === 'scrambled' ? 28 : 94

  const play = (fn: (a: NonNullable<Audio>) => void) => {
    if (mutedRef.current) return
    if (!audio.current) audio.current = createAudio()
    if (!audio.current) return
    audio.current.resume()
    fn(audio.current)
  }

  const toggle = (next: Mode) => {
    if (next === mode) return
    onMode(next)
    if (next === 'scrambled') play((a) => a.thunk())
    else play((a) => a.restore())
    play((a) => a.click())
  }

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduce = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let emit = 0
    let lastTick = 0
    type Pt = { x: number; y: number; sp: number; decoy: boolean }
    let ps: Pt[] = []
    const COLS = 12
    const ROWS = 6
    const coherent = Array.from({ length: COLS * ROWS }, (_, k) => {
      const cx = k % COLS
      const cy = Math.floor(k / COLS)
      const d = Math.hypot((cx - 7.5) / COLS, (cy - 3.5) / ROWS)
      return Math.max(0, 1 - d * 2.6)
    })
    let noise = coherent.map(() => Math.random())
    const flowLeft = () => w * 0.05
    const flowRight = () => w * 0.6

    const spawn = () => {
      const scrambled = modeRef.current === 'scrambled'
      const y = h * 0.5 + (Math.random() - 0.5) * h * 0.52
      ps.push({ x: flowLeft(), y, sp: 0.8 + Math.random() * 0.8, decoy: scrambled && Math.random() < 0.62 })
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const scrambled = modeRef.current === 'scrambled'

      confRef.current += (targetRef.current - confRef.current) * 0.08
      if (confLabel.current) confLabel.current.textContent = `${Math.round(confRef.current)}%`

      // collection viability: decays while scrambled, recovers when protected
      if (!reduce) valueRef.current = scrambled ? Math.max(0, valueRef.current - 0.28) : Math.min(100, valueRef.current + 2)
      const val = valueRef.current
      const nowDry = scrambled && val <= 4
      if (nowDry !== dryRef.current) {
        dryRef.current = nowDry
        setDry(nowDry)
        if (nowDry) play((a) => a.thunk())
      }
      if (authRef.current) authRef.current.style.opacity = String(scrambled ? Math.max(0.16, val / 100) : 1)
      const emAlpha = scrambled ? Math.max(0, val / 100) : 1
      const heatFade = scrambled ? 0.08 + 0.92 * (val / 100) : 1

      // emitter arcs (left)
      const ex = flowLeft()
      const ey = h * 0.5
      ctx.strokeStyle = scrambled ? DECOY : AMBER
      ctx.lineWidth = 1.2
      for (let r = 8; r <= 22; r += 7) {
        ctx.globalAlpha = (0.5 - r * 0.012) * emAlpha
        ctx.beginPath()
        ctx.arc(ex, ey, r, -Math.PI * 0.35, Math.PI * 0.35)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = GRID
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(flowLeft(), h * 0.5)
      ctx.lineTo(flowRight(), h * 0.5)
      ctx.stroke()

      if (!reduce) {
        emit += 1
        if (!dryRef.current && emit % (scrambled ? 3 : 5) === 0) spawn()
      } else if (ps.length === 0) {
        for (let i = 0; i < 14; i++)
          ps.push({
            x: flowLeft() + (i / 14) * (flowRight() - flowLeft()),
            y: h * 0.5 + ((i % 5) - 2) * 10,
            sp: 0,
            decoy: scrambled && i % 3 !== 0,
          })
      }
      const right = flowRight()
      ps = ps.filter((pp) => {
        pp.x += pp.sp * dpr * (reduce ? 0 : 1)
        if (pp.x >= right && !reduce) {
          if (t - lastTick > 70) {
            lastTick = t
            play((a) => a.tick())
          }
          return false
        }
        if (pp.decoy) {
          // fabricated read: crossed out as it travels
          ctx.strokeStyle = DECOY
          ctx.lineWidth = 1.3
          const s = 3
          ctx.beginPath()
          ctx.moveTo(pp.x - s, pp.y - s)
          ctx.lineTo(pp.x + s, pp.y + s)
          ctx.moveTo(pp.x - s, pp.y + s)
          ctx.lineTo(pp.x + s, pp.y - s)
          ctx.stroke()
        } else {
          ctx.fillStyle = AMBER
          ctx.beginPath()
          ctx.arc(pp.x, pp.y, 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
        return true
      })

      // heatmap (right): the authority's model of you
      const bx = w * 0.66
      const by = h * 0.14
      const bw = w * 0.3
      const bh = h * 0.56
      const cw = bw / COLS
      const ch = bh / ROWS
      if (scrambled && !reduce && t - lastTick > 90) noise = noise.map(() => Math.random())
      for (let i = 0; i < COLS * ROWS; i++) {
        const cx = i % COLS
        const cy = Math.floor(i / COLS)
        const v = scrambled ? noise[i] : coherent[i]
        ctx.globalAlpha = (0.12 + v * (scrambled ? 0.5 : 0.85)) * heatFade
        ctx.fillStyle = scrambled ? DECOY : AMBER
        ctx.fillRect(bx + cx * cw + 0.5, by + cy * ch + 0.5, cw - 1.5, ch - 1.5)
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = GRID
      ctx.strokeRect(bx, by, bw, bh)

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      const r = cv.getBoundingClientRect()
      w = r.width
      h = r.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduce) draw(0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrambled = mode === 'scrambled'
  const sc = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0]

  return (
    <div className="not-prose overflow-hidden rounded-lg border border-bone/12 bg-charcoal-tint/40">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone/10 px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">Aggregate trust</p>
          <p className="mt-1 text-base text-bone/75">What a monitoring authority can still conclude about you</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onMuted(!muted)}
            className="rounded border border-bone/15 px-2.5 py-2 text-bone/50 transition-colors hover:border-bone/35 hover:text-bone/80"
            aria-label={muted ? 'Unmute feedback' : 'Mute feedback'}
            title={muted ? 'Sound off' : 'Sound on'}
          >
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </button>
          <div className="inline-flex rounded border border-bone/15 p-1 font-mono text-[11px] uppercase tracking-[0.14em]">
            <button
              type="button"
              onClick={() => toggle('passive')}
              className={`rounded px-3 py-1.5 transition-colors ${!scrambled ? 'bg-bone/90 text-charcoal' : 'text-bone/55 hover:text-bone/80'}`}
            >
              Unprotected
            </button>
            <button
              type="button"
              onClick={() => toggle('scrambled')}
              className={`rounded px-3 py-1.5 transition-colors ${scrambled ? 'bg-gold text-charcoal' : 'text-bone/55 hover:text-bone/80'}`}
            >
              Scrambled
            </button>
          </div>
        </div>
      </div>

      {/* diagram */}
      <div className="px-5 pt-4">
        <div className="mb-1 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <HouseWifi className="h-7 w-7 text-bone/70" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/70">Your space</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">sensors + ØCLOAK</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.18em] ${dry ? 'text-bone/40' : 'text-bone/70'}`}>
                {dry ? 'Stopped collecting' : 'Monitoring authority'}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
                {dry ? 'not worth the cost' : 'builds a profile of you'}
              </p>
            </div>
            <div ref={authRef} className="relative transition-opacity duration-500">
              <UserSearch className="h-7 w-7 text-bone/70" strokeWidth={1.6} />
              <span
                aria-hidden
                className={`absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-bone/70 transition-opacity duration-300 ${dry ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>
        </div>
        <canvas ref={canvas} className="h-[210px] w-full pb-2" />
      </div>

      {/* focused statement + confidence */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 px-5 py-5">
        <p className="max-w-xl text-lg font-medium leading-snug text-bone">
          {dry
            ? 'Gathering the data now costs more than it returns, so the authority gives up and stops collecting.'
            : scrambled
              ? 'The authority receives detections it cannot separate from fabrications.'
              : 'The authority receives detections it can trust and correlate.'}
        </p>
        <div className="text-right">
          <p
            ref={confLabel}
            className="font-display text-5xl font-black tabular-nums leading-none transition-colors"
            style={{ color: scrambled ? 'rgba(245,242,235,0.55)' : GOLD }}
          >
            94%
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">aggregate confidence</p>
        </div>
      </div>

      {/* scenarios */}
      <div className="border-t border-bone/10">
        <div className="flex flex-wrap gap-1 px-3 pt-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onScenario(s.id)
                play((a) => a.click())
              }}
              className={`flex items-center gap-2 rounded-t px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                scenario === s.id ? 'bg-charcoal text-bone' : 'text-bone/45 hover:text-bone/75'
              }`}
            >
              <s.Icon className="h-4 w-4" strokeWidth={1.6} />
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6 bg-charcoal px-6 py-7 md:gap-10">
          <sc.Icon className="h-20 w-20 shrink-0 text-bone/60 md:h-24 md:w-24" strokeWidth={1.25} />
          <div className="min-w-0 flex-1 space-y-3">
            <Outcome active={!scrambled} label="Unprotected" text={sc.passive} tone="gold" />
            <Outcome active={scrambled} label="Scrambled" text={sc.scrambled} tone="bone" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Outcome({ active, label, text, tone }: { active: boolean; label: string; text: string; tone: 'gold' | 'bone' }) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rotate-45 transition-colors"
        style={{
          background: active ? (tone === 'gold' ? GOLD : '#f5f2eb') : 'transparent',
          border: active ? 'none' : '1px solid rgba(245,242,235,0.35)',
        }}
      />
      <p className="text-[17px] leading-snug text-bone/85">
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${active ? 'text-bone/75' : 'text-bone/40'}`}
        >
          {label} —{' '}
        </span>
        {text}
      </p>
    </div>
  )
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  )
}
function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M17 9.5l4 5M21 9.5l-4 5" strokeLinecap="round" />
    </svg>
  )
}
