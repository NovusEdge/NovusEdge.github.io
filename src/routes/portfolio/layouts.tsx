import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Project } from '../../content/projects'
import { TLink } from '../../components/page-transition'
import { ProjectHeader } from '../../components/project-header'
import { Rule } from '../../components/motifs'
import { ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import type { ProjectContent } from './content/types'
import { useLocalePath } from '../../i18n/use-locale-path'
import { useLocale } from '../../i18n/context'

export type LayoutProps = { p: Project; c: ProjectContent }

const PROSE =
  'prose prose-neutral prose-project max-w-none leading-relaxed text-charcoal/80 dark:prose-invert dark:text-bone/85 prose-p:my-6 prose-li:my-1.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:text-gold prose-code:before:content-none prose-code:after:content-none'

const nn = (i: number) => String(i + 1).padStart(2, '0')

// One scroll listener drives both the spy and the progress readout; per-section
// IntersectionObservers would fire out of order on fast anchor jumps.
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState('')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 200) current = id
      }
      setActive(current)
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return { active, progress }
}

/* Desktop only: the accessibility button owns the bottom-left corner, and a
   phone already has the browser's own scroll-to-top gesture. */
function JumpTop({ show }: { show: boolean }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-8 right-8 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-charcoal/15 bg-bone/90 text-charcoal/60 shadow-lg backdrop-blur transition-all hover:border-gold hover:text-gold dark:border-bone/15 dark:bg-charcoal/90 dark:text-bone/60 lg:flex ${
        show ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <ArrowRight className="h-4 w-4 -rotate-90" />
    </button>
  )
}

function ContentsList({ c, active, onNavigate }: { c: ProjectContent; active?: string; onNavigate?: () => void }) {
  return (
    <ul className="border-l border-charcoal/10 dark:border-bone/10">
      {c.sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? 'true' : undefined}
            onClick={onNavigate}
            // 44px rows on touch; the desktop rail tightens back up
            className={`-ml-px flex min-h-11 items-center gap-3 border-l-2 pl-4 font-mono text-[11px] uppercase tracking-wider transition-colors lg:min-h-0 lg:items-baseline lg:py-1.5 ${
              active === s.id
                ? 'border-gold text-gold'
                : 'border-transparent text-charcoal/45 hover:text-gold dark:text-bone/45'
            }`}
          >
            <span className="text-[9px] tabular-nums opacity-70">{nn(i)}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  )
}

/* ─── Dossier body ───────────────────────────────────────────────────────
   Sticky contents rail with scroll-spy beside the prose. Vertical kanji in
   the gutter, sections revealed on scroll, a closing plate at the end. */
export function Dossier({ p, c }: LayoutProps) {
  const scope = useRef<HTMLDivElement>(null)
  const mobileToc = useRef<HTMLDetailsElement>(null)
  const ids = useMemo(() => c.sections.map((s) => s.id), [c])
  const { active, progress } = useScrollSpy(ids)
  const pct = Math.round(progress * 100)
  const lp = useLocalePath()
  const locale = useLocale()

  // IntersectionObserver rather than ScrollTrigger: an anchor jump from the
  // rail skips scroll positions, and IO still fires for the landed section.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const secs = gsap.utils.toArray<HTMLElement>('[data-sec]', scope.current)
    gsap.set(secs, { opacity: 0, y: 26 })
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          io.unobserve(e.target)
          gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [c])

  return (
    <>
      <ProjectHeader p={p} lede={c.lede} />
      <JumpTop show={progress > 0.08} />
      <div ref={scope} className="mx-auto grid max-w-5xl gap-12 px-6 pb-24 pt-14 lg:grid-cols-[12rem_1fr]">
        {/* Mobile loses the sticky rail, so the progress hairline moves to the
            viewport edge rather than disappearing. */}
        <div
          aria-hidden
          className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent lg:hidden"
        >
          <div className="h-full bg-gold transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>

        <nav aria-label="Contents" className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-5 bg-gold" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-charcoal/40 dark:text-bone/40">
              contents
            </span>
          </div>
          <div className="mt-4">
            <ContentsList c={c} active={active} />
          </div>
          <div className="mt-8">
            <div className="h-px w-full bg-charcoal/10 dark:bg-bone/10">
              <div className="h-px bg-gold" style={{ width: `${pct}%` }} />
            </div>
            <span className="mt-2 block font-mono text-[10px] tabular-nums uppercase tracking-[0.25em] text-charcoal/40 dark:text-bone/40">
              read {String(pct).padStart(3, '0')} / 100
            </span>
          </div>
        </nav>

        <article lang={locale.default ? undefined : 'en'}>
          <nav aria-label="Contents, compact" className="mb-12 lg:hidden">
            <details className="group" ref={mobileToc}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-charcoal/40 dark:text-bone/40 [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="h-px w-5 bg-gold" />
                contents
                <span aria-hidden className="text-gold transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="mt-4">
                <ContentsList c={c} active={active} onNavigate={() => mobileToc.current?.removeAttribute('open')} />
              </div>
            </details>
          </nav>

          {c.sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              data-sec
              className="scroll-mt-32 [&+&]:mt-20"
            >
              <header className="mb-6">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-gold">
                  {nn(i)}
                </span>
                <h2 className="mt-2 font-display text-3xl font-black text-charcoal dark:text-bone">{s.title}</h2>
              </header>
              <div className={`${PROSE} max-w-[68ch]`}>{s.body}</div>
            </section>
          ))}

          <footer data-sec className="mt-24">
            <Rule />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
              {p.jp && (
                <span aria-hidden className="select-none font-display text-3xl text-charcoal/10 dark:text-bone/10">
                  {p.jp}
                </span>
              )}
              <TLink
                to={lp('/portfolio')}
                className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-charcoal/50 transition-colors hover:text-gold dark:text-bone/50"
              >
                back to portfolio
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </TLink>
            </div>
          </footer>
        </article>
      </div>
    </>
  )
}
