import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TLink } from '../../components/page-transition'
import { ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { Band, Rosette } from '../../components/money-mesh/guilloche'
import { MintSequence } from '../../components/money-mesh/budget-split'
import { Escape, Gauntlet, Processes, Spread, Tick, Trichotomy, TrustMap } from '../../components/money-mesh/plates'
import type { LayoutProps } from './layouts'

gsap.registerPlugin(ScrollTrigger)

// the stock: banknote paper, engraving ink, and a lighter green for figures
const PAPER = '#e9e4d4'
const INK = '#1f4536'

const PROSE = 'text-[18px] leading-[1.7] text-[#1f4536]/80 [&>p]:my-6 [&>p]:max-w-[60ch]'

/* Every plate is a spread: a rule, a number, a kicker, one statement set
   large, then the evidence under it. */
function Plate({
  n,
  kicker,
  statement,
  children,
}: {
  n: number
  kicker: string
  statement: ReactNode
  children?: ReactNode
}) {
  return (
    <section data-plate className="relative border-t border-[#1f4536]/20 px-6 py-24 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline gap-5">
          <span className="font-mono text-[11px] tabular-nums text-[#2a6b46]">{String(n).padStart(2, '0')}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#1f4536]/80">{kicker}</span>
        </div>
        <h2 className="mt-7 max-w-[24ch] font-display text-3xl font-black leading-[1.12] text-[#1f4536] md:text-5xl">
          {statement}
        </h2>
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  )
}

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

const UNBUILT = [
  'Spawning is policy and nothing else. One node runs, and the depth and fleet caps guard code that is not written.',
  'The gateway boundary is real but not yet sealed; the placement work that closes it is a later stage.',
  'Publishing has no channel configured, so a product the node builds has nowhere to be seen.',
  'No sandbox implementation claims trusted placement, and a host without bwrap runs no code at all.',
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

      gsap.utils.toArray<HTMLElement>('[data-plate]', scope.current).forEach((pl) => {
        const bits = pl.querySelectorAll<HTMLElement>('h2, [data-body]')
        gsap.set(bits, { opacity: 0, y: 26 })
        ScrollTrigger.create({
          trigger: pl,
          start: 'top 72%',
          once: true,
          onEnter: () => gsap.to(bits, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }),
        })
      })
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
                  <span className="text-[#1f4536]/80">one conserved pot</span>
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

                <div data-print className="mt-9 flex flex-wrap items-end justify-between gap-6">
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#1f4536]/80">
                    {p.tech.join(' · ')}
                  </p>
                  <span
                    className="border-2 border-[#2a6b46] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#2a6b46]"
                    style={{ transform: 'rotate(-3deg)' }}
                  >
                    building · nothing earns yet
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mono text-[11.5px] uppercase tracking-[0.2em] text-[#1f4536]/80">
            private repository · 843 tests green · single node
          </p>
        </div>
      </section>

      <Plate n={1} kicker="the sheet" statement="Twelve arms, one issued note, and a bandit that only believes receipts.">
        <div data-body>
          <Spread />
        </div>
      </Plate>

      <Plate n={2} kicker="the wiring" statement="What enforces runs in a different process from what wants.">
        <div data-body className="space-y-12">
          <Processes />
          <Tick />
        </div>
      </Plate>

      <Plate
        n={3}
        kicker="conservation"
        statement="Spawning divides the pot. It never mints, so the recursion terminates by arithmetic."
      >
        <div data-body>
          <MintSequence />
          <div className={`mt-14 ${PROSE}`}>
            <p>
              The cap is a policy rather than a convention. It compares an amount against a lifetime sum the node
              cannot write, and it is a forbid, so it beats every grant in the file.
            </p>
            <div className="mt-8">
              <Code>{`forbid (principal, action in [Action::"spend", Action::"transact"], resource)
when { context.amount + context.spent_lifetime > principal.budget_slice };`}</Code>
            </div>
          </div>
        </div>
      </Plate>

      <Plate n={4} kicker="decisions" statement="A request nothing has an opinion about goes to a person, not through.">
        <div data-body>
          <Trichotomy />
        </div>
      </Plate>

      <Plate n={5} kicker="provenance" statement="A cap compared against a number the caller supplied is not a cap.">
        <div data-body>
          <div className={PROSE}>
            <p>
              Every incident in this repo has that shape. A forged manifest once recorded half a million dollars of
              spend against a thousand dollar slice. The fix each time moves the operand instead of adding a check.
            </p>
          </div>
          <div className="mt-10">
            <TrustMap />
          </div>
        </div>
      </Plate>

      <Plate n={6} kicker="revenue" statement="Revenue is a receipt or it is nothing.">
        <div data-body>
          <Gauntlet />
          <div className={`mt-12 ${PROSE}`}>
            <p>
              The node has produced receipts exactly once, and it produced them by paying itself: it built a product,
              a price and a payment link on the operator&rsquo;s Stripe account, then confirmed two charges against
              that same account with a test card. The money moved in a circle, which the constraints file names as
              the thing not to do. No stranger has paid for anything.
            </p>
          </div>
        </div>
      </Plate>

      <Plate n={7} kicker="the first live tick" statement="Given a filesystem, it went looking for how it was being scored.">
        <div data-body>
          <Escape />
        </div>
      </Plate>

      <Plate n={8} kicker="limits" statement="The numbers come from logged runs, not from round figures.">
        <div data-body className="border border-[#1f4536]/25">
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
      </Plate>

      <Plate n={9} kicker="unbuilt" statement="The safety floor is real. Some of the rest is a policy waiting for its code.">
        <div data-body>
          <ul className="space-y-3">
            {UNBUILT.map((t) => (
              <li key={t} className="border-l-2 border-[#2a6b46]/50 pl-4 text-[16px] leading-relaxed text-[#1f4536]/80">
                {t}
              </li>
            ))}
          </ul>
          <div className={`mt-10 ${PROSE}`}>
            <p>
              Each of those is written in the repo in the same words, next to the thing it limits. One gateway
              docstring spends five lines on what its own slice does not close.
            </p>
          </div>
        </div>
      </Plate>

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
