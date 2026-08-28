import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TLink } from '../../components/page-transition'
import { hasPage } from './content'
import { projects, type Project } from '../../content/projects'
import { Github, Globe, Package, ArrowRight } from '../../components/icons'
import { prefersReducedMotion } from '../../lib/motion'
import { fuzzyMatch } from '../../lib/blog-list'
import { revealCards } from '../../lib/reveals'
import { MarginQuote } from '../../components/side-flourish'
import { Meta } from '../../lib/meta'
import { SectionNumber } from '../../components/motifs'
import { HeroBackground } from './hero-bg'
import { useLocalePath } from '../../i18n/use-locale-path'
import { useLocale } from '../../i18n/context'

const primaryLink = (p: Project) => p.links[0]?.href ?? '#'

// creation from void: the first mark that makes a world
const POEM_LINES = ['無の淵に', '筆を落とせば', '世界立つ']
const POEM_EN = 'At the edge of nothing, let the brush fall: a world stands up.'

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
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded border border-bone/25 px-2.5 py-1 font-mono text-[12px] font-medium uppercase tracking-wider text-bone/80 transition-colors hover:border-gold hover:text-gold"
    >
      <Icon className="h-3.5 w-3.5" /> {l.label}
    </a>
  )
}

// crop corners on a proof sheet: the four registration ticks framing a plate
function Crops({ inset = 'inset-0' }: { inset?: string }) {
  const c = 'pointer-events-none absolute h-3 w-3 border-gold/60'
  return (
    <div className={`pointer-events-none absolute ${inset}`}>
      <span aria-hidden className={`${c} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${c} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${c} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}

// data row in the mono column: label left, value right, hairline under
function DataRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-bone/10 py-2">
      <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.15em] text-bone/60">{k}</dt>
      <dd className="font-mono text-[13px] font-semibold text-bone">{v}</dd>
    </div>
  )
}

// framed print plate: shader inside crop corners, mono data column beside it
function Slide({ p }: { p: Project }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const locale = useLocale()
  return (
    <div className="relative border border-bone/12 bg-charcoal-tint/85 p-4 backdrop-blur-sm md:p-6">
      <div className="relative grid gap-5 md:grid-cols-[40%_1fr] md:items-center md:gap-8">
        <div className="group/plate relative aspect-square overflow-hidden bg-charcoal">
          {p.image ? (
            <img src={p.image} alt={`${p.title} preview`} loading="lazy" decoding="async" draggable={false} className="h-full w-full select-none object-cover [-webkit-user-drag:none]" />
          ) : (
            p.jp && <span aria-hidden className="absolute inset-0 flex select-none items-center justify-center font-display text-7xl font-black text-bone/15">{p.jp}</span>
          )}
          <Crops />
          <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
            {p.slug}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{p.phase.replace('-', ' ')}</span>
            {p.stars ? <span className="font-mono text-[11px] text-bone/45">★ {p.stars}</span> : null}
          </div>
          <h2 lang={locale.default ? undefined : 'en'} className="mt-2 font-display text-5xl font-black leading-none text-bone md:text-6xl">{p.title}</h2>
          <div className="my-4 h-px bg-bone/15">
            <span className="block h-px w-16 bg-gold" />
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-bone/70">{p.description}</p>

          <dl className="mt-5 max-w-xs">
            <DataRow k={t('portfolio.year')} v={p.year} />
            {p.lang && <DataRow k={t('portfolio.writtenIn')} v={p.lang} />}
            <DataRow k={t('portfolio.stack')} v={t('portfolio.toolsCount', { count: p.tech.length })} />
          </dl>

          <div className="mt-auto pt-6">
            <div className="flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <span key={t} className="border border-bone/20 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-bone/75">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {hasPage(p.slug) && (
                <TLink
                  to={lp(`/portfolio/${p.slug}`)}
                  onClick={(e) => e.stopPropagation()}
                  className="group/read inline-flex items-center gap-2 border border-gold bg-gold/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-charcoal"
                >
                  {t('portfolio.readMore')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/read:translate-x-1" />
                </TLink>
              )}
              <div className="ml-auto flex flex-wrap gap-2">
                {p.links.map((l) => (
                  <LinkChip key={l.href} l={l} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Carousel({ items }: { items: Project[] }) {
  const { t } = useTranslation()
  const n = items.length
  const slides = [items[n - 1], ...items, items[0]]
  const [pos, setPos] = useState(1)
  const [anim, setAnim] = useState(true)
  const [paused, setPaused] = useState(false)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ x: number; w: number; moved: boolean; id: number } | null>(null)
  const swallow = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion() || paused || n < 2) return
    const id = setInterval(() => setPos((p) => p + 1), 5000)
    return () => clearInterval(id)
  }, [paused, n])

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

  const go = (d: number) => {
    setAnim(true)
    setPos((p) => p + d)
  }

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-3 flex items-baseline justify-between border-b border-bone/12 pb-2">
        <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.25em]">
          <span className="text-gold">{String(active + 1).padStart(2, '0')}</span>
          <span className="text-bone/30">/ {String(n).padStart(2, '0')}</span>
          <span className="text-bone/70">{items[active]?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} aria-label={t('portfolio.previous')} className="flex h-7 w-7 items-center justify-center border border-bone/15 text-bone/60 transition-colors hover:border-gold hover:text-gold">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button onClick={() => go(1)} aria-label={t('portfolio.next')} className="flex h-7 w-7 items-center justify-center border border-bone/15 text-bone/60 transition-colors hover:border-gold hover:text-gold">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        className="cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [&_*]:[-webkit-user-drag:none]"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={`flex ${anim ? 'transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]' : ''}`}
          style={{ transform: `translateX(calc(${-pos * 100}% + ${dragX}px))` }}
          onTransitionEnd={onEnd}
        >
          {slides.map((p, idx) => (
            <div key={idx} className="w-full shrink-0 px-1">
              <Slide p={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((p, d) => (
          <button
            key={p.slug}
            aria-label={t('portfolio.showProject', { title: p.title })}
            onClick={() => {
              setAnim(true)
              setPos(d + 1)
            }}
            className={`h-1.5 rounded-full transition-all ${active === d ? 'w-7 bg-gold' : 'w-1.5 bg-bone/25 hover:bg-bone/50'}`}
          />
        ))}
      </div>
    </div>
  )
}

// same proof-sheet language, shrunk: crop corners, mono foot, gold tick rule
function InfoCard({ p }: { p: Project }) {
  const outbound = !hasPage(p.slug)
  const lp = useLocalePath()
  const locale = useLocale()
  const inner = (
    <>
      <Crops inset="inset-2" />
      <div className="relative flex items-baseline gap-2">
        <h3 lang={locale.default ? undefined : 'en'} className="font-display text-xl font-black text-bone transition-colors group-hover:text-gold">{p.title}</h3>
        {p.jp && <span className="font-display text-sm text-bone/25">{p.jp}</span>}
        <span className="ml-auto font-mono text-[12px] font-medium tabular-nums text-bone/50">
          {p.year} {outbound ? '↗' : '→'}
        </span>
      </div>
      <div className="relative my-3 h-px bg-bone/12">
        <span className="block h-px w-8 bg-gold/70" />
      </div>
      <p className="relative flex-1 text-sm leading-relaxed text-bone/60">{p.description}</p>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {p.tech.slice(0, 3).map((t) => (
            <span key={t} className="border border-bone/20 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-bone/70">
              {t}
            </span>
          ))}
        </div>
        <span className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold/90">
          {p.phase.replace('-', ' ')}
        </span>
      </div>
    </>
  )
  const cls =
    'group relative flex h-full flex-col border border-bone/12 bg-charcoal-tint/20 p-5 transition-colors hover:border-gold/40'
  return outbound ? (
    <a href={primaryLink(p)} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <TLink to={lp(`/portfolio/${p.slug}`)} className={cls}>
      {inner}
    </TLink>
  )
}

const GROUPS = [
  { key: 'now', labelKey: 'portfolio.groupNow', jp: '現在' },
  { key: 'shipped', labelKey: 'portfolio.groupShipped', jp: '完了' },
  { key: 'oss', labelKey: 'portfolio.groupOss', jp: '貢献' },
  { key: 'chaos', labelKey: 'portfolio.groupChaos', jp: '混沌' },
] as const

// carousel curation + order: strongest work first
const CAROUSEL = ['engrammic', 'ocloak', 'stoat', 'palpatine', 'veil', 'money-mesh']

function matches(p: Project, q: string) {
  return (
    fuzzyMatch(p.title.toLowerCase(), q) ||
    fuzzyMatch(p.description.toLowerCase(), q) ||
    (p.lang ? fuzzyMatch(p.lang.toLowerCase(), q) : false) ||
    p.tech.some((t) => fuzzyMatch(t.toLowerCase(), q))
  )
}

export default function PortfolioIndex() {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [q])

  const query = q.trim().toLowerCase()
  const featured = CAROUSEL.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as Project[]
  const shown = query ? projects.filter((p) => matches(p, query)) : projects

  return (
    <main ref={scope} className="relative bg-charcoal text-bone">
      <Meta title={t('portfolio.title')} description="Projects and builds, from AI memory to forkbombs." />
      <HeroBackground />
      <MarginQuote lines={POEM_LINES} translation={POEM_EN} side="right" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-40 pt-40 md:px-10 md:pt-44">
        <header data-card className="mb-10">
          <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-bone/40">
            <SectionNumber n="01" label={t('portfolio.sectionLabel')} />
            <span>作品 · sakuhin</span>
          </div>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h1 className="font-display text-6xl font-black leading-none md:text-8xl">{t('portfolio.title')}</h1>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('portfolio.searchPlaceholder')}
              aria-label={t('portfolio.searchLabel')}
              className="w-full border-b border-bone/25 bg-transparent pb-1 font-mono text-xs tracking-wider outline-none transition-colors placeholder:text-bone/45 focus:border-gold sm:max-w-xs"
            />
          </div>
        </header>

        {!query && (
          <div data-card>
            <Carousel items={featured} />
          </div>
        )}

        {query && shown.length === 0 && (
          <p data-card className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-bone/60">
            {t('portfolio.noMatch', { query: q })}
          </p>
        )}

        {GROUPS.map((g) => {
          const items = shown.filter((p) => p.group === g.key)
          if (!items.length) return null
          return (
            <section key={g.key} className="mt-20">
              <div data-card className="mb-6 flex items-center gap-4">
                <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">{t(g.labelKey)}</span>
                <span className="font-display text-sm text-bone/30">{g.jp}</span>
                <div className="h-px flex-1 bg-bone/10" />
                <span className="font-mono text-[11px] tabular-nums text-bone/30">{String(items.length).padStart(2, '0')}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <div data-card key={p.slug} className="h-full">
                    <InfoCard p={p} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
