import { useEffect, useRef, useState } from 'react'
import { Meta } from '../../lib/meta'
import { Rule, SectionNumber, JPLabel, RegMarks } from '../../components/motifs'
import { TLink } from '../../components/page-transition'
import { ArrowRight, Github, Globe } from '../../components/icons'
import DecryptedText from '../../components/react-bits/DecryptedText'
import { projects, type Project } from '../../content/projects'
import { revealCards } from '../../lib/reveals'
import { RedactedCard } from '../../components/redacted-card'

const featured = projects.filter((p) => p.featured)

const PHOTOS = ['/photos/profile1.JPG', '/photos/profile2.JPG', '/photos/profile3.JPG', '/photos/profile4.JPG', '/photos/profile5.JPG']

const DOSSIER = [
  { key: 'location', val: 'Finland' },
  { key: 'coding since', val: '2013' },
  { key: 'focus', val: 'AI infrastructure' },
  { key: 'cats', val: 'yes' },
  { key: 'status', val: '[REDACTED]' },
]

const PRINCIPLES = [
  'meaningful design first',
  'less is more',
  'ship fast, iterate faster',
  'build for the problem you have',
  'YAGNI',
]

const NOW = {
  text: 'goob, ØCLOAK, hardware on weekends',
  updated: '2026-07',
}

const OSS = [
  { org: 'Microsoft', project: 'DeepSpeed', what: 'type hints, changelog, warning fixes', prs: 'https://github.com/deepspeedai/DeepSpeed/pulls?q=author%3ANovusEdge' },
  { org: 'The AI Alliance', project: 'Tapestry', what: 'eval schema, CI fixes', prs: 'https://github.com/The-AI-Alliance/tapestry/pulls?q=author%3ANovusEdge' },
  { org: 'Microsoft', project: 'LightGBM', what: 'early contributions', prs: 'https://github.com/microsoft/LightGBM/pulls?q=author%3ANovusEdge' },
  { org: 'ROS-Industrial', project: 'ROSIN', what: 'industrial robotics components', prs: null },
]

function iconFor(href: string) {
  if (href.includes('github.com')) return Github
  return Globe
}

function PhotoCarousel() {
  const [idx, setIdx] = useState(0)
  const n = PHOTOS.length

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 3500)
    return () => clearInterval(id)
  }, [n])

  return (
    <div data-card className="relative h-64 w-64 shrink-0 self-start overflow-hidden rounded border border-charcoal/10 dark:border-bone/10">
      <RegMarks />
      {PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === idx ? 'Aliasgar Khimani' : ''}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {/* dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-gold' : 'w-1.5 bg-bone/50 hover:bg-bone/80'}`}
          />
        ))}
      </div>
    </div>
  )
}

function FeaturedCard({ p }: { p: Project }) {
  const angle = (p.slug.charCodeAt(0) * 37 + p.slug.charCodeAt(1) * 17) % 360
  const char = p.jp || p.title[0].toUpperCase()

  return (
    <div
      data-card
      className="relative flex h-64 flex-col justify-between overflow-hidden rounded border border-charcoal/10 bg-bone-tint/20 p-6 dark:border-bone/10 dark:bg-charcoal-tint/20"
    >
      <RegMarks />
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.05]"
        style={{ background: `linear-gradient(${angle}deg, var(--gold) 0%, transparent 70%)` }}
      >
        <span className="select-none font-display text-[6rem] font-black">{char}</span>
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal/50 dark:text-bone/50">
          <span className="rounded border border-gold/50 px-1.5 py-0.5 text-gold">{p.phase}</span>
          <span>{p.year}</span>
          {p.lang && <span>{p.lang}</span>}
        </div>
        <h3 className="mt-3 flex items-baseline gap-2 font-display text-2xl font-black text-charcoal dark:text-bone">
          {p.title}
          {p.jp && <span className="font-display text-sm font-normal text-charcoal/25 dark:text-bone/25">{p.jp}</span>}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/70 dark:text-bone/70">{p.description}</p>
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        {p.links.map((l) => {
          const Icon = iconFor(l.href)
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-charcoal/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-charcoal/70 transition-colors hover:border-gold hover:text-gold dark:border-bone/15 dark:text-bone/70"
            >
              <Icon className="h-3.5 w-3.5" /> {l.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const scope = useRef<HTMLElement>(null)
  useEffect(() => revealCards(scope.current), [])

  return (
    <>
      <Meta title="About" description="Aliasgar Khimani - systems architect building cognitive infrastructure for AI agents." />
      <section ref={scope} className="relative mx-auto max-w-4xl px-6 pb-24 pt-36">

        {/* 00 - Header */}
        <div className="flex flex-col gap-6">
          <div className="relative">
            <SectionNumber n="00" label="about" />
            <div className="relative mt-3 w-fit">
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
                <JPLabel>私</JPLabel>
                <span aria-hidden className="h-4 w-px bg-gold/50" />
              </div>
              <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
                <DecryptedText text="About" speed={50} delay={100} />
              </h1>
            </div>
          </div>
          <Rule className="mt-4" />
        </div>

        {/* 01 - Bio + Photo + Dossier */}
        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto]">
          <div data-card className="space-y-6 text-lg leading-relaxed text-charcoal/80 dark:text-bone/80">
            <p>
              I'm <strong className="text-charcoal dark:text-bone">Aliasgar Khimani</strong>, a systems architect based in Finland.
              I build cognitive infrastructure for AI agents - memory systems that know what they know versus what they merely generated.
            </p>
            <p>
              Started in offensive security (CTFs, malware dev, breaking things), now building things that are harder to break.
              Most of my work lives at the intersection of AI, systems, and hardware.
            </p>
          </div>

          {/* Photo carousel */}
          <PhotoCarousel />
        </div>

        {/* Dossier strip */}
        <div data-card className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-charcoal/10 py-4 font-mono text-sm dark:border-bone/10">
          {DOSSIER.map((d) => (
            <span key={d.key} className="text-charcoal/60 dark:text-bone/60">
              <span className="text-charcoal/40 dark:text-bone/40">{d.key}:</span>{' '}
              <span className={d.val === '[REDACTED]' ? 'text-gold' : ''}>{d.val}</span>
            </span>
          ))}
        </div>

        {/* 02 - Principles */}
        <div className="mt-12">
          <h2 data-card className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-charcoal/40 dark:text-bone/40">01</span>
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">Operating Principles</span>
          </h2>
          <ul data-card className="mt-4 space-y-2">
            {PRINCIPLES.map((p, i) => (
              <li key={i} className="flex items-center gap-3 font-mono text-base text-charcoal/70 dark:text-bone/70">
                <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Now status */}
        <div data-card className="mt-6 flex items-baseline gap-3 font-mono text-sm">
          <span className="rounded bg-gold/10 px-2 py-1 text-gold">now</span>
          <span className="text-charcoal/70 dark:text-bone/70">{NOW.text}</span>
          <span className="text-charcoal/30 dark:text-bone/30">({NOW.updated})</span>
        </div>

        {/* 03 - Building Now */}
        <div className="mt-16">
          <div data-card className="mb-6 flex items-baseline justify-between">
            <h2 className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-charcoal/40 dark:text-bone/40">02</span>
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">Building Now</span>
            </h2>
            <TLink
              to="/portfolio"
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-charcoal/60 transition-colors hover:text-gold dark:text-bone/60"
            >
              <span className="link-draw">all projects</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </TLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((p) => (
              <FeaturedCard key={p.slug} p={p} />
            ))}
            <RedactedCard />
          </div>
        </div>

        {/* 04 - OSS */}
        <div className="mt-16">
          <h2 data-card className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-charcoal/40 dark:text-bone/40">03</span>
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-gold">Open Source</span>
          </h2>
          <div className="mt-6 space-y-1">
            {OSS.map((o) => (
              <div
                key={o.project}
                data-card
                className="group flex items-center justify-between border-b border-charcoal/10 py-4 dark:border-bone/10"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg font-bold text-charcoal transition-colors group-hover:text-gold dark:text-bone">{o.project}</span>
                  <span className="text-sm text-charcoal/50 dark:text-bone/50">{o.org}</span>
                  <span className="hidden text-sm text-charcoal/40 sm:inline dark:text-bone/40">- {o.what}</span>
                </div>
                {o.prs && (
                  <a
                    href={o.prs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-sm text-charcoal/50 transition-colors hover:text-gold dark:text-bone/50"
                  >
                    <Github className="h-4 w-4" />
                    <span className="hidden sm:inline">view PRs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 05 - CTA */}
        <div data-card className="mt-20 rounded border border-gold/30 bg-gold/5 p-6">
          <p className="text-lg text-charcoal/80 dark:text-bone/80">
            Open to interesting problems - AI infrastructure, distributed systems, or anything that makes computers have opinions.
          </p>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-gold transition-colors hover:text-gold/80"
          >
            @
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
