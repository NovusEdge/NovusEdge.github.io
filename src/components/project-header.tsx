import type { CSSProperties, ReactNode } from 'react'
import { TLink } from './page-transition'
import type { Project } from '../content/projects'
import { Rule } from './motifs'
import { Github, Globe, Package, ArrowRight } from './icons'
import { techRef } from '../lib/tech-icons'
import DecryptedText from './react-bits/DecryptedText'

const PHASE_STYLE: Record<Project['phase'], { label: string; class: string }> = {
  building: { label: 'building', class: 'border-gold/50 text-gold' },
  shipped: { label: 'shipped', class: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400' },
  'on-ice': { label: 'on ice', class: 'border-sky-400/50 text-sky-500' },
  'chaos-era': { label: 'chaos era', class: 'border-charcoal/25 text-charcoal/55 dark:border-bone/25 dark:text-bone/55' },
  contributor: { label: 'contributor', class: 'border-violet-500/50 text-violet-600 dark:text-violet-400' },
}

function SiIcon({ path, className = '', style }: { path: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`fill-current ${className}`} style={style}>
      <path d={path} />
    </svg>
  )
}

/* Primary language as its mark alone. The name arrives on hover, so the
   heading row stays quiet until someone asks. */
function LangMark({ lang }: { lang: string }) {
  const t = techRef(lang)
  if (!t.icon) {
    return (
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal/55 dark:text-bone/55">{lang}</span>
    )
  }
  return (
    <span className="group/lang relative flex items-center">
      <SiIcon
        path={t.icon.path}
        className="h-6 w-6 text-charcoal/45 transition-colors group-hover/lang:text-[color:var(--lang)] dark:text-bone/45"
        // simple-icons ships the brand hex; only the hover state spends it
        style={{ ['--lang' as string]: `#${t.icon.hex}` }}
      />
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-charcoal/15 bg-bone px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-charcoal/70 opacity-0 transition-opacity group-hover/lang:opacity-100 dark:border-bone/15 dark:bg-charcoal dark:text-bone/70">
        {lang}
      </span>
    </span>
  )
}

function TechTag({ name }: { name: string }) {
  const t = techRef(name)
  const inner = (
    <>
      {t.icon && <SiIcon path={t.icon.path} className="h-4 w-4 opacity-60 transition-opacity group-hover/tag:opacity-100" />}
      {name}
    </>
  )
  const cls =
    'group/tag inline-flex items-center gap-2 rounded border border-charcoal/15 px-3 py-1.5 font-mono text-[13px] tracking-wide text-charcoal/70 transition-colors dark:border-bone/15 dark:text-bone/70'

  if (!t.href) return <span className={cls}>{inner}</span>
  return (
    <a
      href={t.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cls} hover:border-gold hover:text-gold`}
    >
      {inner}
    </a>
  )
}

const iconFor = (href: string) =>
  href.includes('github.com') ? Github : href.includes('npmjs.com') || href.includes('pypi.org') ? Package : Globe

function LinkRow({ l }: { l: { label: string; href: string } }) {
  const Icon = iconFor(l.href)
  return (
    <a
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link flex items-center justify-between gap-6 border-b border-charcoal/10 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-charcoal/65 transition-colors last:border-b-0 hover:text-gold dark:border-bone/10 dark:text-bone/65"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" />
        {l.label}
      </span>
      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100" />
    </a>
  )
}

/* The one fixed part of every project page. Bodies below it are free to be
   styled per project. */
export function ProjectHeader({ p, lede }: { p: Project; lede: ReactNode }) {
  const phase = PHASE_STYLE[p.phase]
  return (
    <header className="mx-auto max-w-5xl px-6 pt-32">
      <div className="mb-10">
        <TLink
          to="/portfolio"
          className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-charcoal/50 transition-colors hover:text-gold dark:text-bone/50"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-1" />
          back to portfolio
        </TLink>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <h1 className="flex items-baseline gap-4 font-display text-6xl font-black text-charcoal dark:text-bone md:text-7xl">
          <DecryptedText text={p.title} speed={50} delay={100} />
          {p.jp && <span className="font-display text-2xl font-normal text-charcoal/20 dark:text-bone/20">{p.jp}</span>}
        </h1>

        <div className="flex items-center gap-4">
          <span
            className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${phase.class}`}
          >
            {phase.label}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal/45 dark:text-bone/45">
            {p.year}
          </span>
          {p.lang && <LangMark lang={p.lang} />}
          {p.stars ? (
            <span className="font-mono text-xs tracking-[0.2em] text-charcoal/45 dark:text-bone/45">★ {p.stars}</span>
          ) : null}
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xl leading-relaxed text-charcoal/75 dark:text-bone/75">{lede}</p>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_15rem]">
        <div className="flex flex-wrap content-start gap-2">
          {p.tech.map((t) => (
            <TechTag key={t} name={t} />
          ))}
        </div>
        {p.links.length > 0 && (
          <div className="flex flex-col md:border-l md:border-charcoal/10 md:pl-8 md:dark:border-bone/10">
            {p.links.map((l) => (
              <LinkRow key={l.href} l={l} />
            ))}
          </div>
        )}
      </div>

      <Rule className="mt-12" />
    </header>
  )
}
