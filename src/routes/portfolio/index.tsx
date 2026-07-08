import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Meta } from '../../lib/meta'
import { projects, type Project } from '../../content/projects'
import { fuzzyMatch } from '../../lib/blog-list'
import { Rule, SectionNumber, JPLabel, RegMarks } from '../../components/motifs'
import { Github, Globe, Package, RotateCw, ArrowRight } from '../../components/icons'
import { revealCards } from '../../lib/reveals'
import { prefersReducedMotion } from '../../lib/motion'
import DecryptedText from '../../components/react-bits/DecryptedText'

const GROUPS = [
  { key: 'now', label: 'building now', jp: '現在' },
  { key: 'chaos', label: 'chaos & tools', jp: '混沌' },
] as const

const metaLine = (p: Project) => [p.year, p.lang].filter(Boolean).join(' · ')

function iconFor(href: string) {
  if (href.includes('github.com')) return Github
  if (href.includes('npmjs.com') || href.includes('pypi.org')) return Package
  return Globe
}

function LinkChip({ l }: { l: { label: string; href: string } }) {
  const Icon = iconFor(l.href)
  return (
    <a
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded border border-charcoal/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-charcoal/70 transition-colors hover:border-gold hover:text-gold dark:border-bone/15 dark:text-bone/70"
    >
      <Icon className="h-3.5 w-3.5" /> {l.label}
    </a>
  )
}

function matches(p: Project, query: string) {
  return (
    fuzzyMatch(p.title.toLowerCase(), query) ||
    fuzzyMatch(p.description.toLowerCase(), query) ||
    (p.lang ? fuzzyMatch(p.lang.toLowerCase(), query) : false) ||
    p.tech.some((t) => fuzzyMatch(t.toLowerCase(), query))
  )
}

/* large rectangular featured card (shows everything, no flip) */
function BigCard({ p }: { p: Project }) {
  return (
    <div className="relative flex h-[20rem] flex-col justify-between overflow-hidden rounded border border-charcoal/10 bg-bone-tint/20 p-8 md:h-[22rem] md:p-10 dark:border-bone/10 dark:bg-charcoal-tint/20">
      <RegMarks />
      <div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] font-semibold uppercase tracking-[0.25em]">
          <span className="text-gold">featured</span>
          <span className="text-charcoal/45 dark:text-bone/45">{metaLine(p)}</span>
          {p.stars ? <span className="text-charcoal/45 dark:text-bone/45">★ {p.stars}</span> : null}
        </div>
        <h2 className="mt-4 flex items-baseline gap-3 font-display text-5xl font-black text-charcoal dark:text-bone md:text-6xl">
          {p.title}
          {p.jp && <span className="font-display text-xl font-normal text-charcoal/25 dark:text-bone/25">{p.jp}</span>}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal/75 dark:text-bone/75">{p.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {p.tech.map((t) => (
          <span
            key={t}
            className="rounded border border-charcoal/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-charcoal/50 dark:border-bone/10 dark:text-bone/50"
          >
            {t}
          </span>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          {p.links.map((l) => (
            <LinkChip key={l.href} l={l} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* one-card-at-a-time carousel: auto-advances, swipe/drag to change, seamless both ways */
function FeaturedCarousel({ items }: { items: Project[] }) {
  const n = items.length
  const slides = [items[n - 1], ...items, items[0]] // clones on both ends
  const [pos, setPos] = useState(1) // 1..n are the real slides
  const [anim, setAnim] = useState(true)
  const [paused, setPaused] = useState(false)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ x: number; w: number; moved: boolean; id: number } | null>(null)
  const swallow = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion() || paused || n < 2) return
    const id = setInterval(() => setPos((p) => p + 1), 4000)
    return () => clearInterval(id)
  }, [paused, n])

  // re-enable the transition on the frame after a seamless jump
  useEffect(() => {
    if (anim) return
    const id = requestAnimationFrame(() => setAnim(true))
    return () => cancelAnimationFrame(id)
  }, [anim])

  const onEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
    if (pos === n + 1) {
      setAnim(false)
      setPos(1)
    } else if (pos === 0) {
      setAnim(false)
      setPos(n)
    }
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, w: e.currentTarget.offsetWidth, moved: false, id: e.pointerId }
    setPaused(true)
    setAnim(false)
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    // only capture the pointer once a real drag starts, so plain link clicks aren't swallowed
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true
      e.currentTarget.setPointerCapture?.(drag.current.id)
    }
    setDragX(dx)
  }
  const onUp = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const dx = dragX
    swallow.current = d.moved
    setDragX(0)
    setAnim(true)
    if (d.moved && Math.abs(dx) > d.w * 0.15) setPos((p) => (dx < 0 ? p + 1 : p - 1))
    setPaused(false)
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (swallow.current) {
      e.preventDefault()
      e.stopPropagation()
      swallow.current = false
    }
  }

  const active = (((pos - 1) % n) + n) % n

  return (
    <div className="relative mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        className="cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
      >
        <div
          className={`flex ${anim ? 'transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]' : ''}`}
          style={{ transform: `translateX(calc(${-pos * 100}% + ${dragX}px))` }}
          onTransitionEnd={onEnd}
        >
          {slides.map((p, idx) => (
            <div key={idx} className="w-full shrink-0">
              <BigCard p={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {items.map((p, d) => (
          <button
            key={p.slug}
            aria-label={`Show ${p.title}`}
            onClick={() => {
              setAnim(true)
              setPos(d + 1)
            }}
            className={`h-1.5 rounded-full transition-all ${
              active === d ? 'w-6 bg-gold' : 'w-1.5 bg-charcoal/25 hover:bg-charcoal/50 dark:bg-bone/25 dark:hover:bg-bone/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* small flip card for the group grids */
function FlipCard({ p }: { p: Project }) {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped((f) => !f)
  const face =
    'absolute inset-0 flex cursor-pointer flex-col overflow-hidden rounded border border-charcoal/10 bg-bone-tint/10 p-6 transition-colors hover:border-gold/40 [backface-visibility:hidden] dark:border-bone/10 dark:bg-charcoal-tint/10'
  const hint = <RotateCw className="pointer-events-none absolute right-4 top-4 h-3.5 w-3.5 text-charcoal/25 dark:text-bone/25" />

  return (
    <div data-card className="h-72 [perspective:1400px]">
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div onClick={toggle} className={`${face} ${flipped ? 'pointer-events-none' : ''}`}>
          {hint}
          <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal/50 dark:text-bone/50">
            <span>{metaLine(p)}</span>
            {p.stars ? <span className="text-gold">★ {p.stars}</span> : null}
          </div>
          <h3 className="mt-3 flex items-baseline gap-2 font-display text-2xl font-black text-charcoal dark:text-bone">
            {p.title}
            {p.jp && <span className="font-display text-sm font-normal text-charcoal/30 dark:text-bone/30">{p.jp}</span>}
          </h3>
          <p className="mt-3 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">
            {p.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <span
                key={t}
                className="rounded border border-charcoal/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-charcoal/50 dark:border-bone/10 dark:text-bone/50"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div
          onClick={toggle}
          aria-hidden={!flipped}
          className={`${face} [transform:rotateY(180deg)] ${flipped ? '' : 'pointer-events-none'}`}
        >
          {hint}
          <span className="font-display text-lg font-bold text-charcoal dark:text-bone">{p.title}</span>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/55 dark:text-bone/55">
            <span>
              year <span className="text-gold">{p.year}</span>
            </span>
            {p.lang && (
              <span>
                lang <span className="text-gold">{p.lang}</span>
              </span>
            )}
            {p.stars ? (
              <span>
                stars <span className="text-gold">{p.stars}</span>
              </span>
            ) : null}
          </div>
          <p className="mt-3 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">
            {p.body}
          </p>
          <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {p.links.map((l) => (
              <LinkChip key={l.href} l={l} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioIndex() {
  const [q, setQ] = useState('')
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [q])

  const query = q.trim().toLowerCase()
  const shown = query ? projects.filter((p) => matches(p, query)) : projects
  const featured = projects.filter((p) => p.featured)

  return (
    <>
      <Meta title="Portfolio" description="Projects and builds, from AI memory to forkbombs." />
      <section ref={scope} className="relative mx-auto max-w-5xl px-6 pb-24 pt-36">
        <div data-card className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
          <div className="relative">
            <SectionNumber n="01" label="portfolio" />
            <div className="relative mt-3 w-fit">
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
                <JPLabel>作品</JPLabel>
                <span aria-hidden className="h-4 w-px bg-gold/50" />
              </div>
              <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
                <DecryptedText text="Portfolio" speed={50} delay={100} />
              </h1>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
            <Link
              to="/stack"
              className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-paper-deep transition-colors hover:text-gold dark:text-paper"
            >
              <span className="link-draw">the stack</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="search projects..."
              aria-label="Search projects"
              className="w-full border-b border-charcoal/25 bg-transparent pb-1 font-mono text-xs font-medium tracking-wider outline-none transition-colors placeholder:text-charcoal/55 focus:border-gold dark:border-bone/25 dark:placeholder:text-bone/55 sm:max-w-xs"
            />
          </div>
        </div>

        <div data-card>
          <Rule className="mt-8" />
        </div>

        {shown.length === 0 && (
          <p
            data-card
            className="mt-16 font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/65 dark:text-bone/65"
          >
            no projects match [ {q} ]
          </p>
        )}

        {/* featured carousel (only when not searching) */}
        {!query && featured.length > 0 && <FeaturedCarousel items={featured} />}

        {GROUPS.map((g) => {
          const items = shown.filter((p) => p.group === g.key && (!!query || !p.featured))
          if (!items.length) return null
          return (
            <div key={g.key}>
              <div data-card className="mb-8 mt-20 flex items-center gap-4">
                <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">{g.label}</span>
                <span className="font-display text-sm text-charcoal/30 dark:text-bone/30">{g.jp}</span>
                <div className="h-px flex-1 bg-charcoal/10 dark:bg-bone/10" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <FlipCard key={p.slug} p={p} />
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
