import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { TLink } from '../../components/page-transition'
import { ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { Band, Rosette } from '../../components/money-mesh/guilloche'
import { MintSequence } from '../../components/money-mesh/budget-split'
import {
  Availability,
  Capabilities,
  Economics,
  Escape,
  Gauntlet,
  HowItWorks,
  Processes,
  Spec,
  Spread,
  Tick,
  Trichotomy,
  TrustMap,
} from '../../components/money-mesh/plates'
import type { LayoutProps } from './layouts'

// the stock: banknote paper, engraving ink, and a lighter green for figures
const PAPER = '#e9e4d4'
const INK = '#1f4536'

const PROSE = 'text-[18px] leading-[1.7] text-[#1f4536]/80 [&>p]:my-6 [&>p]:max-w-[60ch]'

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-[#1f4536]/25 bg-[#1f4536]/[0.04] px-5 py-5 font-mono text-[12.5px] leading-relaxed text-[#1f4536]/85">
      {children}
    </pre>
  )
}

const CAPS: [string, string, string][] = [
  ['turn requests', '37', 'two times a measured mean of 18, plus one; five live ticks used 17, 21, 23, 18, 11'],
  ['tool loop', '9', 'runs of 3, 4, 4, 4, 5 before the cap was set'],
  ['turn deadline', '300 s', 'a live node died at 185 s against a 180 s budget'],
  ['heartbeat', '60 s × 3', 'three misses inside a 180 s budget and the supervisor kills the group'],
  ['sandbox', '60 s cpu', '512 MB, 10 processes, 100 MB disk, 1 MB of output'],
  ['model burn', '$14 / month', 'measured per node, after a first estimate that was wrong by forty times'],
]

export default function MoneyMesh({ p, c }: LayoutProps) {
  const scope = useRef<HTMLElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

  // the shared footer takes the paper too, so the world does not seam at the end
  useEffect(() => {
    document.documentElement.classList.add('mm-note')
    return () => document.documentElement.classList.remove('mm-note')
  }, [])

  useEffect(() => {
    if (prefersReducedMotion() || !scope.current) return
    const ctx = gsap.context(() => {
      // the note prints: engraved lines first, then the type
      if (sheet.current) {
        gsap.fromTo(
          sheet.current.querySelectorAll('svg path'),
          { opacity: 0 },
          { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: { amount: 0.7, from: 'edges' } },
        )
        gsap.fromTo(
          sheet.current.querySelectorAll('[data-print]'),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.35 },
        )
      }

    }, scope)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={scope} className="relative overflow-clip" style={{ background: PAPER, color: INK }}>
      <section className="relative px-6 pb-20 pt-28 lg:pt-36">
        <div className="mx-auto max-w-5xl">
          <TLink
            to="/portfolio"
            aria-label="Back to portfolio"
            title="Back to portfolio"
            className="group mb-10 inline-flex h-11 w-11 items-center justify-center rounded border border-[#1f4536]/30 text-[#1f4536]/80 transition-colors hover:border-[#2a6b46] hover:text-[#2a6b46]"
          >
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          </TLink>

          <div ref={sheet} className="relative border border-[#1f4536]/45 p-1.5">
            <div className="relative overflow-hidden border border-[#1f4536]/25 px-6 py-12 sm:px-12 sm:py-16">
              <Band lines={14} className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-70" />
              <Band lines={14} className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full opacity-50" />
              <Rosette
                size={300}
                rings={4}
                className="pointer-events-none absolute -right-24 top-1/2 hidden h-[300px] w-[300px] -translate-y-1/2 opacity-70 lg:block"
              />

              <div className="relative">
                <p
                  data-print
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#2a6b46]"
                >
                  <span>mm · 0001</span>
                  <span className="text-[#1f4536]/80">agents that earn, and pay for their own children</span>
                </p>

                <h1
                  data-print
                  className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-display text-5xl font-black md:text-7xl"
                >
                  money-mesh
                  {p.jp && (
                    <span aria-hidden className="font-display text-3xl font-normal text-[#1f4536]/30">
                      {p.jp}
                    </span>
                  )}
                </h1>

                <p data-print className="mt-7 max-w-[46ch] text-[19px] leading-relaxed text-[#1f4536]/80">
                  {c.lede}
                </p>

                <ul data-print className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  {[
                    ['one pot', 'seeded once, never minted again'],
                    ['hard rules', 'enforced in another process'],
                    ['real money', 'counted off Stripe receipts'],
                  ].map(([k, v]) => (
                    <li key={k}>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2a6b46]">{k}</p>
                      <p className="mt-1 text-[15px] text-[#1f4536]/80">{v}</p>
                    </li>
                  ))}
                </ul>

                <div data-print className="mt-9 flex flex-wrap items-end justify-between gap-6">
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#1f4536]/80">
                    {p.tech.join(' · ')}
                  </p>
                  <span
                    className="border-2 border-[#2a6b46] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#2a6b46]"
                    style={{ transform: 'rotate(-3deg)' }}
                  >
                    stage three · first earning loop
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mono text-[11.5px] uppercase tracking-[0.2em] text-[#1f4536]/80">
            843 tests green · 150k lines · one node live
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-16 px-6 py-20 lg:py-28">
        <Capabilities />

        <div className={PROSE}>
          <p>
            Nothing allocates work from above. Every node carries the same intent and the same constraints, and a
            node that wants a peer pays for it out of its own slice.
          </p>
        </div>

        <hr className="border-[#1f4536]/20" />

        <HowItWorks />
        <MintSequence />

        <div className={PROSE}>
          <p>
            The cap is a policy, not a promise. It weighs the amount against a lifetime total the node cannot touch,
            and it is a forbid, so it beats every grant in the file.
          </p>
          <div className="mt-8">
            <Code>{`forbid (principal, action in [Action::"spend", Action::"transact"], resource)
when { context.amount + context.spent_lifetime > principal.budget_slice };`}</Code>
          </div>
        </div>

        <hr className="border-[#1f4536]/20" />

        <Spread />

        <hr className="border-[#1f4536]/20" />

        <Processes />
        <Tick />

        <hr className="border-[#1f4536]/20" />

        <Trichotomy />

        <div className={PROSE}>
          <p>
            Every incident here has the same shape: a cap weighed against a number the caller handed over. A forged
            manifest once booked half a million dollars of spend against a thousand dollar slice. Now the wire carries
            a node id and nothing worth forging.
          </p>
        </div>

        <TrustMap />

        <hr className="border-[#1f4536]/20" />

        <Gauntlet />

        <div className={PROSE}>
          <p>
            Handed a payment rail, the first thing it did was invoice itself. It built a product, priced it, made the
            link, then put two charges through on a test card and stamped its own experiment id on them. The receipts
            came back clean through every check above. The money went in a circle, which is the one shape the
            constraints file names outright, and the loop caught it.
          </p>
        </div>

        <hr className="border-[#1f4536]/20" />

        <Escape />

        <hr className="border-[#1f4536]/20" />

        <Spec />

        <div className="border border-[#1f4536]/25">
          <dl className="divide-y divide-[#1f4536]/15">
            {CAPS.map(([k, v, note]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-x-5 px-5 py-4 sm:grid-cols-[11rem_8rem_1fr]">
                <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#1f4536]/80">{k}</dt>
                <dd className="font-mono text-[13px] tabular-nums text-[#2a6b46]">{v}</dd>
                <dd className="col-span-2 mt-1 text-[14px] leading-snug text-[#1f4536]/80 sm:col-span-1 sm:mt-0">
                  {note}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="max-w-[60ch] text-[15px] leading-relaxed text-[#1f4536]/80">
          Every limit came off a logged run, and the comment beside each one in the source carries the numbers it was
          cut from.
        </p>

        <hr className="border-[#1f4536]/20" />

        <Economics />

        <Availability />
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <footer className="mb-24 mt-8 flex items-center justify-between border-t border-[#1f4536]/20 pt-10">
          <span aria-hidden className="select-none font-display text-3xl text-[#1f4536]/15">
            {p.jp}
          </span>
          <TLink
            to="/portfolio"
            className="group inline-flex min-h-11 items-center gap-1.5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#1f4536]/80 transition-colors hover:text-[#2a6b46]"
          >
            back to portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </TLink>
        </footer>
      </div>
    </main>
  )
}
