import { useEffect, useRef } from 'react'
import { TLink } from '../../components/page-transition'
import { revealCards } from '../../lib/reveals'
import { prefersReducedMotion } from '../../lib/motion'
import { ArrowRight } from '../../components/icons'
import { DOMAINS, STACK, LANGS, LANG_TOTAL, LATELY, GROUP_NOTES, DEPTH, PROJECTS, type Tech, type Depth } from './data'

// look up a tech's icon by name, for the project rows
const TECH_BY_NAME = new Map(STACK.flatMap((g) => g.items.map((t) => [t.name, t] as const)))

// editorial x hud: a magazine spread that is quietly instrumented.
// print bones (huge type, kanji, hairlines, whitespace), live blood
// (wiping ink bars, mono telemetry captions).

// print registration marks: the little crop corners on a proof sheet
function RegMarks() {
  const c = 'pointer-events-none absolute h-3 w-3 border-gold/50'
  return (
    <>
      <span aria-hidden className={`${c} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${c} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${c} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${c} bottom-0 right-0 border-b border-r`} />
    </>
  )
}

// depth dot: solid = daily driver, half = comfortable, ring = just dabbling
const DEPTH_DOT: Record<Depth, string> = {
  daily: 'bg-gold',
  comfortable: 'bg-gold/40',
  dabbling: 'border border-gold/50',
}

// index entry: depth dot, big display name, brand icon surfaces on hover
function TechEntry({ t }: { t: Tech }) {
  const depth = DEPTH[t.name] ?? 'comfortable'
  return (
    <li className="group flex cursor-default items-center gap-2">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${DEPTH_DOT[depth]}`} title={depth} />
      <span
        className={`font-display text-2xl font-bold transition-colors group-hover:text-gold md:text-3xl ${
          depth === 'dabbling'
            ? 'text-charcoal/45 dark:text-bone/45'
            : 'text-charcoal/75 dark:text-bone/75'
        }`}
      >
        {t.name}
      </span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`h-4 w-4 self-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          t.mono ? 'fill-charcoal dark:fill-bone' : ''
        }`}
        style={t.mono ? undefined : { fill: `#${t.icon.hex}` }}
      >
        <path d={t.icon.path} />
      </svg>
    </li>
  )
}

export default function StackEditorial() {
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [])

  const reduced = prefersReducedMotion()
  const maxLang = Math.max(...LANGS.map((l) => l.n))

  return (
    <>
      <main ref={scope} className="mx-auto max-w-6xl px-6 pb-32 pt-32 md:px-10">
        {/* masthead: magazine header wired with a live folio line */}
        <header className="relative" data-card>
          <div className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-[0.3em] text-charcoal/50 dark:text-bone/50">
            <span>04 / stack</span>
            <span>技 · gijutsu</span>
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-4xl font-black leading-[1.05] text-charcoal dark:text-bone sm:text-5xl md:text-6xl">
            The tools i <span className="text-gold">actually reach for</span>.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/60 dark:text-bone/60">
            Mostly AI these days, some hardware, and a lot of muscle memory.
          </p>
        </header>

        {/* lately: what i'm actively deep in right now */}
        <div
          data-card
          className="mt-14 flex flex-col gap-2 border-y border-charcoal/10 py-4 sm:flex-row sm:items-baseline sm:gap-5 dark:border-bone/10"
        >
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">lately · 2026</span>
          <p className="text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">{LATELY}</p>
        </div>

        {/* domains: numbered features */}
        <section className="mt-24">
          <h2 className="sr-only">Focus areas</h2>
          {DOMAINS.map((d, i) => (
            <article
              key={d.title}
              data-card
              className="group grid grid-cols-1 gap-4 border-b border-charcoal/10 py-10 md:grid-cols-[6rem_1fr_auto] dark:border-bone/10"
            >
              <div>
                <span className="font-mono text-sm text-charcoal/40 dark:text-bone/40">0{i + 1}</span>
              </div>
              <div>
                <h3 className="font-display text-3xl font-black text-charcoal transition-colors group-hover:text-gold dark:text-bone md:text-4xl">
                  {d.title}
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-charcoal/65 dark:text-bone/65">{d.blurb}</p>
              </div>
              <span
                aria-hidden
                className="font-display text-6xl text-charcoal/10 transition-colors group-hover:text-gold/30 dark:text-bone/10 md:text-7xl"
              >
                {d.jp}
              </span>
            </article>
          ))}
        </section>

        {/* in anger: the stack doing real work, mapped to projects */}
        <section className="mt-28">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3" data-card>
            <div className="flex items-baseline gap-3">
              <h2 className="font-mono text-sm uppercase tracking-[0.4em] text-gold">proof</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-bone/40">
                the stack, doing real work
              </span>
            </div>
            <TLink
              to="/portfolio"
              className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.06] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/15"
            >
              full portfolio
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </TLink>
          </div>
          {PROJECTS.map((p) => (
            <div
              key={p.name}
              data-card
              className="grid grid-cols-1 gap-3 border-t border-charcoal/10 py-6 md:grid-cols-[13rem_1fr_auto] md:items-center md:gap-8 dark:border-bone/10"
            >
              <span className="font-display text-2xl font-black text-charcoal dark:text-bone">{p.name}</span>
              <p className="text-sm leading-relaxed text-charcoal/65 dark:text-bone/65">{p.blurb}</p>
              <div className="flex items-center gap-4 md:justify-end">
                {p.tech.map((name) => {
                  const t = TECH_BY_NAME.get(name)
                  if (!t) return null
                  return (
                    <svg
                      key={name}
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label={name}
                      className={`h-6 w-6 shrink-0 transition-transform hover:scale-110 ${
                        t.mono ? 'fill-charcoal/70 dark:fill-bone/70' : ''
                      }`}
                      style={t.mono ? undefined : { fill: `#${t.icon.hex}` }}
                    >
                      <title>{name}</title>
                      <path d={t.icon.path} />
                    </svg>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* languages: the single detailed breakdown, framed like a proof sheet */}
        <section className="relative mt-28 px-6 py-12 md:px-12" data-card>
          <RegMarks />
          <div className="mb-8 flex items-baseline gap-3">
            <h2 className="font-mono text-sm uppercase tracking-[0.4em] text-gold">languages</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-bone/40">
              by repo
            </span>
          </div>
          <div className="space-y-3">
            {LANGS.map((l, i) => (
              <div key={l.name} className="flex items-center gap-4">
                <span className="w-24 shrink-0 font-display text-sm font-bold text-charcoal/70 dark:text-bone/70">
                  {l.name}
                </span>
                <div className="h-[3px] flex-1 bg-charcoal/10 dark:bg-bone/10">
                  <div
                    className={`h-full ${i === 0 ? 'bg-gold' : 'bg-charcoal/60 dark:bg-bone/60'}`}
                    style={{
                      width: reduced ? `${(l.n / maxLang) * 100}%` : 0,
                      animation: reduced ? undefined : `edbar 0.9s ${i * 80}ms both ease-out`,
                      ['--w' as string]: `${(l.n / maxLang) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-charcoal/45 dark:text-bone/45">
                  {String(Math.round((l.n / LANG_TOTAL) * 100)).padStart(2, '0')}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* the index: each group carries a how/why line; dots encode honest depth */}
        <section className="mt-28">
          <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4" data-card>
            <h2 className="font-mono text-sm uppercase tracking-[0.4em] text-gold">the index</h2>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em] text-charcoal/45 dark:text-bone/45">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> daily
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold/40" /> comfortable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full border border-gold/50" /> dabbling
              </span>
            </div>
          </div>
          {STACK.map((g) => (
            <div
              key={g.label}
              data-card
              className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-charcoal/10 py-8 md:grid-cols-[18rem_1fr] dark:border-bone/10"
            >
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl font-black text-charcoal dark:text-bone">{g.label}</span>
                  <span className="font-display text-sm text-charcoal/30 dark:text-bone/30">{g.jp}</span>
                </div>
                {GROUP_NOTES[g.label] && (
                  <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-charcoal/55 dark:text-bone/55">
                    {GROUP_NOTES[g.label]}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-px w-6 bg-gold/60" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-bone/40">
                    {String(g.items.length).padStart(2, '0')} units
                  </span>
                </div>
              </div>
              <ul className="flex flex-wrap gap-x-7 gap-y-3">
                {g.items.map((t) => (
                  <TechEntry key={t.name} t={t} />
                ))}
              </ul>
            </div>
          ))}
        </section>

      </main>
      <style>{`
        @keyframes edbar { from { width: 0 } to { width: var(--w) } }
      `}</style>
    </>
  )
}
