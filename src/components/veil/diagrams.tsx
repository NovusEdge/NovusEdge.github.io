import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../lib/motion'

/* Diagrams for the Veil project page. Every constant here is read from the
   Veil source, not invented: packages/engrammic/src/fsrs.ts for the curve and
   the per-type stability, eviction.ts for the AIMD steps, manager.ts for the
   three eviction stages. Changing a number here means the page now lies. */

const GOLD = '#d4a03c'

// R(t) = (1 + (19/81) * t/S) ^ -0.5, calibrated so R = 0.9 at t = S
const FACTOR = 19 / 81
const retrievability = (days: number, stability: number) => (1 + FACTOR * (days / stability)) ** -0.5

type Kind = { key: string; label: string; stability: number; cap: number; note: string }

// initialStability and stabilityCap, in days, from the hot-context FSRS config
const KINDS: Kind[] = [
  { key: 'episodic', label: 'episodic', stability: 0.02, cap: 1, note: 'what happened this turn' },
  { key: 'fact', label: 'fact', stability: 0.083, cap: 3, note: 'a thing the codebase is' },
  { key: 'procedural', label: 'procedural', stability: 0.25, cap: 7, note: 'how a job gets done here' },
  { key: 'decision', label: 'decision', stability: 0.5, cap: 7, note: 'a call that was made' },
  { key: 'intent', label: 'intent', stability: 9999, cap: 9999, note: 'what you asked for; never decays' },
]

const DAYS = 7
const W = 720
const H = 300
const PAD = { l: 46, r: 116, t: 18, b: 34 }

const px = (d: number) => PAD.l + (d / DAYS) * (W - PAD.l - PAD.r)
const py = (r: number) => PAD.t + (1 - r) * (H - PAD.t - PAD.b)

function curvePath(stability: number) {
  const pts: string[] = []
  for (let i = 0; i <= 140; i++) {
    const d = (i / 140) * DAYS
    pts.push(`${px(d).toFixed(1)},${py(retrievability(d, stability)).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

/* The forgetting curve, drawn from the shipped formula. The eviction floor is
   the horizontal line; where a curve crosses it, that memory type is gone. */
export function ForgettingCurves() {
  const svg = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [at, setAt] = useState(1)

  // the readout follows the pointer across the plot; touch drags it too
  const track = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const d = ((x - PAD.l) / (W - PAD.l - PAD.r)) * DAYS
    setAt(Math.min(DAYS, Math.max(0, d)))
  }

  useEffect(() => {
    if (prefersReducedMotion() || !svg.current) return
    const paths = svg.current.querySelectorAll<SVGPathElement>('[data-curve]')
    const ctx = gsap.context(() => {
      paths.forEach((p, i) => {
        const len = p.getTotalLength()
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', delay: 0.1 * i },
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <figure className="not-prose border border-bone/12">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
        <span>retrievability · R(t) = (1 + 19/81 · t/S)^-0.5</span>
        <span className="text-bone/30">fsrs.ts</span>
      </figcaption>
      <div className="overflow-x-auto px-2 py-4">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[34rem] touch-none"
          role="img"
          aria-label="Forgetting curves by memory type"
          onPointerMove={track}
          onPointerDown={track}
        >
          <g stroke="currentColor" className="text-bone/10">
            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
              <line key={r} x1={PAD.l} x2={W - PAD.r} y1={py(r)} y2={py(r)} />
            ))}
          </g>
          <g className="fill-current font-mono text-[10px] text-bone/40">
            {[0, 0.5, 1].map((r) => (
              <text key={r} x={PAD.l - 10} y={py(r) + 3} textAnchor="end">
                {r.toFixed(1)}
              </text>
            ))}
            {[0, 1, 3, 5, 7].map((d) => (
              <text key={d} x={px(d)} y={H - 12} textAnchor="middle">
                {d}d
              </text>
            ))}
          </g>

          {/* eviction floor: retrievability under 0.1 makes an item a candidate */}
          <line x1={PAD.l} x2={W - PAD.r} y1={py(0.1)} y2={py(0.1)} stroke={GOLD} strokeDasharray="4 4" opacity={0.7} />
          <text x={PAD.l + 8} y={py(0.1) - 6} className="font-mono text-[10px]" fill={GOLD}>
            evict 0.10
          </text>

          {KINDS.map((k, i) => {
            const dim = active !== null && active !== k.key
            return (
              <g key={k.key} opacity={dim ? 0.18 : 1} className="transition-opacity duration-300">
                <path
                  data-curve
                  d={k.stability > 100 ? `M ${px(0)},${py(1)} L ${px(DAYS)},${py(1)}` : curvePath(k.stability)}
                  fill="none"
                  stroke={active === k.key ? GOLD : 'currentColor'}
                  strokeWidth={active === k.key ? 2.2 : 1.4}
                  className={active === k.key ? '' : 'text-bone/55'}
                />
                <text
                  x={W - PAD.r + 8}
                  y={py(k.stability > 100 ? 1 : retrievability(DAYS, k.stability)) + 3 + (k.stability > 100 ? -6 : 0)}
                  className="cursor-pointer font-mono text-[10.5px]"
                  fill={active === k.key ? GOLD : 'currentColor'}
                  onMouseEnter={() => setActive(k.key)}
                  onMouseLeave={() => setActive(null)}
                >
                  {k.label}
                </text>
                <title>{`${k.label}: initial stability ${k.stability > 100 ? 'never decays' : `${k.stability}d`}`}</title>
              </g>
            )
          })}
          {/* time cursor: where each type stands at the day under the pointer */}
          <g>
            <line x1={px(at)} x2={px(at)} y1={PAD.t} y2={H - PAD.b} stroke={GOLD} strokeWidth={1} opacity={0.55} />
            {KINDS.map((k) => {
              const r = k.stability > 100 ? 1 : retrievability(at, k.stability)
              return <circle key={k.key} cx={px(at)} cy={py(r)} r={2.6} fill={GOLD} />
            })}
            <text x={px(at)} y={PAD.t - 4} textAnchor="middle" className="font-mono text-[10px]" fill={GOLD}>
              {at < 1 ? `${Math.round(at * 24)}h` : `${at.toFixed(1)}d`}
            </text>
          </g>
          <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" className="text-bone/25" />
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" className="text-bone/25" />
        </svg>
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-bone/12 bg-bone/[0.08] sm:grid-cols-5">
        {KINDS.map((k) => (
          <div
            key={k.key}
            onMouseEnter={() => setActive(k.key)}
            onMouseLeave={() => setActive(null)}
            className={`bg-charcoal px-4 py-3 transition-colors ${active === k.key ? 'bg-charcoal-tint' : ''}`}
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">{k.label}</dt>
            <dd className="mt-1 font-mono text-[13px] tabular-nums text-gold">
              {k.stability > 100 ? '∞' : `S ${k.stability}d`}
            </dd>
            <dd className="mt-1 font-mono text-[12px] tabular-nums text-bone/70">
              R {(k.stability > 100 ? 1 : retrievability(at, k.stability)).toFixed(2)}
            </dd>
            <dd className="mt-1 text-[12.5px] leading-snug text-bone/55">{k.note}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

/* The threshold is a value on a track. Two forces push it, and the agent's own
   behaviour supplies both. */
const AW = 720
const AH = 190
const TRACK = { lo: 0.6, hi: 0.85, y0: 40, y1: 140, x0: 60, x1: 620 }
const KICKS: { at: number; step: number; label: string }[] = [
  { at: 0.12, step: -0.05, label: '3 evictions / 60 s' },
  { at: 0.3, step: 0.05, label: '5 min idle' },
  { at: 0.46, step: -0.05, label: 'thrash again' },
  { at: 0.64, step: 0.05, label: 're-request miss' },
  { at: 0.82, step: 0.05, label: '5 min idle' },
]

const FORCES: [string, number, string][] = [
  ['3 evictions in 60 s', -0.05, 'thrashing; hold more in the window'],
  ['5 minutes idle', 0.05, 'quiet session; let it tighten again'],
  ['re-request miss', 0.05, 'an evicted item was needed; tighten now'],
]

export function AimdTrack() {
  const ty = (v: number) => TRACK.y1 - ((v - TRACK.lo) / (TRACK.hi - TRACK.lo)) * (TRACK.y1 - TRACK.y0)
  // the reader drives the controller; the preset run is what it looks like alone
  const [run, setRun] = useState<{ step: number; label: string }[]>(KICKS.map((k) => ({ step: k.step, label: k.label })))
  const clamp = (v: number) => Math.min(TRACK.hi, Math.max(TRACK.lo, v))

  let v = 0.7
  const pts: string[] = [`${TRACK.x0},${ty(v)}`]
  const marks: { x: number; step: number; label: string }[] = []
  const n = Math.max(run.length, 1)
  run.forEach((k, i) => {
    const x = TRACK.x0 + ((i + 1) / (n + 1)) * (TRACK.x1 - TRACK.x0)
    pts.push(`${x.toFixed(1)},${ty(v).toFixed(1)}`)
    v = clamp(v + k.step)
    pts.push(`${x.toFixed(1)},${ty(v).toFixed(1)}`)
    marks.push({ x, step: k.step, label: k.label })
  })
  pts.push(`${TRACK.x1},${ty(v)}`)
  const current = v

  return (
    <figure className="not-prose border border-bone/12">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
        <span>eviction threshold · aimd, step 0.05</span>
        <span className="text-bone/30">eviction.ts</span>
      </figcaption>
      <div className="overflow-x-auto px-2 py-4">
        <svg viewBox={`0 0 ${AW} ${AH}`} className="w-full min-w-[34rem]" role="img" aria-label="AIMD threshold over a session">
          <g className="text-bone/10" stroke="currentColor">
            <line x1={TRACK.x0} x2={TRACK.x1} y1={TRACK.y0} y2={TRACK.y0} />
            <line x1={TRACK.x0} x2={TRACK.x1} y1={TRACK.y1} y2={TRACK.y1} />
          </g>
          <g className="fill-current font-mono text-[10px] text-bone/40">
            <text x={TRACK.x0 - 10} y={TRACK.y0 + 3} textAnchor="end">
              0.85
            </text>
            <text x={TRACK.x0 - 10} y={TRACK.y1 + 3} textAnchor="end">
              0.60
            </text>
            <text x={TRACK.x0} y={AH - 10}>
              session start
            </text>
            <text x={TRACK.x1} y={AH - 10} textAnchor="end">
              later
            </text>
          </g>
          <polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={2} />
          <circle cx={TRACK.x1} cy={ty(current)} r={3.5} fill={GOLD} />
          <text x={TRACK.x1 - 6} y={ty(current) - 10} textAnchor="end" className="font-mono text-[11px]" fill={GOLD}>
            {current.toFixed(2)}
          </text>
          {marks.map((m, i) => (
            <g key={i} className="fill-current text-bone/45">
              <line
                x1={m.x}
                x2={m.x}
                y1={TRACK.y0 - 12}
                y2={TRACK.y1 + 8}
                stroke="currentColor"
                className="text-bone/12"
              />
              {/* labels crowd once a run gets long; the recent ones carry it */}
              {i >= marks.length - 3 && (
                <text
                  x={m.x}
                  y={m.step < 0 ? TRACK.y1 + 24 : TRACK.y0 - 18}
                  textAnchor="middle"
                  className="font-mono text-[9.5px]"
                >
                  {m.step > 0 ? '+' : '−'}0.05 {m.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-bone/12 px-5 py-4">
        {FORCES.map(([label, step, why]) => (
          <button
            key={label}
            type="button"
            title={why}
            onClick={() => setRun((r) => [...r.slice(-9), { step, label }])}
            className="border border-bone/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/60 transition-colors hover:border-gold hover:text-gold"
          >
            {step > 0 ? '+' : '−'}0.05 · {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRun([])}
          className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-bone/35 transition-colors hover:text-bone"
        >
          reset
        </button>
      </div>
      <p className="border-t border-bone/12 px-5 py-4 text-[14px] leading-relaxed text-bone/60">
        A higher threshold keeps more in the window. Thrashing lowers it, a quiet stretch raises it, and asking for
        something already evicted raises it at once. Push the buttons and the controller does what it does in a
        session: it settles between 0.60 and 0.85 without anyone configuring it.
      </p>
    </figure>
  )
}

type Stage = { n: string; guard: string; what: string }
const STAGES: Stage[] = [
  { n: '1', guard: 'age > 2h and read once', what: 'hard evict' },
  { n: '2', guard: 'over budget or context above 70%', what: 'soft evict, drain to 60%' },
  { n: '3', guard: 'still over budget', what: 'force evict lowest rank' },
]

/* Three gates on the way out of the hot window, an immortal lane around them,
   and the return path that tells the controller it evicted too eagerly. */
export function Cascade() {
  return (
    <figure className="not-prose border border-bone/12">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
        <span>eviction cascade · hot → warm → cold</span>
        <span className="text-bone/30">manager.ts</span>
      </figcaption>

      <div className="grid gap-px bg-bone/[0.08] md:grid-cols-3">
        {STAGES.map((s) => (
          <div key={s.n} className="bg-charcoal px-5 py-5">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-black text-gold">{s.n}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/50">{s.what}</span>
            </div>
            <p className="mt-3 font-mono text-[12.5px] leading-relaxed text-bone/65">{s.guard}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-bone/12 px-5 py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-bone/60">
          <span className="border border-bone/25 px-2.5 py-1 text-bone/85">hot · in the prompt</span>
          <span className="text-bone/35">unload →</span>
          <span className="border border-bone/25 px-2.5 py-1 text-bone/85">warm · .veil/context.db</span>
          <span className="text-bone/35">demote →</span>
          <span className="border border-bone/25 px-2.5 py-1 text-bone/85">cold · graph, returns a pointer</span>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-bone/60">
          Nothing gets deleted on the way down. A fetch back out of cold counts as a miss and pushes the threshold up,
          so the run that evicts too eagerly corrects itself. Pinned items and anything typed{' '}
          <code className="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-[0.85em] text-bone">intent</code> skip all
          three stages.
        </p>
      </div>
    </figure>
  )
}

const HOOKS: [string, string][] = [
  ['before_agent_start', 'the manifest of what is loaded gets appended to the system prompt'],
  ['beforeToolCall / afterToolCall', 'capture, score, evict around every tool call'],
  ['turn_end', 'status bar, and the tool calls whose context got evicted go dim'],
]

export function Wiring() {
  return (
    <figure className="not-prose border border-bone/12">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
        <span>where it sits in the loop</span>
        <span className="text-bone/30">extension.ts · harness.ts</span>
      </figcaption>
      <dl className="divide-y divide-bone/[0.08]">
        {HOOKS.map(([k, v]) => (
          <div key={k} className="grid gap-x-6 gap-y-1.5 px-5 py-4 sm:grid-cols-[16rem_1fr]">
            <dt className="font-mono text-[12.5px] text-gold">{k}</dt>
            <dd className="text-[14.5px] leading-snug text-bone/65">{v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

// CatWidget moods, from the status bar the TUI actually renders
const MOODS: [string, string, string][] = [
  ['z', 'sleeping', 'nothing to do'],
  ['.', 'watching', 'reading the turn'],
  ['~', 'remembering', 'writing an event'],
  ['+', 'learned', 'a new belief landed'],
  ['*', 'recalled', 'something came back'],
  ['!', 'conflict', 'two beliefs disagree'],
]

export function Cat() {
  const [i, setI] = useState(0)
  const [glyph, name, note] = MOODS[i]
  return (
    <div className="not-prose border border-bone/12">
      <div className="border-b border-bone/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
        status bar · one character of state
      </div>
      <div className="flex flex-wrap items-center gap-6 px-5 py-6">
        <span className="w-14 text-center font-mono text-4xl text-gold">{glyph}</span>
        <div className="min-w-[10rem]">
          <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-bone/80">{name}</p>
          <p className="mt-1 text-[14px] text-bone/55">{note}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {MOODS.map(([g], n) => (
            <button
              key={g}
              type="button"
              onClick={() => setI(n)}
              aria-label={MOODS[n][1]}
              className={`h-8 w-8 border font-mono text-[13px] transition-colors ${
                n === i ? 'border-gold text-gold' : 'border-bone/15 text-bone/45 hover:border-bone/40 hover:text-bone'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
