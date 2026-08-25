import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { RosetteDefs, RosetteRef } from './guilloche'

gsap.registerPlugin(ScrollTrigger)

/* The conserved-budget invariant, played rather than clicked: scrolling the
   plate advances the generations, and the sum under them never moves. Cents
   are integers because the repo keeps money in cents everywhere and converts
   only at the env boundary, so a child takes the floor and the parent keeps
   the remainder. Numbers are the shipped defaults; the depth and fleet caps
   are the Cedar scaffold values. No spawn code exists yet, so this draws a
   policy rather than a feature. */

const POT = 500 // MM_BUDGET_USD default, in cents
const TRIAL = 25 // what one experiment costs to try
const MAX_DEPTH = 5

type Note = { id: number; slice: number; gen: number }

// each generation halves every note that can still fund a trial
function generations() {
  const rows: Note[][] = [[{ id: 1, slice: POT, gen: 0 }]]
  let next = 2
  for (let g = 1; g < MAX_DEPTH; g++) {
    const prev = rows[g - 1]
    const kept: Note[] = []
    const born: Note[] = []
    for (const n of prev) {
      const child = Math.floor(n.slice / 2)
      if (child < TRIAL) {
        kept.push({ ...n, gen: g })
        continue
      }
      kept.push({ ...n, slice: n.slice - child, gen: g })
      born.push({ id: next++, slice: child, gen: g })
    }
    rows.push([...kept, ...born])
  }
  return rows
}

const ROWS = generations()
const serial = (id: number) => `MM-${String(id).padStart(4, '0')}`

export function MintSequence() {
  const scope = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const still = prefersReducedMotion()

  useEffect(() => {
    if (still || !scope.current) return
    const st = ScrollTrigger.create({
      trigger: scope.current,
      start: 'top 78%',
      end: 'bottom 40%',
      onUpdate: (self) => {
        const s = Math.min(ROWS.length - 1, Math.floor(self.progress * ROWS.length))
        setStep((v) => (v === s ? v : s))
      },
    })
    return () => st.kill()
  }, [still])

  const row = ROWS[still ? ROWS.length - 1 : step]
  const total = row.reduce((a, n) => a + n.slice, 0)

  return (
    <div ref={scope} className="relative">
      <RosetteDefs />
      <div className="flex flex-wrap items-stretch justify-center gap-2.5">
        {row.map((n) => (
          <div
            key={n.id}
            className="relative min-w-[7.5rem] overflow-hidden border border-[#1f4536]/30 bg-[#1f4536]/[0.04] px-3 py-2.5 transition-all duration-500"
          >
            <RosetteRef className="pointer-events-none absolute -right-7 -top-6 h-[96px] w-[96px] opacity-70" />
            <span className="relative block font-mono text-[10px] uppercase tracking-[0.18em] text-[#1f4536]/80">
              {serial(n.id)}
            </span>
            <span className="relative block font-mono text-[16px] tabular-nums text-[#2a6b46]">{n.slice}c</span>
          </div>
        ))}
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-px bg-[#1f4536]/15 sm:grid-cols-4">
        {[
          ['generation', `${row[0].gen}`],
          ['notes', `${row.length}`],
          ['Σ slices', `${total}c`],
          ['seeded once', `${POT}c`],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#e9e4d4] px-4 py-3">
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#1f4536]/80">{k}</dt>
            <dd className="mt-1 font-mono text-[17px] tabular-nums text-[#1f4536]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
